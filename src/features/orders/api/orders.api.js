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
  get(id, params = {}) {
    return request(ORDERS.ID(id), { params });
  },

  // POST /orders/guest/lookup
  guestLookup({ orderId, phone }) {
    return request(ORDERS.GUEST_LOOKUP, {
      method: "POST",
      body: { orderId, phone },
    });
  },

  // POST /orders/{id}/confirm
  confirm(id, payload = {}) {
    return request(ORDERS.CONFIRM(id), {
      method: "POST",
      headers: idemHeaders(),
      body: payload,
    });
  },

  // POST /orders/{id}/cancel-request
  cancelRequest({ orderId, reason, memo, phone }) {
    return request(ORDERS.CANCEL(orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: {
        reason,
        memo: memo ?? "",
        ...(phone ? { phone } : {}),
      },
    });
  },

  // POST /orders/{id}/return-request
  returnRequest({ orderId, reason, memo, phone }) {
    return request(ORDERS.RETURN(orderId), {
      method: "POST",
      headers: idemHeaders(),
      body: {
        reason,
        memo: memo ?? "",
        ...(phone ? { phone } : {}),
      },
    });
  },

  // GET /orders/{id}/tracking
  track(id) {
    return request(ORDERS.TRACK(id));
  },
};