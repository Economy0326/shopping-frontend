import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QnaAPI } from "features/qna/api/qna.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AskWritePage({ isLoggedIn, username, userId }) {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [password, setPassword] = useState(""); // 주석/폼 유지용 (운영에서는 서버 권한 기반 권장)
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!isLoggedIn) return alert("로그인 후 작성할 수 있어요.");
    if (!title.trim() || !body.trim()) return alert("제목/내용을 입력하세요.");
    if (!password.trim()) return alert("비밀글 비밀번호를 입력하세요."); // UI 유지

    try {
      setSaving(true);

      // 비밀번호 방식은 서버에서 쓰지 않는 걸 추천
      // 그래도 UI/주석 유지하려면 서버가 무시하도록 두거나, 별도 필드로 받도록 맞추면 됨.
      await QnaAPI.create({
        title,
        body,
        password, // 서버가 받지 않으면 무시되게 처리(백엔드와 합의)
      });

      nav("/qna?tab=ask", { replace: true });
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-6 grid md:grid-cols-5 gap-6">
      {/* 왼쪽 안내 */}
      <aside className="hidden md:block md:col-span-2 p-4 text-sm text-gray-600">
        <div className="font-semibold mb-2">무.물.보 안내</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>모든 글은 비밀글로 등록됩니다.</li>
          <li>본인/관리자만 비밀번호 없이 열람할 수 있습니다.</li>
          <li>개인정보는 최소한으로 작성해 주세요.</li>
        </ul>
      </aside>

      {/* 오른쪽 폼 */}
      <article className="md:col-span-3 md:col-start-3 p-4">
        <h1 className="font-semibold mb-3">무.물.보 작성</h1>
        {!isLoggedIn && (
          <div className="text-sm text-red-500 mb-2">
            로그인 후 작성할 수 있어요.
          </div>
        )}

        <input
          className="w-full border rounded p-3 mb-2"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isLoggedIn || saving}
        />
        <textarea
          className="w-full border rounded p-3 h-40 mb-2"
          placeholder="질문 내용을 입력하세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={!isLoggedIn || saving}
        />
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm text-gray-600">비밀글 비밀번호</label>
          <input
            type="password"
            className="border rounded p-2 w-48"
            placeholder="4~12자 권장"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isLoggedIn || saving}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 border rounded bg-black text-white disabled:opacity-40"
            onClick={submit}
            disabled={!isLoggedIn || saving}
          >
            {saving ? "등록 중…" : "등록"}
          </button>
          <button
            className="px-3 py-2 border rounded"
            onClick={() => nav("/qna?tab=ask")}
            disabled={saving}
          >
            취소
          </button>
        </div>
      </article>
    </section>
  );
}
