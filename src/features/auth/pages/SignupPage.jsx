import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "features/auth/api/auth.api";
import { getApiErrorMessage } from "shared/api/request";
import { clearToken } from "shared/api/tokenMemory";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);

  // 회원가입 페이지 진입 시 기존 토큰 삭제 (세션 꼬임 방지)
  useEffect(() => {
    clearToken();
  }, []);

  const submit = async (e) => {
    // 폼 submit의 기본 새로고침/이동 막기
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error("이메일/비밀번호 입력");
      return;
    }
    if (form.password !== form.password2) {
      toast.error("비밀번호 불일치");
      return;
    }

    try {
      setLoading(true);

      await AuthAPI.register({
        email: form.email.trim(),
        password: form.password,
        username: form.username.trim() || undefined,
      });

      toast.success("회원가입 완료! 로그인해 주세요.");
      navigate("/"); // 로그인 모달은 헤더에서 열도록
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) toast.error("이미 가입된 이메일입니다.");
      else toast.error(getApiErrorMessage(err, "회원가입 중 오류가 발생했습니다"));
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
          placeholder="이메일"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="닉네임(선택)"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          placeholder="비밀번호 확인"
          value={form.password2}
          onChange={(e) => setForm({ ...form, password2: e.target.value })}
          autoComplete="new-password"
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
