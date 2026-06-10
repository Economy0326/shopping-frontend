import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { request, getApiErrorMessage } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";
import { notify } from "shared/ui/notify";
import ConfirmModal from "shared/ui/ConfirmModal";
import { statusLabel, returnStatusLabel } from "shared/utils/orderStatusView";

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

function OrdererBadge({ type }) {
  const isGuest = type === "guest";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        isGuest
          ? "bg-orange-100 text-orange-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {isGuest ? "비회원" : "회원"}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, size: 20, total: 0 });

  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [ordererType, setOrdererType] = useState("");
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
        ...(ordererType ? { ordererType } : {}),
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
  }, [status, ordererType, onlyExpired, q]);

  const hasNext = useMemo(
    () => (meta.page || 1) * (meta.size || 20) < (meta.total || 0),
    [meta],
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

      await request(ADMIN.ORDERS.DEPOSIT(confirmTarget.id), {
        method: "POST",
      });

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
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">관리자 · 주문 관리</h1>

      <form
        onSubmit={onSearch}
        className="grid gap-2 md:grid-cols-[160px_160px_1fr_auto] md:items-center"
      >
        <select
          className="border rounded px-3 py-2"
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

        <select
          className="border rounded px-3 py-2"
          value={ordererType}
          onChange={(e) => setOrdererType(e.target.value)}
        >
          <option value="">전체 주문자</option>
          <option value="member">회원 주문</option>
          <option value="guest">비회원 주문</option>
        </select>

        <input
          className="border rounded px-3 py-2"
          placeholder="주문번호, 이름, 연락처, 이메일, 입금자 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button className="border rounded px-4 py-2 hover:bg-gray-50">
          검색
        </button>
      </form>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={onlyExpired}
          onChange={(e) => setOnlyExpired(e.target.checked)}
        />
        만료된 입금대기만
      </label>

      {loading && <p className="text-sm text-gray-500">로딩 중…</p>}

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 whitespace-nowrap">주문ID</th>
              <th className="p-3 whitespace-nowrap">유형</th>
              <th className="p-3 whitespace-nowrap">주문자</th>
              <th className="p-3 whitespace-nowrap">대표상품</th>
              <th className="p-3 whitespace-nowrap">금액</th>
              <th className="p-3 whitespace-nowrap">상태</th>
              <th className="p-3 whitespace-nowrap">주문/만료</th>
              <th className="p-3 whitespace-nowrap">입금확인</th>
            </tr>
          </thead>

          <tbody>
            {list.map((o) => {
              const expired = isExpiredAwaiting(o);
              const canDepositConfirm =
                o.status === "AWAITING_DEPOSIT" && !expired;

              return (
                <tr key={o.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">
                    <Link
                      className="font-mono underline"
                      to={`/admin/orders/${o.id}`}
                    >
                      {o.id}
                    </Link>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <OrdererBadge type={o.ordererType} />
                  </td>

                  <td className="p-3">
                    <div>{o?.buyer?.name ?? "-"}</div>
                    <div className="text-xs text-gray-500">
                      {o?.buyer?.email ?? "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {o?.buyer?.phone ?? "-"}
                    </div>
                  </td>

                  <td className="p-3">
                    {o?.representativeItem?.name ?? "-"}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {formatWon(o?.amounts?.grandTotal)}
                  </td>

                  <td className="p-3">
                    <div>{statusLabel(o.status)}</div>

                    {o?.return?.status && (
                      <div className="text-xs text-rose-600">
                        반품: {returnStatusLabel(o.return.status)}
                      </div>
                    )}

                    {expired && (
                      <div className="text-xs text-orange-600">
                        자동취소 예정/취소됨
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                    <div>주문: {dt(o.createdAt)}</div>
                    <div>만료: {dt(o.expiresAt)}</div>
                  </td>

                  <td className="p-3 whitespace-nowrap">
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
                <td className="p-6 text-center text-gray-500" colSpan={8}>
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
        loading={confirmLoading}
        onConfirm={runDepositConfirm}
        onClose={() => {
          if (confirmLoading) return;
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
      />
    </main>
  );
}