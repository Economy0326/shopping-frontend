import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

export const AdminReturnsAPI = {
  list(params = {}) {
    return request(ADMIN.RETURNS.ROOT, { params });
  },
  approve(id, body) {
    return request(ADMIN.RETURNS.APPROVE(id), { method: "POST", body });
  },
  reject(id, body) {
    return request(ADMIN.RETURNS.REJECT(id), { method: "POST", body });
  },
};
