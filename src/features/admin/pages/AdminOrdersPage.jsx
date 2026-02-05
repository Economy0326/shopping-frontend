import { useEffect, useMemo, useRef, useState } from "react"; 
import { Link } from "react-router-dom";
import { request, getApiErrorMessage } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";

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

  // UI filter states
  const [status, setStatus] = useState(""); // "", "AWAITING_DEPOSIT", ...
  const [onlyExpired, setOnlyExpired] = useState(false);
  const [q, setQ] = useState(""); // 주문ID/이메일 검색

  const reqSeqRef = useRef(0); // 레이스 방지 seq
  const debounceRef = useRef(null); // debounce timer

  const load = async (page = 1) => {
    const mySeq = ++reqSeqRef.current;
    try {
      setLoading(true);

      // 서버가 관리자 목록에서 필터를 지원한다면 params로 그대로 넘기면 되고,
      // 지원 안 하면 아래처럼 프론트 필터로도 최소 운영 가능.
      const params = {
        page,
        size: meta.size,
        ...(status ? { status } : {}),
        ...(q.trim() ? { q: q.trim() } : {}),
        // onlyExpired는 백엔드 지원 여부 애매해서 프론트에서 처리
      };

      const res = await request(ADMIN.ORDERS.ROOT, { params });

      // 레이스 방지 - 최신 요청이 아니면 무시
      if (mySeq !== reqSeqRef.current) return;

      const rows = res?.data ?? [];
      const m = res?.meta ?? { page, size: meta.size, total: 0 };

      // 프론트 만료 필터(선택)
      const filtered = onlyExpired
        ? rows.filter((o) => isExpiredAwaiting(o))
        : rows;

      setList(filtered);
      setMeta(m);
    } catch (e) {
      // 레이스 방지 - 최신 요청이 아니면 경고/상태변경도 하지 않음
      if (mySeq !== reqSeqRef.current) return;
      alert(getApiErrorMessage(e, "주문 목록 로드 실패"));
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

  const depositConfirm = async (order) => {
    const expired = isExpiredAwaiting(order);
    const can = order.status === "AWAITING_DEPOSIT" && !expired;
    if (!can) return;

    if (!window.confirm("입금 확인 처리할까요?")) return;

    try {
      await request(ADMIN.ORDERS.DEPOSIT(order.id), { method: "POST" });
      alert("입금 확인 완료");
      await load(meta.page || 1);
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 · 주문 관리</h1>

      {/* 필터 바 */}
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
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="underline"
                      title="주문 상세로"
                    >
                      {o.id}
                    </Link>
                  </td>

                  <td className="border p-2">
                    <div className="text-xs text-gray-500">
                      {o?.buyer?.email ?? "-"}
                    </div>
                    <div className="font-semibold">{o?.buyer?.name ?? "-"}</div>
                  </td>

                  <td className="border p-2">
                    {o?.representativeItem?.name ?? "-"}
                  </td>

                  <td className="border p-2 text-right">
                    {formatWon(o?.amounts?.grandTotal)}
                  </td>

                  <td className="border p-2">
                    <div className="flex flex-col gap-1">
                      <span>{o.status}</span>
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
                      onClick={() => depositConfirm(o)}
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
    </main>
  );
}
