import { useEffect, useMemo, useRef, useState } from "react";

import { PanelShell } from "features/mypage/panels/_shared";
import { getApiErrorMessage } from "shared/api/request";
import { printCancellation } from "shared/utils/print";
import { OrdersAPI } from "features/orders/api/orders.api";
import { OrderStatus } from "shared/constants/orderStatus";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

function getCancelDate(order) {
  return (
    order?.canceledAt ||
    order?.cancelledAt ||
    order?.cancelRequestedAt ||
    order?.updatedAt ||
    order?.createdAt ||
    "-"
  );
}

function StatusBadge({ status }) {
  const map = {
    [OrderStatus.CANCELED]: "취소 완료",
  };

  const color =
    {
      [OrderStatus.CANCELED]: "bg-rose-100 text-rose-800",
    }[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {map[status] || status}
    </span>
  );
}

function CancellationCard({ order, onPrint }) {
  const rep = order.representativeItem || {};

  return (
    <article className="w-full border rounded-2xl bg-white shadow-sm p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
          {rep.thumbnailUrl ? (
            <img
              src={rep.thumbnailUrl}
              alt={rep.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-1 min-w-0">
          <div className="text-base md:text-lg font-medium truncate" title={rep.name}>
            {rep.name || "상품명"}

            {order.itemsCount > 1 && (
              <span className="ml-1 text-sm text-gray-500">
                외 {order.itemsCount - 1}개
              </span>
            )}
          </div>

          <div className="text-sm font-semibold">
            환불/취소금액: {formatWon(order?.amounts?.grandTotal)}
          </div>

          <div className="text-xs text-gray-500">
            취소 일자: {getCancelDate(order)}
          </div>

          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="sm:ml-auto flex items-center">
          <button
            type="button"
            onClick={() => onPrint?.(order)}
            className="rounded-xl px-3 py-2 text-xs md:text-sm border hover:bg-gray-50"
          >
            증빙 인쇄
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CancellationsPanel() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const listRef = useRef(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);

      const res = await OrdersAPI.list({
        page,
        size: meta.size || 10,
        sort: "createdAt,desc",
        status: OrderStatus.CANCELED,
      });

      const rows = Array.isArray(res?.data) ? res.data : [];

      // 백엔드 필터가 혹시 안 먹어도 프론트에서 한 번 더 방어
      const canceledRows = rows.filter(
        (order) => order?.status === OrderStatus.CANCELED,
      );

      const m = res?.meta ?? { page, size: meta.size || 10, total: 0 };

      setList((prev) => (page === 1 ? canceledRows : [...prev, ...canceledRows]));
      setMeta(m);
      setErr("");
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasNext = useMemo(() => meta.page * meta.size < meta.total, [meta]);

  const handlePrint = (order) => {
    printCancellation(order);
  };

  return (
    <PanelShell title="취소 내역">
      <div ref={listRef} className="min-h-[60vh] md:max-h-[80vh] md:overflow-y-auto pr-1">
        {err && <div className="text-rose-600 mb-3">{err}</div>}

        {loading && list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p>로딩중…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p className="font-bold text-xl">결제 취소 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {list.map((o) => (
              <CancellationCard key={o.id} order={o} onPrint={handlePrint} />
            ))}
          </div>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={() => load((meta.page || 1) + 1)}
            className="mt-4 w-full py-2 border"
          >
            {loading ? "로딩…" : "더 보기"}
          </button>
        )}
      </div>
    </PanelShell>
  );
}