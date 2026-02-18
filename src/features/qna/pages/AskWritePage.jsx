import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";
import { QnaAPI } from "features/qna/api/qna.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";

export default function AskWritePage() {
  const nav = useNavigate();
  const { user, ready } = useAuth();

  const isLoggedIn = !!user;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!ready) return;
    if (!isLoggedIn) return notify.error("로그인 후 작성할 수 있어요.");
    if (!title.trim() || !body.trim()) return notify.error("제목/내용을 입력하세요.");

    try {
      setSaving(true);

      await QnaAPI.create({
        title: title.trim(),
        body: body.trim(),
      });

      nav("/qna?tab=ask", { replace: true });
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-6 grid md:grid-cols-5 gap-6">
      <aside className="hidden md:block md:col-span-2 p-4 text-sm text-gray-600">
        <div className="font-semibold mb-2">무.물.보 안내</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>로그인 사용자만 작성할 수 있습니다.</li>
          <li>문의는 비공개이며 본인과 운영자만 열람합니다.</li>
          <li>계정당 최대 3개까지 등록 가능합니다.</li>
        </ul>
      </aside>

      <article className="md:col-span-3 md:col-start-3 p-4 bg-white rounded shadow-sm">
        <h1 className="font-bold text-xl mb-3">무.물.보 작성</h1>

        {!ready ? (
          <div className="text-sm text-gray-500 mb-2">로딩중…</div>
        ) : !isLoggedIn ? (
          <div className="text-sm text-red-500 mb-2">로그인 후 작성할 수 있어요.</div>
        ) : null}

        <input
          className="w-full border rounded p-3 mb-2"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isLoggedIn || saving}
        />

        <textarea
          className="w-full border rounded p-3 h-44 mb-2"
          placeholder="질문 내용을 입력하세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={!isLoggedIn || saving}
        />

        <div className="text-xs text-gray-400 mb-3">글자수: {body.length}자</div>

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
