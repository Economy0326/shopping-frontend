import { useEffect, useMemo, useRef, useState } from "react";
import { PanelShell } from "features/mypage/panels/_shared";
import { getApiErrorMessage } from "shared/api/request";
import { printCancellation } from "shared/utils/print";
import { OrdersAPI } from "features/orders/api/orders.api";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

function StatusBadge({ status }) {
  const map = {
    REQUESTED: "요청됨",
    PROCESSING: "처리중",
    REFUNDING: "환불중",
    REFUNDED: "환불완료",
    FAILED: "실패",
  };
  const color = {
    REQUESTED: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-sky-100 text-sky-800",
    REFUNDING: "bg-purple-100 text-purple-800",
    REFUNDED: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-rose-100 text-rose-800",
  }[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {map[status] || status}
    </span>
  );
}

function CancellationCard({ cancel, onPrint }) {
  const items = cancel.items || [];
  const first = items[0] || {};
  const others = Math.max(0, items.length - 1);

  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (Number(it.qty) || 0), 0),
    [items]
  );
  const refundAmount = useMemo(
    () => items.reduce((s, it) => s + (Number(it.refund) || 0), 0),
    [items]
  );

  return (
    <article className="w-full border rounded-2xl bg-white shadow-sm p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
          {first.imageUrl ? (
            <img src={first.imageUrl} alt={first.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-1 min-w-0">
          <div className="text-base md:text-lg font-medium truncate" title={first.name}>
            {first.name || "상품명"}
            {others > 0 && <span className="ml-1 text-sm text-gray-500">외 {others}개</span>}
          </div>
          <div className="text-sm text-gray-600">수량: {totalQty}</div>
          <div className="text-sm font-semibold">
            환불금액: {formatWon(refundAmount || cancel.amount)}
          </div>
          {cancel.reason && <div className="text-xs text-gray-500">사유: {cancel.reason}</div>}
        </div>

        <div className="sm:ml-auto w-full sm:w-56 flex items-center justify-between sm:flex-col sm:items-end sm:justify-between mt-1 sm:mt-0">
          <div className="text-left sm:text-right text-xs md:text-sm text-gray-500 leading-5 w-full sm:w-auto space-y-0.5">
            <div className="whitespace-nowrap truncate" title={cancel.createdAt}>
              취소 일자: {cancel.createdAt}
            </div>
            <div className="whitespace-nowrap truncate font-mono" title={cancel.cancellationId || cancel.cancelNo}>
              취소 번호: {cancel.cancellationId || cancel.cancelNo}
            </div>
            <div className="mt-1"><StatusBadge status={cancel.status} /></div>
          </div>

          <div className="sm:mt-3 ml-3 sm:ml-0 flex gap-2">
              <button
                onClick={() => onPrint?.(cancel)}
                className="rounded-xl px-3 py-2 text-xs md:text-sm border hover:bg-gray-50"
              >
                증빙 인쇄
              </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CancellationsPanel() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, hasNext: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const listRef = useRef(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);

      const res = await OrdersAPI.list({
        page,
        size: meta.size || 10,
        sort: "createdAt",
        order: "desc",
        status: "CANCELED",
      });

      const rows = res?.content ?? res ?? [];
      const m = res?.meta || { page, size: 10, hasNext: false };

      setList(prev => (page === 1 ? rows : [...prev, ...rows]));
      setMeta(m);
      setErr("");
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); // 첫 로드
  }, []);

  const handlePrint = (cancel) => {
    printCancellation(cancel);
  };

  return (
    <PanelShell title="취소 내역">
      <div ref={listRef} className="min-h-[60vh] max-h-[80vh] overflow-y-auto pr-1">
        {err && <div className="text-rose-600 mb-3">{err}</div>}
        {loading && list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center"><p>로딩중…</p></div>
        ) : list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p className="font-bold text-xl">결제 취소 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {list.map((c) => (
              <CancellationCard key={c.orderId || c.id} cancel={c} onPrint={handlePrint} />
            ))}
          </div>
        )}
        {meta.hasNext && (
          <button onClick={() => load((meta.page || 1) + 1)} className="mt-4 w-full py-2 border">
            {loading ? "로딩…" : "더 보기"}
          </button>
        )}
      </div>
    </PanelShell>
  );
}
