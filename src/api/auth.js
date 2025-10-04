/* 인증 API(로그인,로그아웃,회원가입,me,비밀번호변경) */
import { api } from "../lib/request";
import { AUTH } from "../constants/apiRoutes";
import { setAccessToken, clearAccessToken } from "../lib/token";

// 요청 바디 필드명(.env로 변경 가능)
const F = {
  id:    process.env.REACT_APP_FIELD_ID       || "mid",
  pw:    process.env.REACT_APP_FIELD_PASSWORD || "mpw",
  name:  process.env.REACT_APP_FIELD_NAME     || "mname",
  email: process.env.REACT_APP_FIELD_EMAIL    || "email",
};

// 비밀번호 변경 바디 키(.env로 커스터마이즈)
const FPW = {
  current: process.env.REACT_APP_FIELD_PW_CURRENT || "current",
  next:    process.env.REACT_APP_FIELD_PW_NEXT    || "next",
};

// 응답에서 access 토큰을 유연하게 뽑아내기
const pickAccessToken = (data) =>
  data?.accessToken ?? data?.access_token ?? data?.token ?? null;

export const AuthAPI = {
  login: async ({ username, password }) => {
    try {
      const body = { [F.id]: username, [F.pw]: password };
      const res = await api.post(AUTH.LOGIN, body);
      const data = res?.data ?? null;

      const at = pickAccessToken(data);
      if (at) {
        setAccessToken(at);
        // axios 기본 Authorization 도 세팅 (새 요청부터 자동 첨부)
        api.defaults.headers.common.Authorization = `Bearer ${at}`;
      }
      // refreshToken은 HttpOnly 쿠키로 받으니 프론트 저장 불필요
      return data;
    } catch (e) {
      console.error("로그인 요청 실패:", e);
      throw e;
    }
  },

  me: async () => {
    try {
      const res = await api.get(AUTH.ME);
      return res?.data ?? null;
    } catch (e) {
      // 401/403 등에서 호출측이 편하게 분기할 수 있도록 null 반환
      return null;
    }
  },

  logout: async () => {
    try {
      await api.post(AUTH.LOGOUT);
    } finally {
      clearAccessToken();
      // axios 기본 Authorization 제거
      delete api.defaults.headers.common.Authorization;
    }
  },

  register: async (p) => {
    const body = {
      [F.id]: p.username,
      [F.pw]: p.password,
      ...(p.name  ? { [F.name]:  p.name }  : {}),
      ...(p.email ? { [F.email]: p.email } : {}),
    };
    const res = await api.post(AUTH.REGISTER, body);
    const data = res?.data ?? null;

    // 서버가 회원가입 직후 accessToken을 줄 수도 있으므로 대비
    const at = pickAccessToken(data);
    if (at) {
      setAccessToken(at);
      api.defaults.headers.common.Authorization = `Bearer ${at}`;
    }
    return data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // 서버 기대 키를 .env로 바꿀 수 있게 함 (기본 current/next)
    const payload = { [FPW.current]: currentPassword, [FPW.next]: newPassword };
    const res = await api.post(AUTH.PW_CHANGE, payload);
    return res?.data ?? null;
  },
};
