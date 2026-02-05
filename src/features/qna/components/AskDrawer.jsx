import React, { useEffect, useMemo, useState } from "react";
import { QnaAPI } from "features/qna/api/qna.api";
import { useAuth } from "features/auth/context/AuthContext"; // ✅ 수정: ready/user 확인용

function getApiErrorMessage(e) {
  return (
    (e &&
      e.response &&
      e.response.data &&
      (e.response.data.message ||
        (e.response.data.error && e.response.data.error.message))) ||
    (e && e.message) ||
    "요청 중 오류가 발생했습니다."
  );
}

// {data:{...}} / {...} 둘 다 안전하게 언래핑
function unwrap(res) {
  const payload = res && res.data;
  return payload && payload.data ? payload.data : payload;
}

export default function AskDrawer({ askId, isAdmin, onClose, onChanged }) {
  const { ready, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);

  const headerTitle = useMemo(
    () => (isAdmin ? "운영자 문의 상세" : "내 문의 상세"),
    [isAdmin]
  );

  const loadDetail = async () => {
    if (!askId) return;
    try {
      setLoading(true);
      setErr("");

      const res = await QnaAPI.get(askId);
      const d = unwrap(res);

      setDetail(d || null);
    } catch (e) {
      setDetail(null);
      const status = e && e.response && e.response.status;
      if (status === 401) setErr("로그인이 필요합니다.");
      else if (status === 403) setErr("이 문의는 볼 수 없습니다.");
      else setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!askId) return;
    if (!ready) return; // auth 준비 전에는 호출하지 않음(401 튐 방지)
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askId, ready]);

  if (!askId) return null;

  // 유저 삭제 버튼(본인 문의만)
  const canDelete = !isAdmin && !!user && !!detail?.id;

  const removeAsk = async () => {
    if (!detail?.id) return;
    if (!window.confirm("이 문의를 삭제할까요?")) return;

    try {
      setLoading(true);
      await QnaAPI.remove(detail.id);
      if (onChanged) onChanged();
      if (onClose) onClose();
    } catch (e) {
      const status = e && e.response && e.response.status;
      if (status === 401) setErr("로그인이 필요합니다.");
      else if (status === 403) setErr("삭제 권한이 없습니다.");
      else setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* backdrop */}
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* panel */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-extrabold">{headerTitle}</div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={removeAsk}
                disabled={loading}
                className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-57px)]">
          {loading && <div className="text-sm text-gray-500">불러오는 중…</div>}

          {!loading && err && (
            <div className="text-sm text-red-600">{err}</div>
          )}

          {!loading && !err && detail && (
            <>
              <div className="text-xl font-extrabold">{detail.title}</div>
              <div className="mt-3 whitespace-pre-wrap leading-6 text-gray-900">
                {detail.body}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="font-bold mb-3">답변</div>

                {detail.replies && detail.replies.length ? (
                  <div className="grid gap-3">
                    {detail.replies.map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-xl p-3 border ${
                          r.isAdmin ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          {r.isAdmin ? "운영자" : "작성자"}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {r.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    아직 답변이 없습니다.
                  </div>
                )}
              </div>

              {isAdmin ? (
                <AdminReplyBox
                  askId={detail.id}
                  onDone={() => {
                    loadDetail();
                    if (onChanged) onChanged();
                  }}
                />
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function AdminReplyBox({ askId, onDone }) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!body.trim()) return;
    try {
      setSaving(true);
      setErr("");
      await QnaAPI.reply(askId, { body });
      setBody("");
      if (onDone) onDone();
    } catch (e) {
      const status = e && e.response && e.response.status;
      if (status === 401) setErr("로그인이 필요합니다.");
      else if (status === 403) setErr("운영자만 답변할 수 있습니다.");
      else setErr(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="font-bold mb-2">운영자 답변 작성</div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full border rounded-xl p-3 text-sm"
        placeholder="답변을 입력하세요"
      />

      {err && <div className="text-sm text-red-600 mt-2">{err}</div>}

      <div className="flex justify-end mt-3">
        <button
          onClick={submit}
          disabled={saving || !body.trim()}
          className={`px-4 py-2 rounded-xl text-white ${
            saving || !body.trim() ? "bg-gray-300" : "bg-black hover:opacity-90"
          }`}
        >
          {saving ? "저장 중…" : "등록"}
        </button>
      </div>
    </div>
  );
}
