// src/api/admin/orders.js
import { request } from "../../lib/request";

const idem = () => ({ "Idempotency-Key": (crypto?.randomUUID?.() || String(Date.now())) });

export const AdminOrdersAPI = {
  // (선택) 운영 목록 조회: 필터/검색 등
  list: (params) => request.get("/api/admin/orders", { params }),

  depositConfirm: (orderId, body) =>
    request.post(`/api/admin/orders/${orderId}/deposit-confirm`, body, { headers: idem() }),

  ship: (orderId, body) =>
    request.post(`/api/admin/orders/${orderId}/ship`, body, { headers: idem() }),

  cancelApprove: (orderId, body) =>
    request.post(`/api/admin/orders/${orderId}/cancel-approve`, body, { headers: idem() }),

  cancelReject: (orderId, body) =>
    request.post(`/api/admin/orders/${orderId}/cancel-reject`, body, { headers: idem() }),

  returnApprove: (returnId, body) =>
    request.post(`/api/admin/returns/${returnId}/approve`, body, { headers: idem() }),

  returnReject: (returnId, body) =>
    request.post(`/api/admin/returns/${returnId}/reject`, body, { headers: idem() }),

  refundLog: (orderId, body) =>
    request.post(`/api/admin/orders/${orderId}/refund-log`, body, { headers: idem() }),
};
