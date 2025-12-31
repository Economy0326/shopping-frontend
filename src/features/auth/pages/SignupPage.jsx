import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "features/auth/api/auth.api";
import { getApiErrorMessage } from "shared/api/request";
import { clearToken } from "shared/api/tokenMemory";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", password2: "" });
  const [loading, setLoading] = useState(false);

  // 회원가입은 비로그인 플로우이므로 혹시 남아있던 토큰 정리
  useEffect(() => { clearToken(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("아이디/비밀번호 입력");
      return;
    }
    if (form.password !== form.password2) {
      toast.error("비밀번호 불일치");
      return;
    }

    try {
      setLoading(true);
      // 중복 호출 금지: 한 번만 호출
      const res = await AuthAPI.register({
        username: form.username,
        password: form.password,
      });

      if (res?.status && res.status >= 400) throw new Error("회원가입 실패");
      toast.success("회원가입 완료! 로그인해 주세요.");
      navigate("/auth/login"); // 자동로그인 원하면 여기서 login 호출 후 "/" 로 이동
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error("이미 가입된 계정입니다.");
      } else {
        toast.error(getApiErrorMessage(err, "회원가입 중 오류가 발생했습니다"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded-2xl shadow">
        <input
          className="border p-2 rounded w-full"
          placeholder="아이디"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="비밀번호 확인"
          value={form.password2}
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 bg-red-500 text-white font-bold rounded hover:opacity-90 w-full"
        >
          {loading ? "가입 중…" : "회원가입"}
        </button>
      </form>
    </main>
  );
}
