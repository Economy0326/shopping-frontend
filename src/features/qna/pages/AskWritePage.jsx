import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addAsk } from "features/qna/lib/askStore";

export default function AskWritePage({ isLoggedIn, username, userId }) {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [password, setPassword] = useState("");

  const submit = () => {
    if (!isLoggedIn) return alert("로그인 후 작성할 수 있어요.");
    if (!title.trim() || !body.trim()) return alert("제목/내용을 입력하세요.");
    if (!password.trim()) return alert("비밀글 비밀번호를 입력하세요.");

    addAsk({
      title,
      body,
      authorId: userId || "guest",
      authorName: username || "guest",
      password,
    });
    nav("/qna?tab=ask", { replace: true });
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
          disabled={!isLoggedIn}
        />
        <textarea
          className="w-full border rounded p-3 h-40 mb-2"
          placeholder="질문 내용을 입력하세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={!isLoggedIn}
        />
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm text-gray-600">비밀글 비밀번호</label>
          <input
            type="password"
            className="border rounded p-2 w-48"
            placeholder="4~12자 권장"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isLoggedIn}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 border rounded bg-black text-white disabled:opacity-40"
            onClick={submit}
            disabled={!isLoggedIn}
          >
            등록
          </button>
          <button
            className="px-3 py-2 border rounded"
            onClick={() => nav("/qna?tab=ask")}
          >
            취소
          </button>
        </div>
      </article>
    </section>
  );
}