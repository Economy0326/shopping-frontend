import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthAPI } from "../../api/auth";
import { getAxiosErrorMessage } from "../../lib/request";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", password2: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error("아이디/비밀번호 입력");
    if (form.password !== form.password2) return toast.error("비밀번호 불일치");
    try {
      setLoading(true);
      const r = await AuthAPI.register({ username: form.username, password: form.password });
      if (!r?.ok) throw new Error(r?.error || "회원가입 실패");
      toast.success("회원가입 완료! 로그인 해주세요.");
      navigate("/");
    } catch (err) {
      toast.error(getAxiosErrorMessage(err, "회원가입 중 오류가 발생했습니다"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded-2xl shadow">
        <input className="border p-2 rounded w-full" placeholder="아이디" value={form.username}
              onChange={(e)=>setForm({...form, username:e.target.value})}/>
        <input type="password" className="border p-2 rounded w-full" placeholder="비밀번호" value={form.password}
              onChange={(e)=>setForm({...form, password:e.target.value})}/>
        <input type="password" className="border p-2 rounded w-full" placeholder="비밀번호 확인" value={form.password2}
              onChange={(e)=>setForm({...form, password2:e.target.value})}/>
        <button disabled={loading} className="h-12 bg-red-500 text-white font-bold rounded hover:opacity-90 w-full">
          {loading ? "가입 중…" : "회원가입"}
        </button>
      </form>
    </main>
  );
}