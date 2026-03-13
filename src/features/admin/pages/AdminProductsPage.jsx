import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminProductsAPI } from "features/admin/api/adminProducts.api";
import { getApiErrorMessage } from "shared/api/request";
import ConfirmModal from "shared/ui/ConfirmModal";

export default function AdminProductsPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await AdminProductsAPI.list({
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(category ? { categorySlug: category } : {}),
      });

      setRows(res?.data ?? []);
    } catch (e) {
      setErr(getApiErrorMessage(e, "상품 목록 로드 실패"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    // 서버가 필터를 지원 안 해도 최소 동작하도록 2차 필터
    return rows.filter((p) => {
      const okQ = q.trim()
        ? String(p?.name ?? "").toLowerCase().includes(q.trim().toLowerCase())
        : true;
      const rowCategory = String(p?.categorySlug ?? p?.category ?? "");
      const okC = category ? rowCategory === category : true;
      return okQ && okC;
    });
  }, [rows, q, category]);

  const openRemoveModal = (id) => {
    if (!id) return;
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const confirmRemove = async () => {
    if (!deleteTargetId) return;

    try {
      setLoading(true);
      setErr("");
      await AdminProductsAPI.remove(deleteTargetId);
      await load();
    } catch (e) {
      setErr(getApiErrorMessage(e, "삭제 실패"));
    } finally {
      setLoading(false);
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">관리자 · 상품 관리</h1>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => nav("/admin/products/new")}
        >
          + 상품 등록
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="상품명 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">전체 카테고리</option>
          <option value="outer">outer</option>
          <option value="top">top</option>
          <option value="bottom">bottom</option>
          <option value="acc">acc</option>
          <option value="for-artist">for-artist</option>
          <option value="look">look</option>
        </select>

        <button className="px-3 py-2 border rounded" onClick={load}>
          새로고침
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-2">로딩중…</p>}
      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[860px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">이름</th>
              <th className="border p-2">카테고리</th>
              <th className="border p-2">가격</th>
              <th className="border p-2">바로보기</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const rowCategory = p.categorySlug ?? p.category;
              const previewUrl =
                rowCategory === "look" ? `/look/${p.id}` : `/product/${p.id}`;

              return (
                <tr key={p.id}>
                  <td className="border p-2 font-mono">{p.id}</td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{rowCategory}</td>
                  <td className="border p-2 text-right">
                    {(Number(p.price) || 0).toLocaleString()}원
                  </td>
                  <td className="border p-2">
                    <Link className="underline" to={previewUrl}>
                      상품 상세 보기
                    </Link>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <Link
                        to={previewUrl}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        미리보기
                      </Link>

                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        편집
                      </Link>

                      <button
                        type="button"
                        className="px-2 py-1 border rounded text-sm text-red-600"
                        onClick={() => openRemoveModal(p.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={deleteOpen}
        title="상품 삭제"
        message="이 상품을 삭제할까요? (복구 불가)"
        confirmText="삭제"
        cancelText="취소"
        loading={loading}
        onConfirm={confirmRemove}
        onCancel={() => {
          if (loading) return;
          setDeleteOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </main>
  );
}