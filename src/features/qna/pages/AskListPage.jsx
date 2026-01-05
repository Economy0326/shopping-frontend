import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AskDrawer from "features/qna/components/AskDrawer";
import { QnaAPI } from "features/qna/api/qna.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AskListPage({ currentUserId, currentUserName, isAdmin }) {
  const nav = useNavigate();
  const { id: routeId } = useParams();

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setSelectedId(routeId || null);
  }, [routeId]);

  // loadAsks -> 저장소에서 불러오기 (API로 교체)
  const refresh = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await QnaAPI.list({ page: 1, size: 200 }); // 간단: 넉넉히(운영은 페이지네이션 권장)
      const rows = res?.data ?? [];
      setItems(rows);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line
  }, []);

  const selected = useMemo(() => {
    return selectedId ? items.find((i) => String(i.id) === String(selectedId)) || null : null;
  }, [selectedId, items]);

  const open = (id) => nav(`/qna/ask/${id}`);
  const close = () => nav(`/qna/ask`);

  return (
    <section className="py-6 grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">무.물.보</h2>
        <div className="flex items-center gap-2">
          <button className="text-xs px-2 py-1 border rounded" onClick={refresh} disabled={loading}>
            새로고침
          </button>
          <Link
            to="/qna/ask/write"
            className="text-xs px-2 py-1 border rounded bg-black text-white"
          >
            글쓰기
          </Link>
        </div>
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}
      {loading && items.length === 0 && <div className="text-sm text-gray-500">불러오는 중…</div>}

      <ol className="bg-white list-decimal list-outside pl-3 space-y-1">
        {items.map((i) => {
          const answered = i.status === "answered" || i.status === "ANSWERED";
          const active = String(selectedId) === String(i.id);

          return (
            <li key={i.id} className={`list-item p-3 rounded ${active ? "bg-gray-50" : ""}`}>
              <button
                type="button"
                onClick={() => open(i.id)}
                aria-pressed={active}
                className="w-full flex items-center gap-3 hover:opacity-90 text-left outline-none ring-0 [appearance:none]"
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span>🔒</span>
                  <span className="truncate font-medium" title={i.title || ""}>
                    {i.title || "(제목 없음)"}
                  </span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 ${
                      answered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {answered ? "답변완료" : "대기"}
                  </span>
                </div>

                <time className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                  {i.createdAt ? new Date(i.createdAt).toLocaleString() : "-"}
                </time>
              </button>
            </li>
          );
        })}

        {items.length === 0 && !loading && (
          <li className="p-6 text-center text-sm text-gray-500 list-none">
            등록된 글이 없습니다.
          </li>
        )}
      </ol>

      {selected && (
        <AskDrawer
          ask={selected}
          onClose={close}
          onUpdated={refresh}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </section>
  );
}
