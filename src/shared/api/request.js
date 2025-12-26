import { api } from "shared/api/httpClient";

export async function request(path, options = {}) {
  const {
    method = "GET",
    params,
    body,
    headers,
    // 필요하면 timeout, signal 등도 옵션으로 확장 가능
  } = options;

  const res = await api.request({
    url: path,
    method,
    params,
    data: body,
    headers,
  });

  return res.data;
}

export function getAxiosErrorMessage(err, fallback = "요청 실패") {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;
  return msg || fallback;
}
