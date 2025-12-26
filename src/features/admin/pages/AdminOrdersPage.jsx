import React from "react";
import { Link } from "react-router-dom";
import { useOrders } from "features/orders/context/OrderContext";

import { AdminOrdersAPI } from "features/admin/api/adminOrders.api";
import { CARRIERS, LABEL_TO_STATUS } from "shared/utils/constants";

// 드롭다운에서 보여줄 라벨(표시용)
const STATUS_LABELS = ["입금대기", "입금확인", "준비중", "발송완료", "배송완료"];

export default function AdminOrdersPage() {
  const { orders = [], updateOrder } = useOrders();
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!q) return orders;
    const s = q.toLowerCase();
    return orders.filter((o) => {
      const id = (o.id || "").toLowerCase();
      const receiverName = (o.receiver?.name || "").toLowerCase();
      const depositor = (o.payment?.depositor || "").toLowerCase();
      return id.includes(s) || receiverName.includes(s) || depositor.includes(s);
    });
  }, [orders, q]);

  // 송장 입력 blur → 발송등록(ship)
  const onSetTracking = React.useCallback(
    async (id, trackingNo) => {
      try {
        const t = (trackingNo || "").trim();
        if (!t) return;

        await AdminOrdersAPI.ship(id, {
          carrier: "KOREA_POST",
          trackingNo: t,
          shippedAt: new Date().toISOString(),
        });

        // UI 업데이트: 배송정보 + 상태 라벨을 '발송완료'로
        const prev = orders.find((o) => o.id === id);
        const shipping = {
          ...(prev?.shipping || {}),
          trackingNo: t,
          carrier: "KOREA_POST",
        };

        updateOrder(id, { shipping, status: "발송완료" });
      } catch (e) {
        console.error(e);
        alert("발송 등록 중 오류가 발생했습니다.");
      }
    },
    [orders, updateOrder]
  );

  // 상태 변경 → 전용 운영 액션 호출(서버 상태머신을 따른다)
  const onChangeStatus = React.useCallback(
    async (id, nextLabel) => {
      try {
        const next = LABEL_TO_STATUS[nextLabel];
        if (!next) {
          alert("알 수 없는 라벨입니다.");
          return;
        }

        const order = orders.find((x) => x.id === id);
        const approvedAmount = order?.amounts?.grandTotal ?? order?.total ?? order?.amounts?.total ?? undefined;

        // 1) 입금확인은 반드시 depositConfirm 사용
        if (next === "DEPOSIT_CONFIRMED") {
          await AdminOrdersAPI.depositConfirm(id, {
            approvedAmount,
            memo: "관리자 승인",
          });
          // UI 업데이트(라벨 기준)
          updateOrder(id, { status: nextLabel });
          return;
        }

        // 2) 발송완료는 ship 액션으로만 (송장 입력이 트리거)
        if (next === "SHIPPED") {
          alert("송장번호 입력 후(입력칸에서 포커스가 빠지면) 자동으로 발송등록 됩니다.");
          return; // onSetTracking에서 처리
        }

        // 3) 그 외 상태는 현재 이 화면에서 직접 변경하지 않도록 막음
        alert("해당 상태 변경은 전용 운영 API/버튼으로 처리하도록 구성하는 것을 권장합니다.");
      } catch (e) {
        console.error(e);
        alert("상태 변경 중 오류가 발생했습니다.");
      }
    },
    [orders, updateOrder]
  );

  return (
    <main className="max-w-6xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-bold">관리자 – 주문 관리</h1>

      <div className="flex gap-2 items-center">
        <input
          className="border rounded p-2 w-64"
          placeholder="주문번호/수령인/입금자 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
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
              <th className="p-2 border w-[96px] whitespace-nowrap">상세</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2 font-mono">{o.id}</td>
                <td className="p-2">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                </td>
                <td className="p-2">
                  {o.receiver?.name || "-"} / {o.payment?.depositor || "-"}
                </td>
                <td className="p-2 text-right">
                  {(o.total || 0).toLocaleString()}원
                </td>

                <td className="p-2">
                  <select
                    className="border rounded p-1"
                    value={o.status}
                    onChange={(e) => onChangeStatus(o.id, e.target.value)}
                  >
                    {STATUS_LABELS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-2 align-top">
                  <div className="flex items-center gap-2 min-w-[180px] max-w-[240px]">
                    <input
                      className="border rounded p-1 w-full"
                      placeholder="송장번호"
                      defaultValue={o.shipping?.trackingNo || ""}
                      onBlur={(e) => onSetTracking(o.id, e.target.value)}
                    />
                    {o.shipping?.trackingNo && (
                      <a
                        className="text-blue-600 underline whitespace-nowrap"
                        href={CARRIERS.KOREA_POST.trackUrl(o.shipping.trackingNo)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        조회
                      </a>
                    )}
                  </div>
                </td>

                <td className="p-2 text-center">
                  <Link className="text-blue-600 underline" to={`/order/${o.id}`}>
                    상세
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={7}>
                  주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
