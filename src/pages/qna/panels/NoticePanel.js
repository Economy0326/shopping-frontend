import { useMemo, useState } from "react";
// TODO: 서버 연동 시 fetch해서 notices를 채우면 됨
const seedNotices = [
  { id: "n2", title: "시스템 점검 안내", body: "일 02:00~04:00 점검 예정입니다.", createdAt: Date.now() },
  { id: "n1", title: "배송 지연 안내", body: "연휴 기간 일부 배송이 지연됩니다.", createdAt: Date.now() - 86400000 },
];

export default function NoticePanel() {
  const [notices] = useState(seedNotices);
  const [selectedId, setSelectedId] = useState(notices[0]?.id);
  const selected = useMemo(() => notices.find(n => n.id === selectedId), [notices, selectedId]);

  return (
    <section className="py-6 grid md:grid-cols-5 gap-6">
      {/* 목록 */}
      <ul className="md:col-span-2 border rounded divide-y">
        {notices.map(n => (
          <li key={n.id}>
            <button
              className={`w-full text-left p-3 ${selectedId === n.id ? "bg-gray-50" : ""}`}
              onClick={() => setSelectedId(n.id)}
            >
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</div>
            </button>
          </li>
        ))}
      </ul>

      {/* 상세 */}
      <article className="md:col-span-3 border rounded p-4 min-h-[12rem]">
        {selected ? (
          <>
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <p className="text-sm text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
            <div className="mt-4 whitespace-pre-wrap">{selected.body}</div>
          </>
        ) : (
          <div className="text-gray-500">항목을 선택하세요.</div>
        )}
      </article>
    </section>
  );
}
