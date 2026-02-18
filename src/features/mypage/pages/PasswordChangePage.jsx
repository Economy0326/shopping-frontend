// 로그인한 사용자가 비밀번호 변경 또는 재설정하는 페이지
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthAPI } from "features/auth/api/auth.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";

export default function PasswordChangePage() {
  const [sp] = useSearchParams();
  const token = sp.get("token"); // 있으면 재설정 모드
  const isReset = Boolean(token);

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // ex) next: "사용자가 입력한 값"
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // isReset = true (토큰 기반 재설정) -> 현재 비번 입력 필요 없음
  // isReset = false (로그인 상태 비번 변경) -> 현재 비번 입력 필요
  // disabled: 버튼 비활성화 여부
  const disabled = isReset
    ? !(form.next && form.confirm && form.next === form.confirm)
    : !(form.current && form.next && form.confirm && form.next === form.confirm);

  const onSubmit = async (e) => {
    e.preventDefault();
    // saving -> 저장 중 중복 제출 방지
    if (disabled || saving) return;

    try {
      setSaving(true);
      // isReset: 재설정 모드
      if (isReset) {
        await AuthAPI.resetConfirm({ token, newPassword: form.next });
      } else {
        await AuthAPI.changePassword({
          currentPassword: form.current,
          newPassword: form.next,
        });
      }
      setDone(true);
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      notify.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {isReset ? "비밀번호 재설정" : "비밀번호 변경"}
        </h1>
        <Link
          to={isReset ? "/" : "/mypage"}
          className="text-sm text-gray-600 hover:underline"
        >
          ← {isReset ? "홈으로" : "나의 정보로 돌아가기"}
        </Link>
      </header>

      <main>
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-white p-4 md:p-5 shadow-sm space-y-4"
        >
          {!isReset && (
            <label className="block">
              <span className="text-sm font-semibold">현재 비밀번호</span>
              <input
                type="password"
                name="current"
                value={form.current}
                onChange={onChange}
                className="w-full rounded p-3 mt-1 border-2 border-gray-300"
                autoComplete="current-password"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold">새 비밀번호</span>
            <input
              type="password"
              name="next"
              value={form.next}
              onChange={onChange}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300"
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">새 비밀번호 확인</span>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300"
              autoComplete="new-password"
            />
          </label>

          {form.next && form.confirm && form.next !== form.confirm && (
            <p className="text-sm text-rose-600">새 비밀번호가 일치하지 않습니다.</p>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={disabled || saving}
              className={`rounded-xl px-4 py-2 text-sm text-white ${
                disabled || saving
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-black hover:opacity-90"
              }`}
            >
              {saving
                ? isReset
                  ? "재설정 중…"
                  : "변경 중…"
                : isReset
                ? "재설정하기"
                : "변경하기"}
            </button>

            {!isReset && (
              <Link
                to="/mypage"
                className="rounded-xl px-4 py-2 text-sm border hover:bg-gray-50"
              >
                취소
              </Link>
            )}
          </div>

          {done && (
            <p className="text-sm text-emerald-600">
              {isReset
                ? "비밀번호가 재설정되었습니다. 이제 로그인해 주세요."
                : "비밀번호가 변경되었습니다."}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
