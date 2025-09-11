const LS_KEY = "myshop_notices_v1";

const seedNotices = [
  { id: "n3", title: "연휴 관련 안내", body: "저 이제 쉴래요", createdAt: Date.now() - 1334 },
  { id: "n2", title: "시스템 점검 안내", body: "일 02:00~04:00 점검 예정입니다.", createdAt: Date.now() },
  { id: "n1", title: "배송 지연 안내", body: "연휴 기간 일부 배송이 지연됩니다.", createdAt: Date.now() - 86400000 },
];

const byDesc = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);

export function loadNotices() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = raw ? JSON.parse(raw) : seedNotices;
    return (Array.isArray(list) ? list : seedNotices).slice().sort(byDesc);
  } catch {
    return seedNotices.slice().sort(byDesc);
  }
}

export function getNoticeById(id) {
  return loadNotices().find((n) => n.id === id) || null;
}

// (선택) 관리자용 추가 함수
export function addNotice({ title, body }) {
  const list = loadNotices();
  const next = {
    id: "n" + Math.random().toString(36).slice(2, 8),
    title: String(title || "").trim(),
    body: String(body || "").trim(),
    createdAt: Date.now(),
  };
  const updated = [next, ...list];
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  return next;
}