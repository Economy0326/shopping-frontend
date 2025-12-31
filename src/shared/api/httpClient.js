import { authEvents } from "./authEvents";
import { API_ROOT } from "shared/config/env";          // 너 env.js에서 export한 API_ROOT 사용
import { getAccessToken, clearToken } from "./tokenMemory";
import axiosLib from "axios";

// 재진입 방지 플래그
let alreadyEmitted = false;

// axios 인스턴스 생성
export const api = axiosLib.create({
  baseURL: API_ROOT,         // 예: http://localhost:8080/api/v1
  withCredentials: true,     // HttpOnly 쿠키 포함(Refresh 쿠키가 자동으로 같이 감)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor -> AccessToken 자동 헤더 부착
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // JSON이 기본. 단, FormData면 브라우저가 Content-Type을 설정하게 둔다.
  if (config.data instanceof FormData) {
    config.headers = config.headers ?? {};
    // FormData인 경우 Content-Type 헤더 제거 후 boundary 자동 설정
    delete config.headers["Content-Type"];
  } else {
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] = config.headers["Content-Type"] ?? "application/json";
  }

  return config;
});

// Response Interceptor -> 전역 이벤트
api.interceptors.response.use(
  (res) => {
    alreadyEmitted = false;
    return res;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && !alreadyEmitted) {
      alreadyEmitted = true;
      clearToken();
      authEvents.emit("AUTH_REQUIRED");
    }

    if (status === 403) console.warn("권한 없음");
    return Promise.reject(error);
  }
);