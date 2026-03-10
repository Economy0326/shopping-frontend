import axiosLib from "axios";
import { API_ROOT } from "shared/config/env";
import { getAccessToken, clearToken } from "shared/api/tokenMemory";
import { authEvents } from "shared/api/authEvents";

export const api = axiosLib.create({
  baseURL: API_ROOT,        // ex) http://localhost:8080/api/v1
  withCredentials: true,    // refresh cookie 포함
  headers: { "Content-Type": "application/json" },
});

let alreadyEmitted = false;

let loggedOut = false;
export const markLoggedOut = (v) => {
  loggedOut = !!v;
};

// AccessToken 자동 첨부
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

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

api.interceptors.response.use(
  (res) => {
    alreadyEmitted = false;
    return res;
  },
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const url = String(originalRequest?.url ?? "");

    if (!originalRequest || status == null) {
      return Promise.reject(error);
    }

    // silentAuth는 헤더로 판별 (custom field 의존 X)
    const silentAuth = originalRequest?.headers?.["x-silent-auth"] === "1";

    // emitAutRequired => 이미 emit 했거나, silentAuth인 경우, loggedOut인 경우는 emit 안함
    const emitAuthRequired = () => {
      if (silentAuth) return;
      if (alreadyEmitted) return;
      alreadyEmitted = true;
      clearToken();
      authEvents.emit("AUTH_REQUIRED", { silent: false, from: url });
    };

    // 로그아웃 중에는 auth required 이벤트 emit 안함 (ex: refresh 실패 후)
    if (loggedOut) {
      return Promise.reject(error);
    }

    // refresh 실패 — AUTH_REQUIRED 이벤트 발생
    if (url.includes("/auth/refresh") && status === 401) {
      emitAuthRequired();
      return Promise.reject(error);
    }

    // 일반 401에서는 자동으로 리프레시 x
    if (status === 401) {
      emitAuthRequired();
    }

    return Promise.reject(error);
  }
);
