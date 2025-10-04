// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { AuthAPI } from "../api/auth";
import { toast } from "react-toastify";
import { getAxiosErrorMessage } from "../lib/request";
import { getAccessToken, setAccessToken, setRefreshToken, clearToken } from "../lib/token"; // ← 추가

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [ready, setReady] = useState(false);  // 초기 세션 확인 완료
  const [loading, setLoading] = useState(false);

  // 앱 첫 진입: 토큰이 있을 때만 /me 호출 (없으면 스킵)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) {            // ← 가드: 토큰 없으면 me 호출 금지
          if (alive) setUser(null);
          return;
        }
        if (typeof AuthAPI.me === "function") {
          const res = await AuthAPI.me();
          // axios 응답을 가정: {data: {...}}
          const u = res?.data ?? res?.user ?? res?.data?.user ?? null;
          if (alive) setUser(u);
        }
      } catch {
        // 토큰이 있지만 만료/검증 실패 → 토큰 정리
        clearToken();
        if (alive) setUser(null);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 중앙 로그인: 성공 시 토큰 저장 → me로 사용자 최신화
  const login = useCallback(async ({ username, password }) => {
    if (!username?.trim() || !password?.trim()) {
      toast.error("ID와 PW를 입력해주세요");
      return { ok: false, error: "EMPTY_CREDENTIALS" };
    }
    setLoading(true);
    try {
      const res = await AuthAPI.login({ username, password });
      // 백엔드가 {accessToken, refreshToken, user} 또는 axios {data:{...}} 형태라고 가정
      const data = res?.data ?? res;
      if (!data?.accessToken) throw new Error("토큰이 응답에 없습니다.");
      setAccessToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);

      // 토큰 저장 후 me 재조회(권장) — 백엔드가 user를 직접 주면 생략 가능
      let u = data.user;
      if (!u && typeof AuthAPI.me === "function") {
        const meRes = await AuthAPI.me();
        u = meRes?.data ?? meRes?.user ?? meRes?.data?.user ?? null;
      }
      setUser(u ?? { username });
      toast.success("환영합니다");
      return { ok: true, user: u ?? { username } };
    } catch (e) {
      clearToken();
      const msg = getAxiosErrorMessage?.(e, "로그인 중 오류가 발생했습니다") || "로그인 실패";
      toast.error(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // 중앙 회원가입: 성공 후 로그인 화면으로 유도(또는 자동 로그인 흐름 선택)
  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await AuthAPI.register(payload);
      const status = res?.status ?? 200;
      if (status >= 400) throw new Error("회원가입 실패");

      toast.success("회원가입 완료! 로그인해 주세요.");
      // 자동 로그인을 원하면 아래 두 줄을 사용:
      // await login({ username: payload.username, password: payload.password });
      // return { ok: true };
      return { ok: true };
    } catch (e) {
      // 409 등 DUPLICATE 메시지 변환
      const status = e?.response?.status;
      if (status === 409) {
        toast.error("이미 가입된 계정입니다. 다른 이메일/아이디를 사용해 주세요.");
        return { ok: false, error: "DUPLICATE" };
      }
      const msg = getAxiosErrorMessage?.(e, "회원가입 중 오류가 발생했습니다") || "회원가입 실패";
      toast.error(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [/* login */]);

  const logout = useCallback(async () => {
    try {
      if (typeof AuthAPI.logout === "function") {
        await AuthAPI.logout();
      }
    } catch {
      // ignore
    } finally {
      clearToken();   // ← 토큰 정리 추가
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    loading,
    setUser,
    login,
    register,
    logout,
  }), [user, ready, loading, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
