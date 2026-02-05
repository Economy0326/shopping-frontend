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
import UsersAPI from "features/users/api/users.api";
import { clearToken, setAccessToken, getAccessToken } from "shared/api/tokenMemory";
import { authEvents } from "shared/api/authEvents";
import { pickData } from "shared/api/pickers";
import { markLoggedOut } from "shared/api/httpClient";

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
    const off = authEvents.on("AUTH_REQUIRED", (payload) => {
      clearToken();
      setUser(null);
      setAuthRequired(true);

      if (!payload?.silent) {
        toast.info("세션이 만료되었습니다. 다시 로그인해주세요.");
      }
    });
    return off;
  }, []);

  // 유저 정보는 /user/me로 확정(프로필 필드 유지 목적)
  async function loadFullMe({ silentAuth = true } = {}) {
    const me = await UsersAPI.me({ silentAuth }).catch(() => null);
    return me ?? null;
  }

  // 앱 시작 시: accessToken 없으면 /auth/refresh 를 silent로 1회 시도하고,
  // 이후 /auth/me 를 호출해 사용자 정보를 가져온다.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // accessToken이 메모리에 없으면 silent refresh 시도
        if (!getAccessToken()) {
          try {
            const r = await AuthAPI.refresh({ silentAuth: true });
            const payload = pickData(r);
            if (payload?.accessToken) {
              setAccessToken(payload.accessToken);
            }
          } catch (err) {
            // silent 실패 무시
          }
        }

        // 사용자 정보 조회
        const me = await loadFullMe({ silentAuth: true });

        if (alive && me) {
          setUser(me);
          setAuthRequired(false);
        } else if (alive) {
          setUser(null);
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
      const payload = pickData(res); // { accessToken, user:{id,role} }

      if (!payload?.accessToken) {
        throw new Error("로그인 응답 accessToken 누락");
      }

      setAccessToken(payload.accessToken);

      // 로그인 직후 me로 최신 사용자 확정
      const me = await UsersAPI.me({ silentAuth: true });
      setUser(me);

      markLoggedOut(false);
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
      markLoggedOut(true);
      await AuthAPI.logout();
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