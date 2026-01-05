import { request } from "shared/api/request";
import { ASKS } from "shared/api/endpoints";

export const QnaAPI = {
  list: ({ page = 1, size = 10, status } = {}) =>
    request(ASKS.ROOT, { params: { page, size, status } }),

  get: (id) => request(ASKS.BY_ID(id)),

  create: (body) => request(ASKS.ROOT, { method: "POST", body }),

  // 관리자 답변
  reply: (id, body) => request(ASKS.REPLIES(id), { method: "POST", body }),
};
