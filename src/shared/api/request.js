import { api } from "shared/api/httpClient";

// 프론트는 axios 직접 호출 금지
export async function request(path, options = {}) {
  const {
    method = "GET",
    params,
    body,
    headers,
  } = options;

  const res = await api.request({
    url: path,
    method,
    params, //쿼리스트링 자동으로 처리
    data: body, //POST, PUT 등일 때 body로 전달
    headers,
  });

  return res.data;  // 서버 응답 전체(JSON) 반환
}

export function getApiErrorMessage(err, fallback = "요청 실패") {
  // 명세: { error: { code, message, details } }
  const apiMsg = err?.response?.data?.error?.message;

  // 예전 호환(혹시 남아있을 수 있는 형태)
  const legacyMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  return apiMsg || legacyMsg || fallback;
}

