import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { request, getApiErrorMessage } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";
import { notify } from "shared/ui/notify";
import ConfirmModal from "shared/ui/ConfirmModal";
import {
  statusLabel,
  returnStatusLabel,
} from "shared/utils/orderStatusView";

function formatWon(n) {
  return (Number(n) || 0).toLocaleString() + "원";
}

function dt(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

function isExpiredAwaiting(order) {
  if (!order?.expiresAt) return false;
  if (order?.status !== "AWAITING_DEPOSIT") return false;
  return new Date(order.expiresAt).getTime() < Date.now();
}

export default function AdminOrdersPage() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [onlyExpired, setOnlyExpired] = useState(false);
  const [q, setQ] = useState("");

  const reqSeqRef = useRef(0);
  const debounceRef = useRef(null);

  const load = async (page = 1) => {
    const mySeq = ++reqSeqRef.current;
    try {
      setLoading(true);

      const params = {
        page,
        size: meta.size,
        ...(status ? { status } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
      };

      const res = await request(ADMIN.ORDERS.ROOT, { params });

      if (mySeq !== reqSeqRef.current) return;

      const rows = res?.data ?? [];
      const m = res?.meta ?? { page, size: meta.size, total: 0 };

      const filtered = onlyExpired
        ? rows.filter((o) => isExpiredAwaiting(o))
        : rows;

      setList(filtered);
      setMeta(m);
    } catch (e) {
      if (mySeq !== reqSeqRef.current) return;
      notify.error(getApiErrorMessage(e, "주문 목록 로드 실패"));
    } finally {
      if (mySeq === reqSeqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(1);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [status, onlyExpired, q]);

  const hasNext = useMemo(
    () => (meta.page || 1) * (meta.size || 20) < (meta.total || 0),
    [meta]
  );

  const openDepositConfirm = (order) => {
    const expired = isExpiredAwaiting(order);
    const can = order?.status === "AWAITING_DEPOSIT" && !expired;
    if (!can) return;

    setConfirmTarget(order);
    setConfirmOpen(true);
  };

  const runDepositConfirm = async () => {
    if (!confirmTarget) return;

    try {
      setConfirmLoading(true);
      await request(ADMIN.ORDERS.DEPOSIT(confirmTarget.id), { method: "POST" });
      notify.success("입금 확인 완료");
      await load(meta.page || 1);
    } catch (e) {
      notify.error(getApiErrorMessage(e, "입금 확인 실패"));
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 주문 관리</h1>

      <form
        onSubmit={onSearch}
        className="flex flex-col md:flex-row gap-2 md:items-center mb-4"
      >
        <select
          className="border rounded px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="AWAITING_DEPOSIT">AWAITING_DEPOSIT</option>
          <option value="DEPOSIT_CONFIRMED">DEPOSIT_CONFIRMED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELED">CANCELED</option>
        </select>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyExpired}
            onChange={(e) => setOnlyExpired(e.target.checked)}
          />
          만료된 입금대기만
        </label>

        <input
          className="border rounded px-2 py-2 text-sm flex-1"
          placeholder="주문ID 또는 주문자 이메일 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button className="border rounded px-4 py-2 text-sm hover:bg-gray-50">
          검색
        </button>
      </form>

      {loading && <p className="text-sm text-gray-500 mb-2">로딩 중…</p>}

      <div className="overflow-x-auto">
        <table className="w-full border text-sm min-w-[1280px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">주문ID</th>
              <th className="border p-2">주문자</th>
              <th className="border p-2">대표상품</th>
              <th className="border p-2">금액</th>
              <th className="border p-2">상태</th>
              <th className="border p-2">주문/만료</th>
              <th className="border p-2">입금확인</th>
            </tr>
          </thead>

          <tbody>
            {list.map((o) => {
              const expired = isExpiredAwaiting(o);
              const canDepositConfirm =
                o.status === "AWAITING_DEPOSIT" && !expired;

              return (
                <tr key={o.id}>
                  <td className="border p-2 font-mono">
                    <div className="break-all">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="underline"
                        title="주문 상세로"
                      >
                        {o.id}
                      </Link>
                    </div>
                  </td>

                  <td className="border p-2">
                    <div className="font-semibold">{o?.buyer?.name ?? "-"}</div>
                    <div className="text-xs text-gray-500 break-all">
                      {o?.buyer?.email ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {o?.buyer?.phone ?? "-"}
                    </div>
                  </td>

                  <td className="border p-2 break-words">
                    {o?.representativeItem?.name ?? "-"}
                  </td>

                  <td className="border p-2 text-right">
                    {formatWon(o?.amounts?.grandTotal)}
                  </td>

                  <td className="border p-2">
                    <div className="flex flex-col gap-1">
                      <span>{statusLabel(o.status)}</span>

                      {o?.return?.status && (
                        <span className="text-xs text-gray-500">
                          반품: {returnStatusLabel(o.return.status)}
                        </span>
                      )}

                      {expired && (
                        <span className="text-xs font-semibold text-rose-600">
                          자동취소 예정/취소됨
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="border p-2 text-xs">
                    <div>주문: {dt(o.createdAt)}</div>
                    <div className="text-gray-500">만료: {dt(o.expiresAt)}</div>
                  </td>

                  <td className="border p-2">
                    <button
                      disabled={!canDepositConfirm}
                      onClick={() => openDepositConfirm(o)}
                      className={`px-3 py-1 rounded border ${
                        canDepositConfirm
                          ? "hover:bg-gray-50"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      입금확인
                    </button>
                  </td>
                </tr>
              );
            })}

            {list.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
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
          className="mt-4 w-full py-2 border hover:bg-gray-50"
        >
          다음 페이지
        </button>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="입금 확인"
        message="입금 확인 처리할까요?"
        confirmText="확인"
        cancelText="취소"
        loading={confirmLoading}
        onConfirm={runDepositConfirm}
        onCancel={() => {
          if (confirmLoading) return;
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
      />
    </main>
  );
}