import { request } from "shared/api/request";
import { NOTICES } from "shared/api/endpoints";

export const NoticeAPI = {
  list: ({ page = 1, size = 10 } = {}) =>
    request(NOTICES.ROOT, { params: { page, size } }),

  get: (id) => request(NOTICES.BY_ID(id)),

  // 관리자용
  create: (body) => request(NOTICES.ROOT, { method: "POST", body }),
  update: (id, body) => request(NOTICES.BY_ID(id), { method: "PUT", body }),
  remove: (id) => request(NOTICES.BY_ID(id), { method: "DELETE" }),
};
