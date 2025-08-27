import { useMemo, useState } from "react";

const seedNotices = [
  { id: "n3", title: "연휴 관련 안내", body: "저 이제 쉴래요", createdAt: Date.now()-1334 },
  { id: "n2", title: "시스템 점검 안내", body: "일 02:00~04:00 점검 예정입니다.", createdAt: Date.now() },
  { id: "n1", title: "배송 지연 안내", body: "연휴 기간 일부 배송이 지연됩니다.", createdAt: Date.now() - 86400000 },
];

export default function NoticePanel() {
  const [notices] = useState(seedNotices);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <section className="py-6 grid gap-6">
      {/* 공지 리스트 */}
      <aside>
        <ul className="space-y-1 divide-y divide-gray-300">
          {notices.map((n) => {
            const active = n.id === selectedId;
            const panelId = `notice-panel-${n.id}`;

            return (
              <li key={n.id} className="py-2">
                {/* 제목 */}
                <button
                  type="button"
                  onClick={() => setSelectedId(active ? null : n.id)}
                  aria-expanded={active}
                  aria-controls={panelId}
                  className="w-full text-left rounded outline-none ring-0 [appearance:none]"
                >
                  <div className="flex items-start gap-2 pr-2">
                    <svg
                      className={`mt-1 h-4 w-4 flex-none transition-transform ${active ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.17l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.4a.75.75 0 0 1 .02-1.19z" />
                    </svg>

                    <div className="min-w-0">
                      <p className="truncate">{n.title}</p>
                      <time className="block text-xs text-black">
                        {new Date(n.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </button>

                {/* 상세 박스 */}
                <div
                  id={panelId}
                  role="region"
                  aria-hidden={!active}
                  className={`overflow-hidden transition-all duration-200 ${
                    active ? "mt-1 max-h-40 opacity-100" : "mt-0 max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 border rounded bg-gray-50 text-sm text-gray-700">
                    {n.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
