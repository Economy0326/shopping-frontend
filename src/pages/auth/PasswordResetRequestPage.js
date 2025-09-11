import React from "react";
import { AuthAPI } from "../../api/auth";
import { getAxiosErrorMessage } from "../../lib/request";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || saving) return;
    try {
      setSaving(true);
      await AuthAPI.resetRequest(email); // 항상 성공처럼 처리(계정 유추 방지)
      setDone(true);
    } catch (err) {
      console.error(getAxiosErrorMessage(err));
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-bold mb-3">비밀번호 재설정</h1>
        <p>입력하신 주소로 안내 메일을 보냈어요(존재 여부와 무관).</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 grid gap-3">
      <h1 className="text-xl font-bold">비밀번호 재설정</h1>
      <input
        type="email"
        className="border rounded p-2"
        placeholder="이메일"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        autoComplete="email"
      />
      <button disabled={!email || saving} className="bg-black text-white rounded p-2">
        {saving ? "요청 중…" : "메일 받기"}
      </button>
    </form>
  );
}
