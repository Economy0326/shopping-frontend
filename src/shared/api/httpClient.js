import axiosLib from "axios";
import { API_ROOT } from "shared/config/env";
import { getAccessToken, clearToken } from "./tokenMemory";
import { authEvents } from "./authEvents";

let alreadyEmitted = false;

export const api = axiosLib.create({
  baseURL: API_ROOT,        // ex) http://localhost:8080/api/v1
  withCredentials: true,    // refresh cookie 포함
  headers: { "Content-Type": "application/json" },
});

// AccessToken 자동 첨부
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FormData면 Content-Type 제거해서 boundary 자동
  if (config.data instanceof FormData) {
    config.headers = config.headers ?? {};
    delete config.headers["Content-Type"];
  } else {
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] =
      config.headers["Content-Type"] ?? "application/json";
  }

  return config;
});

// 401 처리: refresh 만료 → 재로그인 요구
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
    return Promise.reject(error);
  }
);