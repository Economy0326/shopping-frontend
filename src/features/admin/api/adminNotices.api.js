import { request } from "shared/api/request";
import { NOTICES } from "shared/api/endpoints";

export const AdminNoticesAPI = {
  list(params = {}) {
    return request(NOTICES.ROOT, { params });
  },
  get(id) {
    return request(NOTICES.BY_ID(id));
  },
  create(body) {
    return request(NOTICES.ROOT, { method: "POST", body });
  },
  update(id, body) {
    return request(NOTICES.BY_ID(id), { method: "PUT", body });
  },
  remove(id) {
    return request(NOTICES.BY_ID(id), { method: "DELETE" });
  },
};