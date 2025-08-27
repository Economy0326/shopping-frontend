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

// 유틸: 중첩 필드(예: shipping) 안전 병합
const mergeOrder = (prev, patch) => {
  if (!patch) return prev;
  return {
    ...prev,
    ...patch,
    shipping: { ...(prev?.shipping || {}), ...(patch?.shipping || {}) },
  };
};

export function OrderProvider({ children }) {
  const useApi = !!E.API_BASE;

  // 로컬 모드에서만 상태/동기화
  const [orders, setOrders] = useState(() => (useApi ? [] : readLS()));

  useEffect(() => {
    if (!useApi) setOrders(readLS());
  }, [useApi]);

  useEffect(() => {
    if (!useApi) writeLS(orders);
  },[orders, useApi]);

  //API/로컬 공통 인터페이스 (useCallback으로 안정화)
  const createOrder = useCallback(async (order) => {
    if(!useApi) {
      const id = `ORD-${Date.now()}`;
      const next = mergeOrder(
        { id, status: "pending", createdAt: new Date().toISOString(), total: Number(order?.total || 0) },
        order
      );
      setOrders((prev) => [next, ...prev]);
      return{ id };
    }
    return OrdersAPI.create(order);
  }, [useApi]);

  const getOrder = useCallback(async (id) => {
    if(!useApi) {
      return orders.find((o) => o.id === id) || null;
    }
    return OrdersAPI.get(id);
  }, [useApi, orders]);

  const updateOrder = useCallback(async (id, patch) => {
    if (!useApi) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? mergeOrder(o, patch) : o))
      );
      return { ok: true };
    }
    return OrdersAPI.patch(id, patch);
  }, [useApi]);

  const listMyOrders = useCallback(async (cursor, q, limit) => {
    if (!useApi) {
      return { items: orders, nextCursor: null };
    }
    return OrdersAPI.listMine(cursor, q, limit);
  }, [useApi, orders]);

  const listAdminOrders = useCallback(async ({ q, cursor, limit, status } = {}) => {
    if (!useApi) {
      return { items: [], nextCursor: null };
    }
    return OrdersAPI.listAdmin({ q, cursor, limit, status });
  }, [useApi]);
  
  // ── Context value: useMemo로 제공 ───────────────
  const value = useMemo(() => ({
    createOrder,
    getOrder,
    updateOrder,
    listMyOrders,
    listAdminOrders,
    isApi: useApi,
    _localOrders: orders, // 디버깅용(선택)
  }), [createOrder, getOrder, updateOrder, listMyOrders, listAdminOrders, useApi, orders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}