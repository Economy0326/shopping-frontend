import { useEffect, useMemo, useState } from "react";
import { request } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";
import { getApiErrorMessage } from "shared/api/request";
import { statusLabel, statusColor } from "shared/utils/constants";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  // 액션 UI
  const [memo, setMemo] = useState({});
  const [trackingNo, setTrackingNo] = useState({});
  const [refundMemo, setRefundMemo] = useState({});

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await request(ADMIN.ORDERS.ROOT, { params: { page, size: meta.size } });
      setList(res?.data ?? []);
      setMeta(res?.meta ?? { page, size: meta.size, total: 0 });
    } catch (e) {
      alert(getApiErrorMessage(e, "주문 목록 로드 실패"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, []);

  const hasNext = useMemo(() => meta.page * meta.size < meta.total, [meta]);

  const depositConfirm = async (id) => {
    try {
      await request(ADMIN.ORDERS.DEPOSIT(id), {
        method: "POST",
        body: memo[id] ? { memo: memo[id] } : undefined,
      });
      alert("입금 확인 처리 완료");
      await load(meta.page);
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const ship = async (id) => {
    const no = String(trackingNo[id] ?? "").trim();
    if (!no) return alert("송장번호를 입력하세요.");

    try {
      await request(ADMIN.ORDERS.SHIP(id), {
        method: "POST",
        body: {
          carrier: "KOREA_POST", // 직접택배 운영 + 우체국 고정
          trackingNo: no,
        },
      });
      alert("발송 등록 완료");
      await load(meta.page);
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const refund = async (order) => {
    // 명세: Full refund only, amount === amounts.grandTotal -> 부분 환불 불가
    if (!["CANCELED", "DELIVERED"].includes(order.status)) {
      return alert("환불은 CANCELED 또는 DELIVERED 상태에서만 가능합니다.");
    }

    try {
      await request(ADMIN.ORDERS.REFUND(order.id), {
        method: "POST",
        body: {
          amount: order?.amounts?.grandTotal,
          memo: refundMemo[order.id] ?? "",
        },
      });
      alert("환불 로그 기록 완료");
      await load(meta.page);
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 주문 관리</h1>

      {loading && <p>로딩 중…</p>}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[980px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2">주문ID</th>
              <th className="border p-2">상태</th>
              <th className="border p-2">금액</th>
              <th className="border p-2">입금확인</th>
              <th className="border p-2">발송등록</th>
              <th className="border p-2">환불로그</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td className="border p-2 font-mono">{o.id}</td>
                <td className="border p-2">
                  <StatusBadge status={o.status} />
                </td>
                <td className="border p-2">{formatWon(o?.amounts?.grandTotal)}</td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <input
                      className="border rounded px-2 py-1 w-40"
                      placeholder="memo(선택)"
                      value={memo[o.id] ?? ""}
                      onChange={(e) => setMemo((m) => ({ ...m, [o.id]: e.target.value }))}
                    />
                    <button
                      className="border rounded px-2 py-1 hover:bg-gray-50"
                      onClick={() => depositConfirm(o.id)}
                    >
                      입금확인
                    </button>
                  </div>
                </td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <input
                      className="border rounded px-2 py-1 w-40 font-mono"
                      placeholder="송장번호"
                      value={trackingNo[o.id] ?? ""}
                      onChange={(e) => setTrackingNo((m) => ({ ...m, [o.id]: e.target.value }))}
                    />
                    <button
                      className="border rounded px-2 py-1 hover:bg-gray-50"
                      onClick={() => ship(o.id)}
                    >
                      발송등록
                    </button>
                  </div>
                </td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <input
                      className="border rounded px-2 py-1 w-40"
                      placeholder="환불 memo(선택)"
                      value={refundMemo[o.id] ?? ""}
                      onChange={(e) => setRefundMemo((m) => ({ ...m, [o.id]: e.target.value }))}
                    />
                    <button
                      className="border rounded px-2 py-1 hover:bg-gray-50"
                      onClick={() => refund(o)}
                    >
                      환불기록
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Full refund only: {formatWon(o?.amounts?.grandTotal)}
                  </div>
                </td>
              </tr>
            ))}

            {list.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasNext && (
        <button
          onClick={() => load((meta.page || 1) + 1)}
          className="mt-4 w-full py-2 border"
        >
          다음 페이지
        </button>
      )}
    </main>
  );
}
