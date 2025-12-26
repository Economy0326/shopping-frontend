// 데모용 localStorage 스토어 (운영에서는 서버/DB + 해시 저장으로 교체)
const LS_KEY = "myshop_asks_v1";

const seedAsks = [
  {
    id: "q1",
    title: "사이즈 문의",
    body: "M와 L 중 추천 부탁드려요.",
    authorId: "guest",
    authorName: "guest",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    isSecret: true,             // 모든 글 비밀글
    password: "1234",           // 데모: 평문 (운영: 해시)
    status: "waiting",          // waiting | answered
    replies: [],                // {id, body, authorId, authorName, createdAt, isAdmin}
  },
];

export function loadAsks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = raw ? JSON.parse(raw) : seedAsks;
    return Array.isArray(list) && list.length ? list : seedAsks;
  } catch {
    return seedAsks;
  }
}

export function saveAsks(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function getAskById(id) {
  return loadAsks().find((a) => a.id === id) || null;
}

export function addAsk({ title, body, authorId, authorName, password }) {
  const items = loadAsks();
  const id = "q" + Math.random().toString(36).slice(2, 8);
  const next = {
    id,
    title: String(title || "").trim(),
    body: String(body || "").trim(),
    authorId: authorId || "guest",
    authorName: authorName || "guest",
    createdAt: Date.now(),
    isSecret: true, // 요구사항: 항상 비밀글
    password: String(password || ""),
    status: "waiting",
    replies: [],
  };
  const updated = [next, ...items];
  saveAsks(updated);
  return next;
}

export function addReply({ askId, body, adminId, adminName }) {
  const items = loadAsks();
  const idx = items.findIndex((a) => a.id === askId);
  if (idx === -1) return null;

  const r = {
    id: "r" + Math.random().toString(36).slice(2, 8),
    body: String(body || "").trim(),
    authorId: adminId,
    authorName: adminName || "admin",
    createdAt: Date.now(),
    isAdmin: true,
  };

  const ask = { ...items[idx] };
  ask.replies = [r, ...(ask.replies || [])];
  ask.status = "answered";

  const updated = [...items];
  updated[idx] = ask;
  saveAsks(updated);
  return r;
}