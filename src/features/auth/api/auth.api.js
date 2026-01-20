import { request } from "shared/api/request";
import { AUTH } from "shared/api/endpoints";
import { clearToken } from "shared/api/tokenMemory";
import { markLoggedOut } from "shared/api/httpClient";

export const AuthAPI = {
  async login({ email, password }) {
    // 로그인 성공 시: loggedOut 해제
    markLoggedOut(false);

    return request(AUTH.LOGIN, {
      method: "POST",
      body: { email, password },
    });
  },

  // 옵션(silentAuth 등)을 request()로 전달
  async refresh(options = {}) {
    return request(AUTH.REFRESH, { method: "POST", ...options });
  },

  async me(options = {}) {
    return request(AUTH.ME, options);
  },

  async logout() {
    // logout 시작 시점부터 자동 refresh 방지
    markLoggedOut(true);

    try {
      return await request(AUTH.LOGOUT, { method: "POST" });
    } finally {
      clearToken();
    }
  },

  async register({ email, password }) {
    return request(AUTH.REGISTER, {
      method: "POST",
      body: { email, password },
    });
  },

  // 비밀번호 재설정 요청(이메일 발송)
  async resetRequest(email) {
    return request(AUTH.PW_RESET_REQUEST, { method: "POST", body: { email } });
  },

  // 비밀번호 재설정 확인 (토큰 기반)
  async resetConfirm(payload) {
    return request(AUTH.PW_RESET_CONFIRM, { method: "POST", body: payload });
  },

  // 로그인 상태에서 비밀번호 변경
  async changePassword(payload) {
    return request(AUTH.PW_CHANGE, { method: "POST", body: payload });
  },
};