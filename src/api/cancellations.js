import { request } from "../lib/request";

// 공용 멱등키 헤더
const idemHeaders = () => ({
  "Idempotency-Key":
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
});

/**
 * 호환용 취소 API 어댑터
 * - list: 서버가 전용 취소리스트가 없으면 주문목록을 상태필터로 대체
 * - request: 주문 취소 요청 엔드포인트로 위임
 * - detail: 주문 상세 재사용
 */
export const CancellationsAPI = {
  // 서버가 취소요청 전용 리스트를 제공하지 않는 경우,
  // 주문 목록에서 상태 필터로 대체 (백엔드에 맞게 코드/파라미터 조정 가능)
  list: (params = {}) =>
    request.get("/api/orders", { ...params, status: "CANCEL_REQUESTED" }),

  // 취소 요청 생성
  request: ({ orderId, reason, memo }) =>
    request.post(`/api/orders/${orderId}/cancel`, { reason, memo }, idemHeaders()),

  // 상세는 주문 상세를 그대로 사용
  detail: (orderId) => request.get(`/api/orders/${orderId}`),
};

// 기본/대체 이름까지 모두 export (파일마다 import 이름이 다를 수 있어 호환)
export const CancellationAPI = CancellationsAPI;
export default CancellationsAPI;
