import { useEffect, useMemo, useRef, useState } from "react"; 
import { AdminNoticesAPI } from "features/admin/api/adminNotices.api";
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

function Modal({ open, title, children, onClose, disableClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="uppercase font-extrabold tracking-tight">{title}</h2>
          <button
            className={`${btnBase} text-gray-500`}
            onClick={() => (!disableClose ? onClose?.() : null)}
            style={tapNone}
          >
            close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminNoticesPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // detail preview
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => rows.find((r) => String(r.id) === String(selectedId)) || null,
    [rows, selectedId]
  );

  // editor
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [saving, setSaving] = useState(false);

  const reqSeqRef = useRef(0);
  const debounceRef = useRef(null);

  const load = async (p = 1) => {
    const mySeq = ++reqSeqRef.current;
    try {
      setLoading(true);
      const res = await AdminNoticesAPI.list({
        page: p,
        size: meta.size || 20,
        ...(q.trim() ? { q: q.trim() } : {}),
        sort: "createdAt,desc",
      });

      // 레이스 방지 - 최신 요청이 아니면 무시
      if (mySeq !== reqSeqRef.current) return;

      const list = res?.data ?? [];
      const m = res?.meta ?? { page: p, size: meta.size || 20, total: 0 };

      setRows(list);
      setMeta(m);
      setPage(m.page || p);

      // 선택 유지(가능하면)
      if (selectedId) {
        const exists = list.some((n) => String(n.id) === String(selectedId));
        if (!exists) setSelectedId(list[0]?.id ?? null);
      } else {
        setSelectedId(list[0]?.id ?? null);
      }
    } catch (e) {
      if (mySeq !== reqSeqRef.current) return;

      alert(getApiErrorMessage(e, "공지 목록 로드 실패"));
      setRows([]);
      setSelectedId(null);
    } finally {
      if (mySeq === reqSeqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      load(1);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [q]);

  const totalPages = useMemo(() => {
    const t = Number(meta.total) || 0;
    const s = Number(meta.size) || 20;
    return Math.max(1, Math.ceil(t / s));
  }, [meta.total, meta.size]);

  const openCreate = () => {
    setMode("create");
    setCurrentId(null);
    setForm({ title: "", body: "" });
    setOpen(true);
  };

  const openEdit = () => {
    if (!selected) return alert("왼쪽에서 공지를 선택하세요.");
    setMode("edit");
    setCurrentId(selected.id);
    setForm({ title: selected.title ?? "", body: selected.body ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return alert("제목을 입력해주세요.");
    if (!form.body.trim()) return alert("내용을 입력해주세요.");

    try {
      setSaving(true);
      if (mode === "create") {
        await AdminNoticesAPI.create({ title: form.title.trim(), body: form.body });
      } else {
        await AdminNoticesAPI.update(currentId, { title: form.title.trim(), body: form.body });
      }
      setOpen(false);
      await load(1);
    } catch (e) {
      alert(getApiErrorMessage(e, "저장 실패"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!window.confirm("삭제할까요?")) return;
    try {
      await AdminNoticesAPI.remove(selected.id);
      await load(1);
    } catch (e) {
      alert(getApiErrorMessage(e, "삭제 실패"));
    }
  };

  const previewBody = useMemo(() => {
    if (!selected?.body) return "";
    return selected.body.length > 240 ? selected.body.slice(0, 240) + "…" : selected.body;
  }, [selected?.body]);

  return (
    <main className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="uppercase font-extrabold tracking-tight text-xl md:text-2xl">notices</h2>

        <div className="flex gap-2">
          <button className={`${btnBase} px-3 py-2 rounded-xl border border-black`} onClick={openCreate} style={tapNone}>
            new
          </button>
          <button className={`${btnBase} px-3 py-2 rounded-xl border`} onClick={openEdit} style={tapNone}>
            edit
          </button>
          <button className={`${btnBase} px-3 py-2 rounded-xl border`} onClick={remove} style={tapNone}>
            delete
          </button>
          <button className={`${btnBase} px-3 py-2 rounded-xl border`} onClick={() => load(1)} style={tapNone}>
            refresh
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="검색(제목/내용)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {/* ✅ 수정: 버튼은 유지(즉시 load) */}
        <button className="px-3 py-2 border rounded" onClick={() => load(1)}>
          검색
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">로딩중…</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 왼쪽 목록 */}
        <section className="border rounded-2xl p-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">title</th>
                <th className="p-2">createdAt</th>
                <th className="p-2">preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => {
                const active = String(n.id) === String(selectedId);
                const pv = n.body ? (n.body.length > 60 ? n.body.slice(0, 60) + "…" : n.body) : "";
                return (
                  <tr
                    key={n.id}
                    className={`border-t cursor-pointer ${active ? "bg-red-50" : ""}`}
                    onClick={() => setSelectedId(n.id)}
                  >
                    <td className="p-2">
                      <div className="font-semibold">{n.title}</div>
                    </td>
                    <td className="p-2 text-xs text-center">{dt(n.createdAt)}</td>
                    <td className="p-2 text-xs text-gray-600">{pv}</td>
                  </tr>
                );
              })}

              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">
                    공지가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="mt-3 flex items-center justify-between">
            <button
              className="px-3 py-2 border rounded disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
            >
              이전
            </button>
            <div className="text-sm text-gray-600">
              {page} / {totalPages}
            </div>
            <button
              className="px-3 py-2 border rounded disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
            >
              다음
            </button>
          </div>
        </section>

        {/* 오른쪽 상세 미리보기 */}
        <section className="border rounded-2xl p-4">
          {!selected ? (
            <p className="text-sm text-gray-500">왼쪽에서 공지를 선택하세요.</p>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                #{selected.id} · {dt(selected.createdAt)}
              </div>
              <div className="text-lg font-bold">{selected.title}</div>
              <div className="border rounded-xl p-3 text-sm whitespace-pre-wrap">
                {previewBody}
              </div>
              {selected.body && selected.body.length > 240 && (
                <div className="text-xs text-gray-500">
                  (미리보기입니다. edit로 전체 수정하세요)
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={open}
        title={mode === "create" ? "new notice" : `edit notice #${currentId}`}
        onClose={() => setOpen(false)}
        disableClose={saving}
      >
        <div className="space-y-3">
          <input
            className="w-full border rounded p-3"
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="w-full border rounded p-3 min-h-[260px]"
            placeholder="내용"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setOpen(false)} disabled={saving}>
              취소
            </button>
            <button
              className={`px-4 py-2 rounded-xl text-white ${saving ? "bg-gray-300" : "bg-black hover:opacity-90"}`}
              onClick={save}
              disabled={saving}
            >
              {saving ? "저장중…" : "저장"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
