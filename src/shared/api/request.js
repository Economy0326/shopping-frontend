import { api } from "shared/api/httpClient";

// axios 직접 호출 금지
export async function request(path, options = {}) {
  const { method = "GET", params, body, headers } = options;

  const res = await api.request({
    url: path,
    method,
    params,
    data: body,
    headers,
  });

  // 서버 JSON 그대로 반환: { data, meta } 또는 { error } 등
  return res.data;
}

export function getApiErrorMessage(err, fallback = "요청 실패") {
  const apiMsg = err?.response?.data?.error?.message;
  const legacyMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  return apiMsg || legacyMsg || fallback;
}