import { useMemo, useState } from "react";

const seedAsks = [
  { id: "q1", title: "사이즈 문의", body: "M와 L 중 추천 부탁드려요.", author: "guest", createdAt: Date.now() - 7200000 },
];

export default function AskPanel({ isLoggedIn, username }) {
  const [items, setItems] = useState(seedAsks);
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const selected = useMemo(() => items.find(i => i.id === selectedId), [items, selectedId]);

  const createAsk = () => {
    if (!isLoggedIn) return alert("로그인 후 작성할 수 있어요.");
    if (!title.trim() || !body.trim()) return alert("제목/내용을 입력하세요.");
    const id = "q" + Math.random().toString(36).slice(2, 8);
    const next = { id, title, body, author: username || "guest", createdAt: Date.now() };
    const updated = [next, ...items];
    setItems(updated);
    setSelectedId(id);
    setTitle(""); setBody("");

    // TODO: 서버 연동 시 여기서 POST → 성공 후 목록 재요청
  };

  return (
    <section className="py-6 grid md:grid-cols-5 gap-6">
      {/* 목록 */}
      <ul className="md:col-span-2 border rounded divide-y">
        {items.map(i => (
          <li key={i.id}>
            <button
              className={`w-full text-left p-3 ${selectedId === i.id ? "bg-gray-50" : ""}`}
              onClick={() => setSelectedId(i.id)}
            >
              <div className="font-medium">{i.title}</div>
              <div className="text-xs text-gray-500">
                by {i.author} · {new Date(i.createdAt).toLocaleDateString()}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* 상세 + 작성 */}
      <article className="md:col-span-3 border rounded p-4">
        {/* 상세 */}
        <div className="min-h-[8rem]">
          {selected ? (
            <>
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <p className="text-sm text-gray-500">
                by {selected.author} · {new Date(selected.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 whitespace-pre-wrap">{selected.body}</div>
            </>
          ) : (
            <div className="text-gray-500">질문을 선택하세요.</div>
          )}
        </div>

        {/* 작성 */}
        <div className="mt-8 border-t pt-4">
          <h3 className="font-semibold mb-2">질문 작성</h3>
          {!isLoggedIn && <div className="text-sm text-red-500 mb-2">로그인 후 작성할 수 있어요.</div>}
          <input
            className="w-full border rounded p-3 mb-2"
            placeholder="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={!isLoggedIn}
          />
          <textarea
            className="w-full border rounded p-3 h-32 mb-2"
            placeholder="내용"
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={!isLoggedIn}
          />
          <button
            className="px-3 py-2 border rounded bg-black text-white disabled:opacity-40"
            onClick={createAsk}
            disabled={!isLoggedIn}
          >
            등록
          </button>
        </div>
      </article>
    </section>
  );
}
