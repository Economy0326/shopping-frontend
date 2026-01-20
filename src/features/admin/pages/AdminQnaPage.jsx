import { useEffect, useMemo, useState } from "react";
import { AdminQnaAPI } from "features/admin/api/adminQna.api";
import { getApiErrorMessage } from "shared/api/request";

const btnBase =
  "uppercase font-extrabold tracking-tight text-sm md:text-base outline-none ring-0 [appearance:none] select-none";
const tapNone = { WebkitTapHighlightColor: "transparent" };

function dt(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function AdminQnaPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(""); // waiting/answered
  const [q, setQ] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [replyBody, setReplyBody] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await AdminQnaAPI.list({
        page,
        size: meta.size,
        ...(status ? { status } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
      });
      setRows(res?.data ?? []);
      setMeta(res?.meta ?? { page, size: meta.size, total: 0 });
    } catch (e) {
      alert(getApiErrorMessage(e, "문의 목록 로드 실패"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await AdminQnaAPI.get(id);
      const d = res?.data ?? res ?? null;
      setDetail(d);
      setReplyBody("");
    } catch (e) {
      alert(getApiErrorMessage(e, "문의 상세 로드 실패"));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, [status]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((a) => {
      const t = String(a.title ?? "").toLowerCase();
      const b = String(a.body ?? "").toLowerCase();
      const u = String(a.user?.email ?? "").toLowerCase();
      return t.includes(qq) || b.includes(qq) || u.includes(qq);
    });
  }, [rows, q]);

  const hasNext = useMemo(
    () => (meta.page || 1) * (meta.size || 20) < (meta.total || 0),
    [meta]
  );

  const select = async (id) => {
    setSelectedId(id);
    await loadDetail(id);
  };

  const markAnsweredInList = (id) => {
    setRows((prev) =>
      prev.map((r) => (String(r.id) === String(id) ? { ...r, status: "answered" } : r))
    );
  };

  const submitReply = async () => {
    if (!selectedId) return;
    if (!replyBody.trim()) return alert("답변 내용을 입력해주세요.");

    try {
      setReplySaving(true);
      await AdminQnaAPI.reply(selectedId, { body: replyBody.trim() });

      // 리스트 즉시 반영
      markAnsweredInList(selectedId);

      // 상세도 다시 로드해서 replies 표시
      await loadDetail(selectedId);

      // 필터가 waiting이면 답변 후 사라져야 하므로 재조회
      if (status === "waiting") await load(1);

      setReplyBody("");
    } catch (e) {
      alert(getApiErrorMessage(e, "답변 등록 실패"));
    } finally {
      setReplySaving(false);
    }
  };

  return (
    <main className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="uppercase font-extrabold tracking-tight text-xl md:text-2xl">qna</h2>
        <button className={`${btnBase} px-3 py-2 rounded-xl border`} onClick={() => load(1)} style={tapNone}>
          refresh
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">전체</option>
          <option value="waiting">waiting</option>
          <option value="answered">answered</option>
        </select>

        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="검색(제목/내용/이메일)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="border rounded-2xl p-3 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-gray-500">로딩중…</p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">title</th>
                  <th className="p-2">status</th>
                  <th className="p-2">user</th>
                  <th className="p-2">date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={`border-t cursor-pointer ${String(a.id) === String(selectedId) ? "bg-red-50" : ""}`}
                    onClick={() => select(a.id)}
                  >
                    <td className="p-2">
                      <div className="font-semibold">{a.title ?? "(no title)"}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{a.body}</div>
                    </td>
                    <td className="p-2 text-center">{a.status ?? "-"}</td>
                    <td className="p-2 text-center text-xs">{a.user?.email ?? "-"}</td>
                    <td className="p-2 text-center text-xs">{dt(a.createdAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {hasNext && (
            <button className="w-full py-2 border mt-3" onClick={() => load((meta.page || 1) + 1)}>
              다음 페이지
            </button>
          )}
        </section>

        <section className="border rounded-2xl p-4">
          {!selectedId ? (
            <p className="text-sm text-gray-500">왼쪽에서 문의를 선택하세요.</p>
          ) : detailLoading ? (
            <p className="text-sm text-gray-500">상세 로딩중…</p>
          ) : !detail ? (
            <p className="text-sm text-gray-500">상세를 불러오지 못했습니다.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">
                  #{detail.id} · {detail.user?.email ?? "-"} · {dt(detail.createdAt)}
                </div>
                <div className="text-lg font-bold mt-1">{detail.title ?? "(no title)"}</div>
              </div>

              <div className="border rounded-xl p-3 text-sm whitespace-pre-wrap">{detail.body}</div>

              <div className="space-y-2">
                <div className="font-bold">Replies</div>
                {detail.replies?.length ? (
                  detail.replies.map((r) => (
                    <div key={r.id} className="border rounded-xl p-3 text-sm">
                      <div className="text-xs text-gray-500">{dt(r.createdAt)}</div>
                      <div className="whitespace-pre-wrap">{r.body}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">아직 답변이 없습니다.</p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="font-bold">New Reply</div>
                <textarea
                  className="w-full border rounded-xl p-3 text-sm min-h-[140px]"
                  placeholder="답변을 입력하세요..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    className={`px-4 py-2 rounded-xl text-white ${
                      replySaving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
                    }`}
                    onClick={submitReply}
                    disabled={replySaving}
                  >
                    {replySaving ? "등록 중…" : "답변 등록"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
