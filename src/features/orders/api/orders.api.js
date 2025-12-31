import { request } from "shared/api/request";
import { ORDERS } from "shared/api/endpoints";
import { idemHeaders } from "shared/utils/idempotency";

export const OrdersAPI = {
  // POST /orders
  checkout(payload) {
    return request(ORDERS.ROOT, {
      method: "POST",
      headers: idemHeaders(),
      body: payload,
    });
  },

  // GET /orders (로그인 필요)
  list(params = {}) {
    return request(ORDERS.ROOT, { params });
  },

  // GET /orders/{id}
  get(id) {
    return request(ORDERS.ID(id));
  },

  // POST /orders/{id}/confirm
  confirm(id, note) {
    return request(ORDERS.CONFIRM(id), {
      method: "POST",
      headers: idemHeaders(),
      body: note ? { note } : undefined,
    });
  },

  // POST /orders/{id}/cancel-request
  cancelRequest({ orderId, reason, memo }) {
    return request(ORDERS.CANCEL(orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: { reason, memo: memo ?? "" },
    });
  },

  // POST /orders/{id}/return-request
  returnRequest({ orderId, reason, memo }) {
    return request(ORDERS.RETURN(orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: { reason, memo: memo ?? "" },
    });
  },

  // GET /orders/{id}/tracking (선택)
  track(id) {
    return request(ORDERS.TRACK(id));
  },
};