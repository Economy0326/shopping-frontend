import { api } from "../lib/request";
import { AUTH } from "../constants/apiRoutes";
import { setAccessToken, clearAccessToken } from "../lib/token";

// 필요하면 .env.local로 바꿀 수 있게 유지
const F = {
  id:    process.env.REACT_APP_FIELD_ID       || "mid",
  pw:    process.env.REACT_APP_FIELD_PASSWORD || "mpw",
  name:  process.env.REACT_APP_FIELD_NAME     || "mname",
  email: process.env.REACT_APP_FIELD_EMAIL    || "email",
};

export const AuthAPI = {
  login: async ({ username, password }) => {
    const res = await api.post(AUTH.LOGIN, { [F.id]: username, [F.pw]: password });
    const data = res?.data ?? null;
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data;
  },

  me: async () => {
    const res = await api.get(AUTH.ME);
    return res?.data ?? null;
  },

  logout: async () => {
    try { await api.post(AUTH.LOGOUT); }
    finally { clearAccessToken(); }
  },

  register: async (p) => {
    const res = await api.post(AUTH.REGISTER, {
      [F.id]: p.username,
      [F.pw]: p.password,
      ...(p.name  ? { [F.name]:  p.name }  : {}),
      ...(p.email ? { [F.email]: p.email } : {}),
    });
    return res?.data ?? null;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await api.post(AUTH.PW_CHANGE, { current: currentPassword, next: newPassword });
    return res?.data ?? null;
  },
};
