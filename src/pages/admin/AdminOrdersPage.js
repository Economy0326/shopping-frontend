import React from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";

const STATUSES = ["입금대기", "입금확인", "준비중", "발송완료", "배송완료"];

export default function AdminOrdersPage() {
  const { orders, updateOrder } = useOrders();
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!q) return orders;
    const s = q.toLowerCase();
    return orders.filter(o =>
      o.id.toLowerCase().includes(s) ||
      (o.receiver?.name || "").toLowerCase().includes(s) ||
      (o.payment?.depositor || "").toLowerCase().includes(s)
    );
  }, [orders, q]);

  const onChangeStatus = async (id, status) => {
    updateOrder(id, { status });
  };

  const onSetTracking = async (id, trackingNo) => {
    const shipping = { ...(orders.find(o=>o.id===id)?.shipping || {}), trackingNo };
    updateOrder(id, { shipping });
  };

  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">관리자 – 주문 관리</h1>

      <div className="flex gap-2 items-center">
        <input
          className="border rounded p-2 w-64"
          placeholder="주문번호/수령인/입금자 검색"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <span className="text-sm text-gray-500">총 {filtered.length}건</span>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full min-w-[900px] text-sm table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border w-[200px] whitespace-nowrap">주문번호</th>
              <th className="p-2 border w-[180px] whitespace-nowrap">주문일</th>
              <th className="p-2 border w-[180px] whitespace-nowrap">수령인/입금자</th>
              <th className="p-2 border w-[120px] whitespace-nowrap">금액</th>
              <th className="p-2 border w-[140px] whitespace-nowrap">상태</th>
              <th className="p-2 border w-[220px] whitespace-nowrap">송장번호</th>
              <th className="p-2 border w-[96px]  whitespace-nowrap">상세</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-2 font-mono">{o.id}</td>
                <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  {o.receiver?.name} / {o.payment?.depositor}
                </td>
                <td className="p-2 text-right">{(o.total || 0).toLocaleString()}원</td>
                <td className="p-2">
                  <select
                    className="border rounded p-1"
                    value={o.status}
                    onChange={e=>onChangeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-2 min-w-[180px] max-w-[240px]">
                    <input
                      className="border rounded p-1 w-full"
                      placeholder="송장번호"
                      defaultValue={o.shipping?.trackingNo || ""}
                      onBlur={e=>onSetTracking(o.id, e.target.value)}
                    />
                    {o.shipping?.trackingNo && (
                      <a
                        className="text-blue-600 underline whitespace-nowrap"
                        href={`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${encodeURIComponent(o.shipping.trackingNo)}`}
                        target="_blank" rel="noreferrer"
                      >
                        조회
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <Link className="text-blue-600 underline" to={`/order/${o.id}`}>상세</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={7}>주문이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}