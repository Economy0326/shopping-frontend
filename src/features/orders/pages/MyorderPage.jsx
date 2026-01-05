import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OrdersAPI } from "features/orders/api/orders.api";
import { getApiErrorMessage } from "shared/api/request";

export default function MyOrdersPage() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await OrdersAPI.list({ page, size: meta.size, sort: "createdAt,desc" });
      const rows = res?.data ?? [];
      setList((prev) => (page === 1 ? rows : [...prev, ...rows]));
      setMeta(res?.meta ?? { page, size: meta.size, total: 0 });
      setErr("");
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, []);

  const hasNext = meta.page * meta.size < meta.total;

  if (loading && list.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>로딩중…</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">나의 주문</h1>

      {err && <p className="text-rose-600 mb-3">{err}</p>}

      {list.length === 0 ? (
        <>
          <p className="mt-4 text-sm text-gray-600">아직 주문이 없습니다.</p>
          <Link to="/" className="text-blue-600 underline mt-2 inline-block">
            상품 보러가기
          </Link>
        </>
      ) : (
        <>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">주문번호</th>
                <th className="border p-2 text-left">주문일</th>
                <th className="border p-2">상태</th>
                <th className="border p-2 text-right">금액</th>
                <th className="border p-2">상세</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td className="border p-2 font-mono">{o.id}</td>
                  <td className="border p-2">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="border p-2 text-center">{o.status}</td>
                  <td className="border p-2 text-right">
                    {(o?.amounts?.grandTotal || 0).toLocaleString()}원
                  </td>
                  <td className="border p-2 text-center">
                    <Link to={`/order/${o.id}`} className="text-blue-600 underline">
                      보기
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasNext && (
            <button onClick={() => load(meta.page + 1)} className="mt-4 w-full py-2 border">
              {loading ? "로딩…" : "더 보기"}
            </button>
          )}
        </>
      )}
    </main>
  );
}
