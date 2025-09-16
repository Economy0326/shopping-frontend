import axios from "axios";
import { AUTH } from "../constants/apiRoutes";

// 개발(프록시)에서는 "/"로, 배포에서는 REACT_APP_API_BASE 사용
const BASE =
  process.env.NODE_ENV === "development"
    ? "/"                              // 프록시 경유
    : (process.env.REACT_APP_API_BASE || "/");

// 공용 axios 인스턴스
export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,  // jwt 쿠키 주고받기
  // ⚠️ Content-Type은 요청별로 넣을 거라 여기선 지정하지 않음
});

// 401 자동 갱신 (쿠키 기반)
let refreshing = false;
let waiters = [];
const wakeAll = (ok) => {
  waiters.forEach(({ resolve, reject }) => (ok ? resolve() : reject()));
  waiters = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (!response) throw err;

    const status = response.status;
    const url = String(config?.url || "").toLowerCase();

    if (status !== 401 || url.includes("/auth/login") || url.includes("/auth/refresh") || config.__retry) {
      throw err;
    }

    if (!refreshing) {
      refreshing = true;
      try {
        await api.post("AUTH.REFRESH");
        refreshing = false;
        wakeAll(true);
      } catch (e) {
        refreshing = false;
        wakeAll(false);
        throw e;
      }
    } else {
      await new Promise((resolve, reject) => waiters.push({ resolve, reject }));
    }

    return api({ ...config, __retry: true });
  }
);

// ✅ 통일된 요청 래퍼 (FormData면 Content-Type 자동 처리)
export async function request(path, { method = "GET", body, headers, params } = {}) {
  const m = (method || "GET").toUpperCase();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const res = await api.request({
      url: path,
      method: m,
      headers: isForm ? headers : { "Content-Type": "application/json", ...(headers || {}) },
      data: m === "GET" ? undefined : body,
      params: m === "GET" ? (params ?? body) : params,
    });
    return res?.data ?? null;
  } catch (err) {
    if (err.response) {
      const { status, data, statusText } = err.response;
      const message = (data && (data.message || data.error)) || statusText || `HTTP ${status}`;
      const e = new Error(message);
      e.status = status;
      e.payload = data;
      throw e;
    }
    if (err.request) {
      const e = new Error("Network error");
      e.status = 0;
      throw e;
    }
    throw err;
  }
}

// ✅ 슈가 메서드도 래퍼를 타게 (에러 포맷 일관)
request.get    = (url, params)        => request(url, { method: "GET", params });
request.post   = (url, body, headers) => request(url, { method: "POST", body, headers });
request.put    = (url, body, headers) => request(url, { method: "PUT", body, headers });
request.patch  = (url, body, headers) => request(url, { method: "PATCH", body, headers });
request.delete = (url, params)        => request(url, { method: "DELETE", params });

// 에러 메시지 헬퍼 (axios/raw 모두 커버)
export const getAxiosErrorMessage = (err, fallback = "요청 중 오류가 발생했습니다") => {
  if (err?.payload?.message) return err.payload.message;
  if (err?.payload?.error) return err.payload.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return fallback;
};
