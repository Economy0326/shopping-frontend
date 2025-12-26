import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { AuthAPI } from "features/auth/api/auth.api";
import { getAxiosErrorMessage } from "shared/api/request";
import { getAccessToken, setAccessToken, clearToken } from "shared/api/tokenMemory";
import { authEvents } from "shared/api/authEvents"; 

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // “재로그인 필요” 상태(원하면 App에서 보고 모달 열 수 있음)
  const [authRequired, setAuthRequired] = useState(false);

  // 공통: 인증 깨짐 처리
  const markAuthRequired = useCallback(() => {
    clearToken();
    setUser(null);
    setAuthRequired(true);
  }, []);

  // 전역 401 이벤트 구독 (가장 중요)
  useEffect(() => {
    const off = authEvents.on("AUTH_REQUIRED", () => {
      markAuthRequired();
      // UX: 토스트 한 번
      toast.info("세션이 만료되었습니다. 다시 로그인해주세요.");
    });
    return off;
  }, [markAuthRequired]);

  // 앱 첫 진입: accessToken 있을 때만 /me 호출
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          if (alive) setUser(null);
          return;
        }

        const res = await AuthAPI.me();
        const data = res?.data ?? res;
        const u = data?.user ?? data ?? null;

        if (alive) {
          setUser(u);
          setAuthRequired(false);
        }
      } catch (e) {
        // 여기서는 그냥 토큰 정리만 (401이면 interceptor가 이벤트 처리)
        clearToken();
        if (alive) setUser(null);
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 로그인
  const login = useCallback(async ({ username, password }) => {
    if (!username?.trim() || !password?.trim()) {
      toast.error("ID와 PW를 입력해주세요");
      return { ok: false, error: "EMPTY_CREDENTIALS" };
    }

    setLoading(true);
    try {
      const res = await AuthAPI.login({ username, password });
      const data = res?.data ?? res;

      if (!data?.accessToken) throw new Error("토큰이 응답에 없습니다.");
      setAccessToken(data.accessToken);

      // 로그인 성공: authRequired 해제
      setAuthRequired(false);

      // user를 같이 주면 사용, 아니면 /me 재조회
      let u = data?.user ?? null;
      if (!u) {
        const meRes = await AuthAPI.me();
        const meData = meRes?.data ?? meRes;
        u = meData?.user ?? meData ?? null;
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

  // 회원가입
  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await AuthAPI.register(payload);
      const status = res?.status ?? 200;
      if (status >= 400) throw new Error("회원가입 실패");

      toast.success("회원가입 완료! 로그인해 주세요.");
      return { ok: true };
    } catch (e) {
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
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await AuthAPI.logout?.(); // 서버가 refresh 쿠키 삭제하도록
    } catch {
      // ignore
    } finally {
      clearToken();
      setUser(null);
      setAuthRequired(false);
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      ready,
      loading,
      authRequired,
      setUser,
      login,
      register,
      logout,
      // 필요하면 외부에서 강제 트리거 가능
      requireLogin: markAuthRequired,
      setAuthRequired,
    }),
    [user, ready, loading, authRequired, login, register, logout, markAuthRequired]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
