import { request } from "shared/api/request";
import { RETURNS, ORDERS, ADMIN } from "shared/api/endpoints";

export const ReturnsAPI = {
  // 유저 반품 목록
  listMine(params) {
    return request(RETURNS.ROOT, { params });
  },

  // 유저 반품 상세
  getMine(returnId) {
    return request(RETURNS.ID(returnId));
  },

  // 유저 반품 신청
  requestReturn(orderId, payload) {
    return request(ORDERS.RETURN(orderId), {
      method: "POST",
      body: payload, // { reason, memo }
    });
  },

  // 관리자 반품 목록/승인/거절 (그대로)
  listAdmin(params) {
    return request(ADMIN.RETURNS.ROOT, { params });
  },
  approve(returnId, memo) {
    return request(ADMIN.RETURNS.APPROVE(returnId), {
      method: "POST",
      body: memo ? { memo } : undefined,
    });
  },
  reject(returnId, reason) {
    return request(ADMIN.RETURNS.REJECT(returnId), {
      method: "POST",
      body: { reason },
    });
  },
};
