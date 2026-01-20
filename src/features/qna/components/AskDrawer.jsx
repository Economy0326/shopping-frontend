import { useEffect, useMemo, useRef, useState } from "react";
import { QnaAPI } from "features/qna/api/qna.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AskDrawer({
  ask,
  onClose,
  isAdmin,
  currentUserId,
  currentUserName,
  onUpdated,
}) {
  const backdropRef = useRef(null);

  const [err, setErr] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replySaving, setReplySaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const askId = ask?.id;

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const loadDetail = async () => {
    if (!askId) return;
    try {
      setLoading(true);
      setErr("");
      const res = await QnaAPI.get(askId);
      setDetail(res?.data ?? null);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!askId) return;
    loadDetail();
    // eslint-disable-next-line
  }, [askId]);

  const isAuthor = useMemo(() => {
    const authorId = detail?.authorId ?? ask?.authorId;
    return !!authorId && String(authorId) === String(currentUserId);
  }, [detail?.authorId, ask?.authorId, currentUserId]);

  const canSee = isAdmin || isAuthor;
  const canDelete = canSee; // 본인 or admin
  const show = detail || ask;
  const replies = show?.replies ?? [];

  const submitReply = async () => {
    if (!replyBody.trim()) return;
    if (!askId) return;

    try {
      setReplySaving(true);
      setErr("");

      await QnaAPI.reply(askId, { body: replyBody.trim() });
      setReplyBody("");

      await loadDetail();
      onUpdated?.();
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setReplySaving(false);
    }
  };

  const removeAsk = async () => {
    if (!askId) return;
    if (!canDelete) return;

    const ok = window.confirm("이 문의를 삭제할까요? (복구 불가)");
    if (!ok) return;

    try {
      setDeleting(true);
      setErr("");

      await QnaAPI.remove(askId);

      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  if (!ask) return null;

  const answered = show?.status === "answered" || show?.status === "ANSWERED";

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
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-red-500">🔒</span>
            <span className="font-semibold shrink-0">비밀글</span>
            <span className="text-xs rounded px-2 py-0.5 bg-gray-100 ml-2 shrink-0">
              {answered ? "답변완료" : "답변대기"}
            </span>
            {show?.title && (
              <span className="ml-2 text-sm text-gray-600 truncate" title={show.title}>
                {show.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                className="px-2 py-1 border rounded text-red-600 disabled:opacity-40"
                onClick={removeAsk}
                disabled={deleting || loading}
              >
                {deleting ? "삭제중…" : "삭제"}
              </button>
            )}
            <button className="px-2 py-1 border rounded" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto grow">
          {err && <div className="text-xs text-red-500 mb-3">{err}</div>}

          {loading ? (
            <div className="text-sm text-gray-500">불러오는 중…</div>
          ) : !canSee ? (
            <div className="text-sm text-gray-600">
              접근 권한이 없습니다.
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-500 mb-2">
                작성자: {show?.authorName || currentUserName || "-"} ·{" "}
                {show?.createdAt ? new Date(show.createdAt).toLocaleString() : "-"}
              </div>

              <div className="whitespace-pre-wrap">{show?.body}</div>

              <ul className="mt-6 space-y-3">
                {replies?.map((r) => (
                  <li key={r.id} className="p-3 rounded bg-gray-50">
                    <div className="text-xs text-gray-500">
                      {r.isAdmin ? "운영자" : r.authorName} ·{" "}
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{r.body}</div>
                  </li>
                ))}
                {(!replies || replies.length === 0) && (
                  <li className="text-sm text-gray-500">등록된 답변이 없습니다.</li>
                )}
              </ul>

              {isAdmin && <div className="h-32" />}
            </>
          )}
        </div>

        {isAdmin && (
          <div className="p-4 border-t bg-white">
            <div className="text-sm font-semibold mb-2">운영자 답변</div>
            <textarea
              className="w-full border rounded p-3 h-24 mb-3"
              placeholder="답변 내용을 입력하세요"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              disabled={replySaving}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 border rounded bg-white"
                onClick={() => setReplyBody("")}
                disabled={replySaving}
              >
                취소
              </button>
              <button
                className="px-3 py-2 border rounded bg-black text-white disabled:opacity-50"
                onClick={submitReply}
                disabled={replySaving || !replyBody.trim()}
              >
                {replySaving ? "등록 중…" : "답변 등록"}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
