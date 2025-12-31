import React from "react";
import { ADMIN } from "shared/api/endpoints";
import { request } from "shared/api/request";
import { getApiErrorMessage } from "shared/api/request";
import { Link } from "react-router-dom";

export default function AdminReturnsPage() {
  const [returns, setReturns] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await request(ADMIN.RETURNS.ROOT);
      setReturns(res?.data ?? []);
    } catch (e) {
      alert(getApiErrorMessage(e, "반품 목록 로드 실패"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    if (!window.confirm("반품을 승인하시겠습니까?")) return;
    try {
      await request(ADMIN.RETURNS.APPROVE(id), { method: "POST" });
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)));
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const reject = async (id) => {
    const reason = window.prompt("거절 사유를 입력하세요");
    if (!reason) return;
    try {
      await request(ADMIN.RETURNS.REJECT(id), {
        method: "POST",
        body: { reason },
      });
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 반품 관리</h1>

      {loading && <p>로딩 중…</p>}

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2">반품ID</th>
            <th className="border p-2">주문ID</th>
            <th className="border p-2">상태</th>
            <th className="border p-2">액션</th>
            <th className="border p-2">동선</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((r) => (
            <tr key={r.id}>
              <td className="border p-2 font-mono">{r.id}</td>
              <td className="border p-2 font-mono">{r.orderId}</td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">
                {r.status === "REQUESTED" && (
                  <>
                    <button onClick={() => approve(r.id)} className="mr-2 underline">
                      승인
                    </button>
                    <button onClick={() => reject(r.id)} className="underline">
                      거절
                    </button>
                  </>
                )}
              </td>
              <td className="border p-2 text-xs">
                {/* 주문 상세/환불 처리로 이동 동선 (관리자 주문 관리가 목록형이라면 검색/필터로도 OK) */}
                <Link to={`/order/${r.orderId}`} className="underline">
                  (유저)주문상세
                </Link>
                <span className="mx-2 text-gray-300">|</span>
                <Link to={`/admin/orders`} className="underline">
                  주문관리(환불)
                </Link>
              </td>
            </tr>
          ))}

          {returns.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                반품 요청이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
