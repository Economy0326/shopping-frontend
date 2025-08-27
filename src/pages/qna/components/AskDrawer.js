import { useEffect, useRef, useState } from "react";
import { addReply } from "../lib/askStore";

export default function AskDrawer({
  ask,
  onClose,
  isAdmin,
  currentUserId,
  currentUserName,
  authorizedMap,
  setAuthorized,
  onUpdated, // 부모에게 새로고침 요청
}) {
  const backdropRef = useRef(null);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const isAuthor = !!ask && ask.authorId === currentUserId;
  const isAuthorized = !!ask && (authorizedMap[ask.id] || isAdmin || isAuthor);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const tryUnlock = () => {
    if (!ask) return;
    if (!pwd.trim()) return setErr("비밀번호를 입력하세요.");
    if (pwd === ask.password) {
      setAuthorized((m) => ({ ...m, [ask.id]: true }));
      setPwd("");
      setErr("");
    } else {
      setErr("비밀번호가 일치하지 않습니다.");
    }
  };

  const submitReply = () => {
    if (!replyBody.trim()) return;
    addReply({
      askId: ask.id,
      body: replyBody,
      adminId: currentUserId,
      adminName: currentUserName || "admin",
    });
    setReplyBody("");
    onUpdated?.(); // 부모에게 목록 재로딩 요청
  };

  if (!ask) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <aside className="absolute right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-red-500">🔒</span>
            <span className="font-semibold">비밀글</span>
            <span className="text-xs rounded px-2 py-0.5 bg-gray-100 ml-2">
              {ask.status === "answered" ? "답변완료" : "답변대기"}
            </span>
          </div>
          <button className="px-2 py-1 border rounded" onClick={onClose}>
            닫기
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 overflow-y-auto grow">
          {!isAuthorized ? (
            <div className="space-y-3">
              <div className="text-sm">비밀글입니다. 비밀번호를 입력하세요.</div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  className="border rounded p-2 w-48"
                  placeholder="비밀번호"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
                />
                <button
                  className="px-3 py-2 border rounded bg-black text-white"
                  onClick={tryUnlock}
                >
                  확인
                </button>
              </div>
              {err && <div className="text-xs text-red-500">{err}</div>}
            </div>
          ) : (
            <>
              {/* 질문 내용만 표시 */}
              <div className="whitespace-pre-wrap">{ask.body}</div>

              {/* 답변 목록 */}
              <ul className="mt-6 space-y-3">
                {ask.replies?.map((r) => (
                  <li key={r.id} className="p-3 rounded bg-gray-50">
                    <div className="text-xs text-gray-500">
                      {r.isAdmin ? "운영자" : r.authorName} ·{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{r.body}</div>
                  </li>
                ))}
                {(!ask.replies || ask.replies.length === 0) && (
                  <li className="text-sm text-gray-500">등록된 답변이 없습니다.</li>
                )}
              </ul>

              {/* 관리자 답변 작성 */}
              {isAdmin && (
                <div className="mt-6 border-t pt-4">
                  <div className="text-sm font-semibold mb-2">운영자 답변</div>
                  <textarea
                    className="w-full border rounded p-3 h-28 mb-2"
                    placeholder="답변 내용을 입력하세요"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                  />
                  <button
                    className="px-3 py-2 border rounded bg-black text-white"
                    onClick={submitReply}
                  >
                    답변 등록
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}