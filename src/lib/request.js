import { API_BASE } from "./env";

/**
 * 공통 fetch 래퍼
 * - credentials: 'include' (JWT 쿠키 대비)
 * - JSON 자동 파싱, 에러 표준화
 */

export async function request(path, { method = "GET", body, headers } = {}) {
  if (!API_BASE) {
    // API 호출이 필요한 시점인데 API_BASE가 없다면 개발자 경험을 위해 에러
    throw Object.assign(new Error("API_BASE not set"), { status: 0 });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // JWT 쿠키 사용 대비
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    // 200~299가 아닌 경우 에러 처리
    const err = new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); }
  catch { return null; }
}