import { authEvents } from "./authEvents";
import { API_ROOT } from "shared/config/env";          // 너 env.js에서 export한 API_ROOT 사용
import { getAccessToken, clearToken } from "./tokenMemory";
import axiosLib from "axios";

export const api = axiosLib.create({
  baseURL: API_ROOT,         // 예: http://localhost:8080/api/v1
  withCredentials: true,     // HttpOnly 쿠키 포함(Refresh 쿠키가 자동으로 같이 감)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: AccessToken 자동 헤더 부착
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 처리 -> 전역 이벤트
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    // refresh 재발급 루프 없음: 401이면 "재로그인 필요"로 처리
    if (status === 401) {
      clearToken(); // accessToken만 비움(메모리)
      authEvents.emit("AUTH_REQUIRED");
    }

    return Promise.reject(error);
  }
);