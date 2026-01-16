import { request } from "shared/api/request";
import { AUTH } from "shared/api/endpoints";
import { clearToken } from "shared/api/tokenMemory";

export const AuthAPI = {
  // POST /auth/login
  async login({ email, password }) {
    return request(AUTH.LOGIN, {
      method: "POST",
      body: { email, password },
    });
  },

  // GET /auth/me
  async me({ silentAuth = false } = {}) {
    return request(AUTH.ME, { silentAuth });
  },

  // POST /auth/logout
  async logout() {
    try {
      return await request(AUTH.LOGOUT, { method: "POST" });
    } finally {
      // access token 메모리 삭제
      clearToken();
    }
  },

  // POST /auth/register
  async register({ email, password }) {
    return request(AUTH.REGISTER, {
      method: "POST",
      body: { email, password },
    });
  },

  // POST /auth/change-password
  async changePassword({ currentPassword, newPassword }) {
    return request(AUTH.PW_CHANGE, {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  },

  // POST /auth/password-reset/request
  async resetRequest(email) {
    return request(AUTH.PW_RESET_REQUEST, {
      method: "POST",
      body: { email },
    });
  },

  // POST /auth/password-reset/confirm
  async resetConfirm({ token, newPassword }) {
    return request(AUTH.PW_RESET_CONFIRM, {
      method: "POST",
      // token은 로그인 상태가 아닌데도 비밀번호 변경해주는 일회용 인증수단
      body: { token, newPassword },
    });
  },
};