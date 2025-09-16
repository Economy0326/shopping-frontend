import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { AuthAPI } from "../api/auth";
import { toast } from "react-toastify";
import { getAxiosErrorMessage } from "../lib/request";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { username, name, email, ... } | null
  const [ready, setReady] = useState(false); // 초기 세션 확인 완료 여부
  const [loading, setLoading] = useState(false); // 로그인/회원가입 진행 상태

  // 앱 첫 진입 시 세션 확인(있으면 user 세팅)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof AuthAPI.me === "function") {
          const res = await AuthAPI.me();
          // 응답 포맷 호환 처리: { user } 또는 { data: { user } } 또는 { ok, user }
          const u = res?.user ?? res?.data?.user ?? null;
          if (alive) setUser(u);
        }
      } catch {
        // 세션 없음/미구현: 무시하고 guest로 시작
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 중앙집중 로그인(선호) 
  const login = useCallback(async ({ username, password }) => {
    if (!username?.trim() || !password?.trim()) {
      toast.error("ID와 PW를 입력해주세요");
      return { ok: false, error: "EMPTY_CREDENTIALS" };
    }
    setLoading(true);
    try {
      const res = await AuthAPI.login({ username, password });
      if (!res?.ok) throw new Error(res?.error || "로그인 실패");
      const u = res?.user ?? res?.data?.user ?? { username };
      setUser(u);
      toast.success("환영합니다");
      return { ok: true, user: u };
    } catch (e) {
      const msg = getAxiosErrorMessage?.(e, "로그인 중 오류가 발생했습니다") || "로그인 실패";
      toast.error(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // 중앙집중 회원가입(선호)
  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await AuthAPI.register(payload);
      if (!res?.ok) throw new Error(res?.error || "회원가입 실패");
      toast.success("회원가입 완료! 로그인해 주세요.");
      return { ok: true };
    } catch (e) {
      const msg = getAxiosErrorMessage?.(e, "회원가입 중 오류가 발생했습니다") || "회원가입 실패";
      toast.error(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      if (typeof AuthAPI.logout === "function") {
        await AuthAPI.logout();
      }
    } catch {
      // 서버 미구현/실패여도 클라이언트 상태만 리셋
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    loading,
    setUser,   // LoginModal에서 직접 setUser(data.user) 써도 됨
    login,     // 중앙집중 사용 원하면 이걸 쓰세요
    register,
    logout,
  }), [user, ready, loading, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
