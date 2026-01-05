import { useEffect, useRef, useState } from "react";
import { PanelShell } from "features/mypage/panels/_shared";
import { getApiErrorMessage } from "shared/api/request";
import { request } from "shared/api/request";
import { RETURNS } from "shared/api/endpoints";
import { Link } from "react-router-dom";

function StatusBadge({ status }) {
  const map = { REQUESTED: "요청", APPROVED: "승인", REJECTED: "거절", REFUNDED: "환불완료" };
  const color =
    {
      REQUESTED: "bg-amber-100 text-amber-800",
      APPROVED: "bg-emerald-100 text-emerald-800",
      REJECTED: "bg-rose-100 text-rose-800",
      REFUNDED: "bg-emerald-100 text-emerald-800",
    }[status] || "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {map[status] || status}
    </span>
  );
}

function ReturnCard({ ret }) {
  const helper =
    ret.status === "APPROVED"
      ? "승인되었습니다. 안내에 따라 직접 발송해 주세요."
      : ret.status === "REJECTED"
      ? "거절되었습니다. 주문 상세에서 환불/처리 상태를 확인하세요."
      : ret.status === "REFUNDED"
      ? "환불이 완료되었습니다."
      : "접수되었습니다. 관리자 확인 후 처리됩니다.";

  return (
    <article className="w-full rounded-2xl border bg-white shadow-sm p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-gray-500">주문번호</div>
          <div className="font-mono text-sm truncate">{ret.orderId}</div>

          <div className="mt-2 text-sm text-gray-500">반품ID</div>
          <div className="font-mono text-sm truncate">{ret.id}</div>

          {ret.createdAt && <div className="mt-2 text-xs text-gray-500">신청일: {ret.createdAt}</div>}
          {ret.reason && <div className="mt-1 text-xs text-gray-600">사유: {ret.reason}</div>}

          <div className="mt-3">
            <Link to={`/order/${ret.orderId}`} className="text-sm underline">
              주문 상세 보기
            </Link>
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={ret.status} />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">{helper}</div>
    </article>
  );
}

export default function ReturnsPanel() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const listRef = useRef(null);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await request(RETURNS.ROOT, { params: { page, size: meta.size || 10 } });
      const rows = res?.data ?? [];
      setList((prev) => (page === 1 ? rows : [...prev, ...rows]));
      setMeta(res?.meta ?? { page, size: meta.size || 10, total: 0 });
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
            {list.map((r) => <ReturnCard key={r.id} ret={r} />)}
          </div>
        )}

        {hasNext && (
          <button onClick={() => load((meta.page || 1) + 1)} className="mt-4 w-full py-2 border">
            {loading ? "로딩…" : "더 보기"}
          </button>
        )}
      </div>
    </PanelShell>
  );
}
