import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

const toQS = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

export const AdminOrdersAPI = {
  list(params = {}) {
    return request(`${ADMIN.ORDERS.ROOT}${toQS(params)}`);
  },
  get(id) {
    return request(ADMIN.ORDERS.ID(id));
  },
  confirmDeposit(id) {
    return request(ADMIN.ORDERS.DEPOSIT(id), { method: "POST" });
  },
  ship(id, payload) {
    return request(ADMIN.ORDERS.SHIP(id), { method: "POST", body: payload });
  },
  refund(id, payload) {
    return request(ADMIN.ORDERS.REFUND(id), { method: "POST", body: payload });
  },
  cancelApprove(id) {
    return request(ADMIN.ORDERS.CANCEL_APPROVE(id), { method: "POST" });
  },
  cancelReject(id) {
    return request(ADMIN.ORDERS.CANCEL_REJECT(id), { method: "POST" });
  },
};
