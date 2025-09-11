import { request } from "../lib/request";
const idem = () => ({
  "Idempotency-Key": (crypto?.randomUUID?.() || String(Date.now()))
});

export const ReturnsAPI = {
  // 선택: 서버가 목록도 제공한다면
  list: (params = {}) => request.get("/api/returns", params),

  // 명세 핵심: 생성
  create: ({ orderId, lineItems, reason, memo, images }) =>
    request.post("/api/returns",
      { orderId, lineItems, reason, memo, images },
      idem()
    ),
};
