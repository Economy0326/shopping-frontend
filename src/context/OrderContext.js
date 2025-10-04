import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { E } from "../lib/env";
import { OrdersAPI } from "../api/orders";

const OrderContext = createContext(null);
export const useOrders = () => useContext(OrderContext);

const LS_KEY = "orders.v1";

// localStorage helpers
const readLS = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
};
const writeLS = (rows) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }
  catch {}
};

// 중첩 병합(로컬 모드용)
const mergeOrder = (prev, patch) => {
  if (!patch) return prev;
  return {
    ...prev,
    ...patch,
    shipping: { ...(prev?.shipping || {}), ...(patch?.shipping || {}) },
  };
};

export function OrderProvider({ children }) {
  // E.API_BASE 기본값이 항상 존재한다면 로컬 모드가 안 켜지니,
  // 꼭 로컬 모드를 쓰고 싶다면 .env에서 REACT_APP_API_BASE를 비워두거나 falsey로 설정해줘.
  const useApi = !!E.API_BASE;

  // 로컬 모드에서만 상태/동기화
  const [orders, setOrders] = useState(() => (useApi ? [] : readLS()));

  useEffect(() => {
    if (!useApi) setOrders(readLS());
  }, [useApi]);

  useEffect(() => {
    if (!useApi) writeLS(orders);
  }, [orders, useApi]);

  /** 주문 생성 */
  const createOrder = useCallback(async (order) => {
    if (!useApi) {
      const id = `ORD-${Date.now()}`;
      const next = mergeOrder(
        { id, status: "PENDING_PAYMENT", createdAt: new Date().toISOString(), total: Number(order?.total || 0) },
        order
      );
      setOrders((prev) => [next, ...prev]);
      return { id };
    }
    // A안: 주문 생성은 checkout
    return OrdersAPI.checkout(order);
  }, [useApi]);

  /** 주문 상세 */
  const getOrder = useCallback(async (id) => {
    if (!useApi) {
      return orders.find((o) => String(o.id) === String(id)) || null;
    }
    return OrdersAPI.get(id);
  }, [useApi, orders]);

  /**
   * 주문 후처리 액션 (API 모드용 라우팅)
   * - { action: "confirm", note? }
   * - { action: "cancel", reason, memo? }
   * - { action: "return", reason, memo? }
   */
  const updateOrder = useCallback(async (id, patch) => {
    if (!useApi) {
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(id) ? mergeOrder(o, patch) : o))
      );
      return { ok: true };
    }

    const a = patch?.action;
    if (a === "confirm") {
      return OrdersAPI.confirm(id, patch?.note);
    }
    if (a === "cancel") {
      return OrdersAPI.cancelRequest({ orderId: id, reason: patch?.reason, memo: patch?.memo });
    }
    if (a === "return") {
      return OrdersAPI.returnRequest({ orderId: id, reason: patch?.reason, memo: patch?.memo });
    }
    // 그 외 patch는 현재 스펙에 없음
    throw new Error("Unsupported update action");
  }, [useApi]);

  /**
   * 내 주문 목록
   * - 서버가 인증된 사용자 기준으로 /orders 를 돌려준다는 전제
   * - cursor 대신 page/size로 변환해서 { items, nextCursor } 형태로 맞춰서 반환
   */
  const listMyOrders = useCallback(async (cursor, q, limit) => {
    if (!useApi) {
      return { items: orders, nextCursor: null };
    }
    const page = cursor?.page ?? 1;
    const size = limit ?? 10;

    const res = await OrdersAPI.list({ page, size, q, sort: "createdAt", order: "desc" });
    const items = res?.content ?? res ?? [];
    const hasNext =
      typeof res?.totalPages === "number" && typeof res?.number === "number"
        ? res.number + 1 < res.totalPages
        : !!res?.meta?.hasNext;

    return {
      items,
      nextCursor: hasNext ? { page: page + 1 } : null,
    };
  }, [useApi, orders]);

  /**
   * 어드민 주문 목록: 별도 Admin API를 쓰는 게 정석.
   * 여기선 안전하게 빈 결과를 돌려주거나, 필요 시 AdminOrdersAPI로 교체하세요.
   */
  const listAdminOrders = useCallback(async (_opts = {}) => {
    if (!useApi) return { items: [], nextCursor: null };
    // TODO: AdminOrdersAPI.list(...) 로 교체
    return { items: [], nextCursor: null };
  }, [useApi]);

  const value = useMemo(() => ({
    createOrder,
    getOrder,
    updateOrder,
    listMyOrders,
    listAdminOrders,
    isApi: useApi,
    _localOrders: orders, // 디버깅용
  }), [createOrder, getOrder, updateOrder, listMyOrders, listAdminOrders, useApi, orders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
