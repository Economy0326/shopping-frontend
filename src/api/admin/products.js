import { api } from "../../lib/request";       // axios 인스턴스 (withCredentials: true)
import { request } from "../../lib/request";   // JSON 요청용

// 멱등키 (선택)
const idem = () => ({
  "Idempotency-Key":
    (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
});

export const AdminProductsAPI = {
  // 이미지 업로드 (multipart) → { url, name }
  // 주의: multipart는 request() 대신 api.post() 사용(헤더 자동 설정)
  uploadImage: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("ADMIN.UPLOADS", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // { url, name }
  },

  // 상품 생성
  create: (payload) =>
    request.post("/api/admin/products", payload, idem()),

  // 상품 수정
  update: (id, payload) =>
    request.put(`/api/admin/products/${id}`, payload, idem()),

  // (선택) 목록/상세 - 필요시 사용
  list: (params) => request.get("/api/admin/products", params),
  detail: (id) => request.get(`/api/admin/products/${id}`),
};
