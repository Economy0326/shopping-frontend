import { useEffect, useMemo, useRef, useState } from "react";
import { PanelShell } from "./_shared";
import { ReturnsAPI } from "../../../api/returns";
import { getAxiosErrorMessage } from "../../../lib/request";
import { buildTrackingUrl } from "../../../lib/tracking";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
}

function StatusBadge({ status }) {
  const map = {
    REQUESTED: "신청",
    PICKUP_SCHEDULED: "수거예약",
    PICKED_UP: "수거완료",
    RECEIVED: "도착",
    INSPECTING: "검수중",
    APPROVED: "승인",
    REJECTED: "거절",
    REFUNDED: "환불완료",
    IN_TRANSIT: "이동중",
  };
  const color = {
    REQUESTED: "bg-amber-100 text-amber-800",
    PICKUP_SCHEDULED: "bg-sky-100 text-sky-800",
    PICKED_UP: "bg-sky-100 text-sky-800",
    RECEIVED: "bg-slate-100 text-slate-800",
    INSPECTING: "bg-purple-100 text-purple-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-rose-100 text-rose-800",
    REFUNDED: "bg-emerald-100 text-emerald-800",
    IN_TRANSIT: "bg-indigo-100 text-indigo-800",
  }[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {map[status] || status}
    </span>
  );
}

function ReturnCard({ ret, onTrack }) {
  const items = ret.items || [];
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

    const openTracking = () => {
      const url = buildTrackingUrl(ret.carrier, ret.trackingNo);
      if (url) window.open(url, "_blank", "noopener");
      else alert("추적 링크가 없습니다.");
    };

  return (
    <article className="w-full rounded-2xl border bg-white shadow-sm p-4 md:p-5">
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
          <div className="text-sm font-semibold">환불 예정: {formatWon(refundAmount || ret.amount || ret.refundExpected)}</div>
          {ret.reason && <div className="text-xs text-gray-500">사유: {ret.reason}</div>}
        </div>

        <div className="sm:ml-auto w-full sm:w-56 flex items-center justify-between sm:flex-col sm:items-end sm:justify-between mt-1 sm:mt-0">
          <div className="text-left sm:text-right text-xs md:text-sm text-gray-500 leading-5 w-full sm:w-auto space-y-0.5">
            <div className="whitespace-nowrap truncate" title={ret.requestedAt}>
              신청 일자: {ret.requestedAt}
            </div>
            <div className="whitespace-nowrap truncate font-mono" title={ret.returnNo || ret.returnId}>
              반품 번호: {ret.returnNo || ret.returnId}
            </div>
            <div className="mt-1"><StatusBadge status={ret.status} /></div>
          </div>

          <div className="sm:mt-3 ml-3 sm:ml-0 flex gap-2">
            {ret.trackingNo && (
              <button
                onClick={() => onTrack?.(ret.trackingNo, ret.carrier)}
                className="rounded-xl px-3 py-2 text-xs md:text-sm border hover:bg-gray-50"
              >
                수거/운송 조회
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ReturnsPanel() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, hasNext: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const listRef = useRef(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ReturnsAPI.list({ page, size: meta.size || 10, sort: "requestedAt", order: "desc" });
      const rows = res?.data || [];
      const m = res?.meta || { page, size: 10, hasNext: false };
      setList(page === 1 ? rows : [...list, ...rows]);
      setMeta(m);
      setErr("");
    } catch (e) {
      setErr(getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); /* 최초 */ // eslint-disable-next-line
  }, []);

  const onTrack = async (trackingNo, carrier) => {
    try {
      const res = await ReturnsAPI.track(trackingNo, { carrier });
      const last = (res?.data?.events || []).slice(-1)[0];
      alert(last ? `${last.time} · ${last.status} · ${last.location || ""}` : "이력 없음");
    } catch (e) {
      alert(getAxiosErrorMessage(e));
    }
  };

  return (
    <PanelShell title="반품 내역">
      <div ref={listRef} className="min-h-[60vh] max-h-[80vh] overflow-y-auto pr-1">
        {err && <div className="text-rose-600 mb-3">{err}</div>}
        {loading && list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center"><p>로딩중…</p></div>
        ) : list.length === 0 ? (
          <div className="grid min-h-[60vh] place-items-center">
            <p className="font-bold text-xl">반품 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {list.map((r) => (
              <ReturnCard key={r.returnId} ret={r} onTrack={onTrack} />
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
