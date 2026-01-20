import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AskDrawer from "features/qna/components/AskDrawer";
import { QnaAPI } from "features/qna/api/qna.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AskListPage({ isLoggedIn, currentUserId, currentUserName, isAdmin }) {
  const nav = useNavigate();
  const { id: routeId } = useParams();

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setSelectedId(routeId || null);
  }, [routeId]);

  const refresh = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      setErr("");
      const res = await QnaAPI.list({ page: 1, size: 50, sort: "createdAt,desc" });
      const rows = res?.data ?? [];
      setItems(rows);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 새로고침은 기본적으로 로그인된 경우에만 동작
    // 단, routeId(직접 링크로 접근) 가 있으면 목록이 없어도 상세를 로드하도록 시도해야 함
    if (!isLoggedIn && !routeId) return;
    refresh();
    // eslint-disable-next-line
  }, [isLoggedIn, routeId]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const found = items.find((i) => String(i.id) === String(selectedId));
    // 목록에 없을 때는 최소한 id만 가진 stub를 전달해서 AskDrawer가 서버에서 상세를 로드하게 허용
    return found || { id: selectedId };
  }, [selectedId, items]);

  const open = (id) => nav(`/qna/ask/${id}`);
  const close = () => nav(`/qna?tab=ask`);

  const canWrite = isLoggedIn && items.length < 3;

  if (!isLoggedIn && !routeId) {
    return (
      <section className="py-10 text-center">
        <h2 className="text-xl font-bold mb-3">무.물.보</h2>
        <p className="text-sm text-gray-600">로그인 후 이용할 수 있습니다.</p>
      </section>
    );
  }

  return (
    <section className="py-6 grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">무.물.보</h2>
          <p className="text-sm text-gray-500 mt-1">내 문의 {items.length}/3</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-sm px-3 py-1 border rounded" onClick={refresh} disabled={loading}>
            새로고침
          </button>

          {canWrite ? (
            <Link
              to="/qna/ask/write"
              className="text-sm px-3 py-1 border rounded bg-black text-white shadow"
            >
              글쓰기
            </Link>
          ) : (
            <button
              type="button"
              className="text-sm px-3 py-1 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              onClick={() => alert("문의는 최대 3개까지 등록할 수 있습니다.")}
            >
              글쓰기
            </button>
          )}
        </div>
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}
      {loading && items.length === 0 && <div className="text-sm text-gray-500">불러오는 중…</div>}

      <div className="grid gap-3">
        {items.length === 0 && !loading && (
          <div className="p-6 text-center text-sm text-gray-500">등록된 글이 없습니다.</div>
        )}

        {items.map((i) => {
          const answered = i.status === "answered" || i.status === "ANSWERED";
          const active = String(selectedId) === String(i.id);

          return (
            <article
              key={i.id}
              className={`p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition ${
                active ? "ring-2 ring-red-200" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => open(i.id)}
                aria-pressed={active}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-gray-500">문의</span>
                      <h3 className="truncate font-semibold text-lg" title={i.title || ""}>
                        {i.title || "(제목 없음)"}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{i.body}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        answered ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {answered ? "답변완료" : "대기"}
                    </span>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "-"}
                    </time>
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>

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
