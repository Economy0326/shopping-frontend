import { request } from "shared/api/request";
import { AUTH } from "shared/api/endpoints";
import { setAccessToken, clearToken } from "shared/api/tokenMemory";

export const AuthAPI = {
  // POST /auth/login
  async login({ email, password }) {
    return request(AUTH.LOGIN, {
      method: "POST",
      body: { email, password },
    });
  },

  // GET /auth/me
  async me() {
    return request(AUTH.ME);
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
  async register({ email, password, name }) {
    return request(AUTH.REGISTER, {
      method: "POST",
      body: { email, password, name },
    });
  },

  // POST /auth/change-password
  async changePassword({ currentPassword, newPassword }) {
    return request(AUTH.PW_CHANGE, {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  },
};