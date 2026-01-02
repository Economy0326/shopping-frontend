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
};
