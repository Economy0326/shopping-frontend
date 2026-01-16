// features/auth/context/AuthContext.jsx
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
import { pickData } from "shared/api/pickers";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  // 401 이벤트 → 재로그인 유도
  useEffect(() => {
    const off = authEvents.on("AUTH_REQUIRED", () => {
      clearToken();
      setUser(null);
      setAuthRequired(true);
      toast.info("세션이 만료되었습니다. 다시 로그인해주세요.");
    });
    return off;
  }, []);

  // 앱 시작 시 me() 체크
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await AuthAPI.me();
        const me = pickData(res); // user 객체
        if (alive && me) {
          setUser(me);
          setAuthRequired(false);
        }
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return { ok: false };
    }

    setLoading(true);
    try {
      const res = await AuthAPI.login({ email, password });
      const payload = pickData(res); // { accessToken, user }

      if (!payload?.accessToken || !payload?.user) {
        throw new Error("로그인 응답이 올바르지 않습니다.");
      }

      setAccessToken(payload.accessToken);
      setUser(payload.user);
      setAuthRequired(false);

      toast.success("로그인 되었습니다.");
      return { ok: true };
    } catch {
      clearToken();
      toast.error("로그인 실패");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }, []);

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
      setUser,
      setAuthRequired,
    }),
    [user, ready, loading, authRequired, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
