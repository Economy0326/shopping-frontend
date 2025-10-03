import axios from "axios";
import { API_ROOT } from "./env";
import { AUTH } from "../constants/apiRoutes";
import { getAccessToken, setAccessToken, clearAccessToken, getRefreshToken, clearRefreshToken } from "./token";

export const api = axios.create({
  baseURL: API_ROOT,      // 예: http://localhost:8080/api/v1
  withCredentials: true,  // refresh 쿠키 주고받기
});

// ====== 요청 인터셉터: Access 토큰 Bearer 헤더 ======
api.interceptors.request.use((config) => {
  const t = getAccessToken();

  // 로그인/회원가입 요청에는 Authorization 붙이지 않음
  const url = String(config?.url || "").toLowerCase();
  if (t && !url.includes("/auth/login") && !url.includes("/auth/register")) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
  }
  return config;
});


// ====== 응답 인터셉터: 401 → refresh → 재시도 ======
let refreshing = false;
let waiters = [];
const wakeAll = (ok) => { waiters.forEach(({resolve,reject}) => ok?resolve():reject()); waiters = []; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response) throw error;

    const status = response.status;
    const url = String(config?.url || "").toLowerCase();

    // 로그인/리프레시 자체 에러거나 이미 재시도한 요청이면 통과
    if (status !== 401 || config.__retry || url.includes("/auth/login") || url.includes("/auth/refresh")) {
      throw error;
    }

    if (!refreshing) {
      refreshing = true;
      try {
        // 백엔드 실제 경로 /auth/refresh
        // 바디로 refreshToken을 요구하는 서버도 커버
        const rt = getRefreshToken();
        const payload = rt ? { refreshToken: rt } : undefined;
        const r = await api.post(AUTH.REFRESH, payload);
        
        const newAccess = r?.data?.accessToken;
        if (!newAccess) throw new Error("No accessToken from refresh");
        setAccessToken(newAccess);
        refreshing = false;
        wakeAll(true);
      } catch (e) {
        refreshing = false;
        wakeAll(false);
        clearAccessToken();
        clearRefreshToken();
        throw e;
      }
    } else {
      await new Promise((resolve, reject) => waiters.push({ resolve, reject }));
    }

    return api({ ...config, __retry: true });
  }
);

// ====== 호환용: request 래퍼 (예전 코드 그대로 쓸 수 있게) ======
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

// ====== 호환용: 에러 메시지 헬퍼 ======
export const getAxiosErrorMessage = (err, fallback = "요청 중 오류가 발생했습니다") => {
  if (err?.payload?.message) return err.payload.message;
  if (err?.payload?.error) return err.payload.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return fallback;
};
