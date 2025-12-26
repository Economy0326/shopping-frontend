const LS_KEY = "mock_notices_v1";

function read() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadNotices() {
  const items = read();
  if (items.length === 0) {
    const now = new Date().toISOString();
    const seed = [
      { id: 1, title: "서비스 점검 안내", body: "곧 점검합니다.", createdAt: now },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(seed));
    return seed;
  }
  return items;
}

export function getNoticeById(id) {
  const items = read();
  return items.find((i) => String(i.id) === String(id)) || null;
}

export default { loadNotices, getNoticeById };
