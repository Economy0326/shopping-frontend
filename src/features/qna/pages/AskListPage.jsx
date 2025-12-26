import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AskDrawer from "features/qna/components/AskDrawer";
import { getAskById, loadAsks } from "features/qna/lib/askStore";

export default function AskListPage({
  currentUserId,
  currentUserName,
  isAdmin,
}) {
  const nav = useNavigate();
  const { id: routeId } = useParams();

  const [items, setItems] = useState([]);
  const [authorized, setAuthorized] = useState({}); // { [id]: true }
  const [selectedId, setSelectedId] = useState(null);

  // 초기 로드
  useEffect(() => {
    setItems(loadAsks());
  }, []);

  // 라우트 파라미터에 따라 선택 갱신
  useEffect(() => {
    setSelectedId(routeId || null);
  }, [routeId]);

  const refresh = () => setItems(loadAsks());

  const selected = useMemo(
    () => (selectedId ? getAskById(selectedId) : null),
    [selectedId, items]
  );

  const open = (id) => nav(`/qna/ask/${id}`);
  const close = () => nav(`/qna/ask`);

  return (
    <section className="py-6 grid gap-6">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">무.물.보</h2>
        <div className="flex items-center gap-2">
          <button className="text-xs px-2 py-1 border rounded" onClick={refresh}>
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

      {/* 번호 리스트 + 시간 */}
      <ol
        className="
          bg-white
          list-decimal list-outside pl-3
          space-y-1
        "
        style={{ listStyleType: "decimal" }} 
      >
        {items.map((i) => {
          const answered = i.status === "answered";
          const active = selectedId === i.id;

          return (
            <li
              key={i.id}
              className={`list-item p-3 rounded ${active ? "bg-gray-50" : ""}`}
              style={{ listStyleType: "decimal" }} 
            >
              <button
                type="button"
                onClick={() => open(i.id)}
                aria-pressed={active}
                className="w-full flex items-center gap-3 hover:opacity-90 text-left outline-none ring-0 [appearance:none]"
              >
                {/* 제목 + 배지 */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span>🔒</span>
                    <span
                      className="truncate font-medium"
                      title={i.title || ""}
                    >
                      귀찮게하네
                    </span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 ${
                      answered
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {answered ? "답변완료" : "대기"}
                  </span>
                </div>

                {/* 시간 */}
                <time className="shrink-0 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(i.createdAt).toLocaleString()}
                </time>
              </button>
            </li>
          );
        })}

        {items.length === 0 && (
          <li className="p-6 text-center text-sm text-gray-500 list-none">
            등록된 글이 없습니다.
          </li>
        )}
      </ol>

      {/* 드로어 상세 (오버레이로 표시) */}
      {selected && (
        <AskDrawer
          ask={selected}
          onClose={close}
          onUpdated={refresh}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          authorizedMap={authorized}
          setAuthorized={setAuthorized}
        />
      )}
    </section>
  );
}
