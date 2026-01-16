import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminProductsAPI } from "features/admin/api/adminProducts.api";
import { getApiErrorMessage } from "shared/api/request";

export default function AdminProductsPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await AdminProductsAPI.list({
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(category ? { category } : {}),
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
      const okC = category ? String(p?.category ?? "") === category : true;
      return okQ && okC;
    });
  }, [rows, q, category]);

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
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="border p-2 font-mono">{p.id}</td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2 text-right">
                  {(Number(p.price) || 0).toLocaleString()}원
                </td>
                <td className="border p-2">
                  <Link className="underline" to={`/product/${p.id}`}>
                    상품 상세 보기
                  </Link>
                </td>
              </tr>
            ))}

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
    </main>
  );
}