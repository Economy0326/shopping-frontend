/* 인증 API(로그인,로그아웃,회원가입,me,비밀번호변경) */
import { request } from "shared/api/request";
import { AUTH } from "shared/api/endpoints";
import { setAccessToken, clearAccessToken } from "shared/api/tokenMemory";

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
      const data = await request(AUTH.LOGIN, { method: "POST", body });

      const at = pickAccessToken(data);
      if (at) {
        setAccessToken(at);
        // Authorization 헤더는 httpClient의 인터셉터가 getAccessToken에서 자동으로 읽어 붙입니다.
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
      const data = await request(AUTH.ME);
      return data ?? null;
    } catch (e) {
      // 401/403 등에서 호출측이 편하게 분기할 수 있도록 null 반환
      return null;
    }
  },

  logout: async () => {
    try {
      await request(AUTH.LOGOUT, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },

  register: async (p) => {
    const body = {
      [F.id]: p.username,
      [F.pw]: p.password,
      ...(p.name  ? { [F.name]:  p.name }  : {}),
      ...(p.email ? { [F.email]: p.email } : {}),
    };
    const data = await request(AUTH.REGISTER, { method: "POST", body });
    const at = pickAccessToken(data);
    if (at) setAccessToken(at);
    return data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    // 서버 기대 키를 .env로 바꿀 수 있게 함 (기본 current/next)
    const payload = { [FPW.current]: currentPassword, [FPW.next]: newPassword };
    const data = await request(AUTH.PW_CHANGE, { method: "POST", body: payload });
    return data ?? null;
  },
};
