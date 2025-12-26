const LS_KEY = "mock_asks_v1";

function read() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

function nextId(items) {
  const max = items.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
  return max + 1;
}

export function loadAsks() {
  return read();
}

export function getAskById(id) {
  const items = read();
  return items.find((i) => String(i.id) === String(id)) || null;
}

export function addAsk(payload) {
  const items = read();
  const id = nextId(items);
  const now = new Date().toISOString();
  const item = {
    id,
    title: payload.title || "(제목 없음)",
    body: payload.body || "",
    authorId: payload.authorId || "guest",
    authorName: payload.authorName || "guest",
    password: payload.password || "",
    status: "waiting",
    createdAt: now,
    replies: [],
  };
  items.unshift(item);
  write(items);
  return item;
}

export function addReply({ askId, body, adminId, adminName }) {
  const items = read();
  const ask = items.find((i) => String(i.id) === String(askId));
  if (!ask) return null;
  const r = {
    id: nextId(ask.replies || []),
    body,
    isAdmin: true,
    adminId,
    adminName,
    createdAt: new Date().toISOString(),
  };
  ask.replies = [...(ask.replies || []), r];
  ask.status = "answered";
  write(items);
  return r;
}

export default { loadAsks, getAskById, addAsk, addReply };
