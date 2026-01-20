import { api } from "shared/api/httpClient";

// axios 직접 호출 금지
export async function request(path, options = {}) {
  const { method = "GET", params, body, headers = {}, silentAuth = false } = options;

  const finalHeaders = { ...headers };

  // silentAuth는 axios custom field 말고 헤더로 태그 박기
  if (silentAuth) finalHeaders["x-silent-auth"] = "1";

  const reqConfig = {
    url: path,
    method,
    params,
    headers: finalHeaders,
  };

  // body가 명시적으로 제공된 경우에만 data 필드를 포함
  if (body !== undefined) {
    reqConfig.data = body;
  }

  const res = await api.request(reqConfig);

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
