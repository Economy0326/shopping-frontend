import { request } from "../lib/request";

// 공용 멱등키 헤더
const idemHeaders = () => ({
  "Idempotency-Key":
    (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
});

// 쿼리스트링 헬퍼(GET에 body 넣지 않기)
const toQS = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

export const OrdersAPI = {
  // 체크아웃(주문 생성, 무통장 입금 대기)
  // 최종 스펙이 /api/checkout 이므로 여기로 정리
  checkout(payload) {
    return request(`/api/checkout`, {
      method: "POST",
      body: payload,
      headers: idemHeaders(),
    });
  },

  // (호환용) 과거 코드에서 create()를 쓰고 있다면 checkout으로 라우팅
  create(order) {
    return this.checkout(order);
  },

  // ✅ 주문 상세
  get(id) {
    return request(`/api/orders/${id}`);
  },

  // ✅ 주문 목록 (페이지/정렬/검색/필터)
  // params: { page, size, status, dateFrom, dateTo, q, sort, order }
  list(params = {}) {
    return request(`/api/orders${toQS(params)}`);
  },

  // ✅ 구매 확정(멱등키 권장)
  confirm(id, note) {
    return request(`/api/orders/${id}/confirm`, {
      method: "POST",
      headers: idemHeaders(),
      body: note ? { note } : undefined,
    });
  },

  // ❌ 서버 상태 임의 변경 PATCH는 스펙에서 제외 (상태머신은 전용 액션으로)
  // patch(id, patch) { ... }  // 제거

  // ❌ listMine/listAdmin 커스텀 파라미터는 삭제
  //  - 본인 주문은 Auth로 식별
  //  - 어드민 목록은 /api/admin/... 별도 래퍼에서
};
