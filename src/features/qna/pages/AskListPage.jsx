import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "features/auth/context/AuthContext";
import { QnaAPI } from "features/qna/api/qna.api";
import AskDrawer from "features/qna/components/AskDrawer";

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

function unwrapList(res) {
  const payload = res && res.data;
  return payload && payload.data ? payload.data : payload;
}

export default function AskListPage() {
  const nav = useNavigate();
  const { user, ready } = useAuth();

  const isAdmin = useMemo(
    () => String(user?.role ?? "").toLowerCase() === "admin",
    [user?.role]
  );

  const title = useMemo(() => (isAdmin ? "운영자 문의" : "내 문의"), [isAdmin]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await QnaAPI.list({ page: 1, size: 50 });
      const list = unwrapList(res);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      const status = e && e.response && e.response.status;
      if (status === 401) setErr("로그인이 필요합니다.");
      else setErr(getApiErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeAsk = async (id) => {
    if (!id) return;
    if (!window.confirm("이 문의를 삭제할까요?")) return;

    try {
      setLoading(true);
      await QnaAPI.remove(id);

      if (String(openId) === String(id)) setOpenId(null);
      await refresh();
    } catch (e) {
      const status = e && e.response && e.response.status;
      if (status === 401) alert("로그인이 필요합니다.");
      else if (status === 403) alert("삭제 권한이 없습니다.");
      else alert(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return; // auth 준비 전에는 호출하지 않음
    if (!user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id, isAdmin]);

  // return은 Hooks 선언 이후에만
  if (!ready) return null;

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>문의</h1>
        <div style={{ marginTop: 12, color: "#666" }}>로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
          <div style={{ color: "#666", marginTop: 4 }}>
            {isAdmin ? `전체 ${items.length}건` : `내 문의 ${items.length}/3`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={refresh} disabled={loading}>
            새로고침
          </button>

          {!isAdmin && (
            <button
              onClick={() => {
                if (items.length >= 3)
                  return alert("문의는 최대 3개까지 등록 가능합니다. 기존 문의를 삭제하세요.");
                nav("/qna/ask/write");
              }}
              disabled={loading}
            >
              글쓰기
            </button>
          )}
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>불러오는 중…</div>}
      {!loading && err && <div style={{ marginTop: 16, color: "#c00" }}>{err}</div>}

      {!loading && !err && (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                onClick={() => setOpenId(it.id)}
                style={{ cursor: "pointer", display: "flex", gap: 10, flex: 1 }}
              >
                <div style={{ color: "#666" }}>문의</div>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: it.status === "answered" ? "#d1fae5" : "#e5e7eb",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.status === "answered" ? "답변완료" : "대기중"}
                </span>

                <button
                  onClick={() => removeAsk(it.id)}
                  disabled={loading}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ marginTop: 20, color: "#666" }}>등록된 글이 없습니다.</div>
          )}
        </div>
      )}

      <AskDrawer askId={openId} isAdmin={isAdmin} onClose={() => setOpenId(null)} onChanged={refresh} />
    </div>
  );
}
