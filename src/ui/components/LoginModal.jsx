import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";

export default function LoginModal({ setShowLoginModal }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const closeAndGo = useCallback(
    (to) => {
      setShowLoginModal(false);
      navigate(to);
    },
    [navigate, setShowLoginModal]
  );

  const onLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("이메일과 비밀번호를 입력해주세요");
      return;
    }
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);

    if (res?.ok) {
      setShowLoginModal(false);
    } else {
      toast.error("로그인 실패");
    }
  }, [email, password, login, setShowLoginModal]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-red-500 text-white p-6 rounded w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-extrabold uppercase tracking-tight">LOGIN</h2>
          <button
            type="button"
            className="text-sm font-extrabold uppercase tracking-tight hover:text-gray-200"
            onClick={() => setShowLoginModal(false)}
          >
            GET OUT
          </button>
        </div>

        <input
          type="email"
          placeholder="EMAIL"
          className="w-full border-b-4 border-white bg-transparent text-2xl text-white placeholder-white py-2 mb-2 font-extrabold focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="PW"
          className="w-full border-b-4 border-white bg-transparent text-2xl text-white placeholder-white py-2 mb-2 font-extrabold focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          disabled={loading}
          autoComplete="current-password"
        />

        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full bg-white text-red-500 text-2xl font-extrabold rounded py-2 mb-1 disabled:opacity-60"
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </button>

        <button
          onClick={() => closeAndGo("/auth/signup")}
          disabled={loading}
          className="w-full bg-white text-red-500 text-2xl font-extrabold rounded py-2 mb-1 disabled:opacity-60"
        >
          CREATE AN ACCOUNT
        </button>

        <button
          onClick={() => closeAndGo("/auth/password-reset")}
          disabled={loading}
          className="w-full bg-white/90 text-red-600 text-md font-extrabold rounded py-2 mt-2 disabled:opacity-60"
        >
          FORGOT PASSWORD
        </button>
      </div>
    </div>
  );
}