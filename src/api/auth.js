import { request } from "../lib/request";

export const AuthAPI = {
  // 회원가입
  register: (payload) =>
    request.post("/api/auth/register", payload),

  // 로그인 (백엔드가 usernameOrEmail을 받는다면 그 키로 보내기)
  login: (payload) =>
    request.post("/api/auth/login", payload),

  // 현재 사용자
  me: () => request.get("/api/auth/me"),

  // 로그아웃
  logout: () => request.post("/api/auth/logout"),

  // 비번 재설정(요청/확정)
  resetRequest: (email) =>
    request.post("/api/auth/password-reset/request", { email }),

  resetConfirm: (payload) =>
    request.post("/api/auth/password-reset/confirm", payload),

  // 🔁 토큰 갱신 (쿠키 기반이면 바디 없음)
  refresh: () => request.post("/api/auth/refresh"),
};
