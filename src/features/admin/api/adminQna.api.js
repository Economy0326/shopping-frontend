import { request } from "shared/api/request";
import { ASKS } from "shared/api/endpoints";

export const AdminQnaAPI = {
  list(params = {}) {
    return request(ASKS.ROOT, { params });
  },
  get(id) {
    return request(ASKS.BY_ID(id));
  },
  reply(id, body) {
    return request(ASKS.REPLIES(id), { method: "POST", body });
  },
};