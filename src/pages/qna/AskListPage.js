import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AskDrawer from "./components/AskDrawer";
import { getAskById, loadAsks } from "./lib/askStore";

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
    <section className="py-6 grid md:grid-cols-5 gap-6">
      {/* 목록 */}
      <ul className="md:col-span-2 border rounded divide-y">
        <li className="flex items-center justify-between p-3">
          <h1 className="font-semibold">무.물.보</h1>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={refresh}
            >
              새로고침
            </button>
            <Link
              to="/qna/ask/write"
              className="text-xs px-2 py-1 border rounded bg-black text-white"
            >
              글쓰기
            </Link>
          </div>
        </li>

        {items.map((i) => {
          const answered = i.status === "answered";
          return (
            <li key={i.id}>
              <button
                className={`w-full text-left p-3 outline-none ring-0 [appearance:none] ${
                  selectedId === i.id ? "bg-gray-50" : ""
                }`}
                onClick={() => open(i.id)}
              >
                <div className="font-medium flex items-center gap-2">
                  <span className="text-red-500">🔒</span>
                  <span className="truncate">{i.title || "(제목 없음)"}</span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-0.5 ${
                      answered
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {answered ? "답변완료" : "대기"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  by {i.authorName} ·{" "}
                  {new Date(i.createdAt).toLocaleDateString()}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* 오른쪽 빈 패널(드로어 사용시 시각 균형용) */}
      <div className="hidden md:block md:col-span-3 border rounded p-4 text-gray-400 text-sm">
        질문을 선택하면 오른쪽 드로어에서 열립니다.
      </div>

      {/* 드로어 상세 */}
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