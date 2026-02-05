import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

export const AdminNoticesAPI = {
  list(params = {}) {
    return request(ADMIN.NOTICES.ROOT, { params });
  },
  get(id) {
    return request(ADMIN.NOTICES.ID(id));
  },
  create(body) {
    return request(ADMIN.NOTICES.ROOT, { method: "POST", body });
  },
  update(id, body) {
    return request(ADMIN.NOTICES.ID(id), { method: "PUT", body });
  },
  remove(id) {
    return request(ADMIN.NOTICES.ID(id), { method: "DELETE" });
  },
};