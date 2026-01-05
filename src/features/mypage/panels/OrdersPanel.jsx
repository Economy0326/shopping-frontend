import { useEffect, useRef, useState } from "react";
import { PanelShell } from "features/mypage/panels/_shared";
import { OrdersAPI } from "features/orders/api/orders.api";
import { getApiErrorMessage } from "shared/api/request";
import { statusLabel, statusColor } from "shared/utils/constants";
import { Link } from "react-router-dom";
import { canConfirm } from "shared/utils/orderPolicy";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function OrderCard({ order, onConfirm }) {
  const rep = order.representativeItem || {};
  const canConfirmBtn = canConfirm(order.status);

  return (
    <article className="w-full rounded-2xl border bg-white shadow-sm p-4 md:p-5">
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
          <div className="flex items-center gap-2">
            <div
              className="text-base md:text-lg font-medium truncate"
              title={rep.name}
            >
              {rep.name || "상품명"}
              {order.itemsCount > 1 && (
                <span className="ml-1 text-sm text-gray-500">
                  외 {order.itemsCount - 1}개
                </span>
              )}
            </div>
            <StatusBadge status={order.status} />
          </div>

          {rep.optionSummary && (
            <div className="text-sm text-gray-600">{rep.optionSummary}</div>
          )}
          <div className="text-sm font-semibold">
            {formatWon(order?.amounts?.grandTotal)}
          </div>

          <div className="mt-2">
            <Link to={`/order/${order.id}`} className="text-sm underline">
              주문 상세 보기
            </Link>
          </div>
        </div>

        <div className="sm:ml-auto w-full sm:w-56 flex items-center justify-between sm:flex-col sm:items-end sm:justify-between mt-1 sm:mt-0">
          <div className="text-left sm:text-right text-xs md:text-sm text-gray-500 leading-5 w-full sm:w-auto space-y-0.5">
            <div className="whitespace-nowrap truncate" title={order.createdAt}>
              주문 일자: {order.createdAt}
            </div>
            <div className="whitespace-nowrap truncate font-mono" title={order.id}>
              주문 번호: {order.id}
            </div>
          </div>

          {canConfirmBtn && (
            <button
              onClick={() => onConfirm(order.id)}
              className="sm:mt-3 ml-3 sm:ml-0 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90 transition"
            >
              구매확정
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OrdersPanel() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const listRef = useRef(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      // 명세: GET /orders -> { data:[...], meta:{page,size,total} }
      const res = await OrdersAPI.list({
        page,
        size: meta.size || 10,
        sort: "createdAt,desc",
      });
      const rows = res?.data ?? [];
      const m = res?.meta ?? { page, size: meta.size || 10, total: 0 };

      setList(page === 1 ? rows : [...list, ...rows]);
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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [list.length]);

  const onConfirm = async (orderId) => {
    try {
      await OrdersAPI.confirm(orderId);

      // 재조회: 서버의 최신 상태를 다시 받아서 list 갱신
      await load(1);
      
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const hasNext = meta.page * meta.size < meta.total;

  return (
    <PanelShell title="나의 주문">
      <div ref={listRef} className="min-h-[60vh] max-h-[80vh] overflow-y-auto pr-1">
        {err && <div className="text-rose-600 mb-3">{err}</div>}

        {loading && list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p>로딩중…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p className="font-bold text-xl">주문 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {list.map((o) => (
              <OrderCard key={o.id} order={o} onConfirm={onConfirm} />
            ))}
          </div>
        )}

        {hasNext && (
          <button
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
