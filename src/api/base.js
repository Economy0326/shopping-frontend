import axios from "axios";
import { E } from "../lib/env";

export const api = axios.create({
  baseURL: E.API_BASE || "http://localhost:8080",
  withCredentials: true, // JWT 쿠키 주고받기
});

// 401 → refresh → 원요청 재시도
let refreshing = false;
let waiters = [];
const wakeAll = (ok) => { waiters.forEach(({resolve,reject}) => ok?resolve():reject()); waiters=[]; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response) throw error;

    const url = String(config?.url || "").toLowerCase();
    if (response.status !== 401 || url.includes("/auth/login") || url.includes("/auth/refresh")) {
      throw error;
    }
    if (config.__retry) throw error;

    if (!refreshing) {
      refreshing = true;
      try {
        await api.post("/api/auth/refresh");
        refreshing = false;
        wakeAll(true);
      } catch (e) {
        refreshing = false;
        wakeAll(false);
        throw e;
      }
    } else {
      await new Promise((resolve,reject)=>waiters.push({resolve,reject}));
    }

    const retry = { ...config, __retry: true };
    return api(retry);
  }
);
