/* 주문 후 처리 API(주문 목록, 주문 상세, 구매 확정, 주문 취소 요청(출고 전), 반품 신청(수령 후), (선택) 배송조회) */
import { request } from "shared/api/request";
import { ORDERS } from "shared/api/endpoints";
import { idemHeaders } from "shared/utils/idempotency";

/**
 * 쿼리스트링 헬퍼
 * GET 요청에 body 대신 URLSearchParams 사용
 */
// 쿼리스트링
const toQS = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

export const OrdersAPI = {
  // 주문 생성 
  checkout(payload) {
    return request(ORDERS.ROOT, {
      method: "POST",
      headers: idemHeaders(),
      body: payload,
    });
  },

  // 주문 목록
  list(params = {}) {
    return request(`${ORDERS.ROOT}${toQS(params)}`);
  },

  // 주문 상세
  get(id) {
    return request(ORDERS.ID(id));
  },

  // 구매 확정
  confirm(id, note) {
    return request(ORDERS.CONFIRM(id), {
      method: "POST",
      headers: idemHeaders(),
      body: note ? { note } : undefined,
    });
  },

  // 주문 취소 요청(출고 전) — payload: { orderId, reason, memo? }
  cancelRequest(payload) {
    return request(ORDERS.CANCEL(payload.orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: { reason: payload.reason, memo: payload.memo ?? "" },
    });
  },

  // 반품 신청(수령 후) — payload: { orderId, reason, memo? }
  returnRequest(payload) {
    return request(ORDERS.RETURN(payload.orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: { reason: payload.reason, memo: payload.memo ?? "" },
    });
  },

  // (선택) 배송 조회 — 서버에서 제공할 때만 사용
  track(id) {
    return request(ORDERS.TRACK(id));
  },
};