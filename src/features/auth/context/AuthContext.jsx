import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthAPI } from "features/auth/api/auth.api";
import { clearToken, setAccessToken } from "shared/api/tokenMemory";
import { authEvents } from "shared/api/authEvents";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // 현재 사용자
  const [ready] = useState(true);
  const [loading, setLoading] = useState(false);  // 로그인/회원가입 중 로딩
  const [authRequired, setAuthRequired] = useState(false);  // 재로그인 필요 여부

  // 401 이벤트 (refresh 토큰 만료) → 재로그인
  useEffect(() => {
    const off = authEvents.on("AUTH_REQUIRED", () => {
      clearToken();
      setUser(null);
      setAuthRequired(true);
      toast.info("세션이 만료되었습니다. 다시 로그인해주세요.");
    });
    return off;
  }, []);

  // 로그인 (email 기반)
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return { ok: false };
    }

    setLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      const data = res?.data;

      if (!data?.accessToken || !data?.user) {
        throw new Error("로그인 응답이 올바르지 않습니다.");
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      setAuthRequired(false);

      toast.success("로그인 되었습니다.");
      return { ok: true };
    } catch (e) {
      clearToken();
      toast.error("로그인 실패");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await AuthAPI.logout();
    } catch {
      // ignore
    } finally {
      clearToken();
      setUser(null);
      setAuthRequired(false);
      navigate("/");
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      ready,
      loading,
      authRequired,
      login,
      logout,
      setUser, // 관리자 강제 변경용
      setAuthRequired, // authRequired 리셋용
    }),
    [user, ready, loading, authRequired, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}