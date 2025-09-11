import axios from "axios";
import { API_BASE } from "./env";


// 공용 axios 인스턴스
export const api = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,  //jwt 쿠키 주고받기
  headers: { "Content-Type": "application/json" },
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

    // 로그인/리프레시 요청 자체의 401은 재시도 금지
    if (status !== 401 || url.includes("/auth/login") || url.includes("/auth/refresh")) {
      throw err;
    }
    if (config.__retry) throw err; // 무한루프 방지

    // 동시 401 큐 처리
    if (!refreshing) {
      refreshing = true;
      try {
        await api.post("/api/auth/refresh"); // 서버가 새 JWT 쿠키를 세팅
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

    // 원요청 재시도
    const retry = { ...config, __retry: true };
    return api(retry);
  }
);


// 통일된 요청 래퍼
export async function request(
  path,
  { method = "GET", body, headers, params } = {}
) {
  if (!API_BASE) {
    const e = new Error("API_BASE not set");
    e.status = 0;
    throw e;
  }
  const m = (method || "GET").toUpperCase();

  try {
    const res = await api.request({
      url: path,
      method: m,
      headers: { ...(headers || {}) },
      // GET 은 params, 나머지는 data 로 보냄
      data: m === "GET" ? undefined : body,
      params: m === "GET" ? (params ?? body) : params,
    });
    return res?.data ?? null;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const message =
        (data && (data.message || data.error)) || `HTTP ${status}`;
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

// 슈가 메서드
request.get    = async (url, params)             => (await api.get(url, { params })).data;
request.post   = async (url, body, headers)      => (await api.post(url, body, { headers })).data;
request.put    = async (url, body, headers)      => (await api.put(url, body, { headers })).data;
request.patch  = async (url, body, headers)      => (await api.patch(url, body, { headers })).data;
request.delete = async (url, params)             => (await api.delete(url, { params })).data;


// 에러 메시지 헬퍼
export const getAxiosErrorMessage = (
  err,
  fallback = "요청 중 오류가 발생했습니다"
) => {
  if (err?.payload?.error) return err.payload.error;
  if (err?.payload?.message) return err.payload.message;
  if (err?.message) return err.message;
  return fallback;
};
