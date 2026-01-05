import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

export const AdminOrdersAPI = {
  // GET /admin/orders
  list(params = {}) {
    return request(ADMIN.ORDERS.ROOT, { params });
  },

  // GET /admin/orders/{id}
  get(id) {
    return request(ADMIN.ORDERS.ID(id));
  },

  // POST /admin/orders/{id}/deposit-confirm (memo optional)
  depositConfirm(id, payload) {
    return request(ADMIN.ORDERS.DEPOSIT(id), { method: "POST", body: payload });
  },

  // POST /admin/orders/{id}/ship (carrier/trackingNo)
  ship(id, payload) {
    return request(ADMIN.ORDERS.SHIP(id), { method: "POST", body: payload });
  },

  // POST /admin/orders/{id}/refund-log
  refund(id, payload) {
    return request(ADMIN.ORDERS.REFUND(id), { method: "POST", body: payload });
  },

  // POST /admin/orders/{id}/deliver
  deliver(id) {
    return request(ADMIN.ORDERS.DELIVER(id), { method: "POST" });
  },
};
