import React from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";

import { AdminOrdersAPI } from "../../api/admin/orders";
import { CARRIERS, LABEL_TO_STATUS } from "../../lib/constants";

// 드롭다운에서 보여줄 라벨(표시용)
const STATUS_LABELS = ["입금대기", "입금확인", "준비중", "발송완료", "배송완료"];

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

  // 상태 변경 → 전용 운영 액션 호출(서버 상태머신을 따른다)
  const onChangeStatus = async (id, nextLabel) => {
    try {
      const next = LABEL_TO_STATUS[nextLabel];
      if (!next) {
        alert("알 수 없는 라벨입니다.");
        return;
      }

      const order = orders.find(x => x.id === id);
      const approvedAmount =
        order?.amounts?.grandTotal ?? order?.total ?? undefined;

      // 1) 입금확인은 반드시 depositConfirm 사용
      if (next === "DEPOSIT_CONFIRMED") {
        await AdminOrdersAPI.depositConfirm(id, {
          // 필요하면 noticeId 입력을 붙여주세요.
          approvedAmount,
          memo: "관리자 승인",
        });
        // UI 업데이트(라벨 기준)
        updateOrder(id, { status: nextLabel });
        return;
      }

      // 2) 발송완료는 ship 액션으로만 (송장 입력이 트리거)
      if (next === "SHIPPED") {
        alert("송장번호 입력 후 자동으로 발송등록 됩니다.");
        return; // onSetTracking에서 처리
      }

      // 3) 그 외(준비중/배송완료 등)는 서버에서 자동 전이를 유도하고,
      //    임의 PATCH로 바꾸지 않는 것을 권장합니다.
      //    정말 필요하면 전용 진행 API를 추가로 정의하세요.
    } catch (e) {
      console.error(e);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 송장 입력 blur → 발송등록(ship)
  const onSetTracking = async (id, trackingNo) => {
    try {
      if (!trackingNo) return;
      await AdminOrdersAPI.ship(id, {
        carrier: "KOREA_POST",
        trackingNo,
        shippedAt: new Date().toISOString(),
      });
      // UI 업데이트: 배송정보 + 상태 라벨을 '발송완료'로
      const shipping = { ...(orders.find(o => o.id === id)?.shipping || {}), trackingNo, carrier: "KOREA_POST" };
      updateOrder(id, { shipping, status: "발송완료" });
    } catch (e) {
      console.error(e);
      alert("발송 등록 중 오류가 발생했습니다.");
    }
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
                    {STATUS_LABELS.map(s => <option key={s} value={s}>{s}</option>)}
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
                        href={CARRIERS.KOREA_POST.trackUrl(o.shipping.trackingNo)}
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
