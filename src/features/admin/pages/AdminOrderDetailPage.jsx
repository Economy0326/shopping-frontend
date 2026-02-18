import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { request, getApiErrorMessage } from "shared/api/request";
import { ADMIN } from "shared/api/endpoints";
import {
  SHIPPING_CARRIER_OPTIONS,
  ShippingCarriers,
} from "shared/constants/shippingCarriers";
import { notify } from "shared/ui/notify";

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

// 단가 호환: 백엔드가 price 또는 unitPrice 둘 중 뭘 내려줘도 OK
function getUnitPrice(it) {
  return Number(it?.unitPrice ?? it?.price ?? 0);
}

function Badge({ text }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {text}
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 액션 UI 상태
  const [trackingNo, setTrackingNo] = useState("");
  const [carrier, setCarrier] = useState(ShippingCarriers.KOREA_POST); // ✅ 통일

  const [refundMemo, setRefundMemo] = useState("");
  const [refundSaving, setRefundSaving] = useState(false);

  const [returnApproveMemo, setReturnApproveMemo] = useState("");
  const [returnRejectReason, setReturnRejectReason] = useState("");

  const reload = async () => {
    try {
      setLoading(true);
      const res = await request(ADMIN.ORDERS.ID(id));
      const data = res?.data ?? null;
      setOrder(data);

      // 초기값 채우기
      const ship = data?.shipping;
      setTrackingNo(ship?.trackingNo ?? "");
      setCarrier(ship?.carrier ?? ShippingCarriers.KOREA_POST);
    } catch (e) {
      notify.error(getApiErrorMessage(e, "주문 상세 로드 실패"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, [id]);

  const status = order?.status;

  const isExpired = useMemo(() => {
    if (!order?.expiresAt) return false;
    if (order?.status !== "AWAITING_DEPOSIT") return false;
    return new Date(order.expiresAt).getTime() < Date.now();
  }, [order?.expiresAt, order?.status]);

  // 버튼 활성 조건
  const canDepositConfirm = status === "AWAITING_DEPOSIT" && !isExpired;
  const canShip = status === "DEPOSIT_CONFIRMED";
  const canDeliverForce = status === "SHIPPED";
  const canRefund = ["CANCELED", "DELIVERED"].includes(status);

  const ret = order?.return ?? null;
  const canReturnApprove = !!(ret?.id && ret?.status === "REQUESTED");
  const canReturnReject = !!(ret?.id && ret?.status === "REQUESTED");

  const depositConfirm = async () => {
    if (!canDepositConfirm) return;
    if (!window.confirm("입금 확인 처리할까요?")) return;

    try {
      await request(ADMIN.ORDERS.DEPOSIT(order.id), { method: "POST" });
      notify.success("입금 확인 완료");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  const ship = async () => {
    if (!canShip) return;

    const no = String(trackingNo ?? "").trim();
    if (!no) return notify.error("송장번호를 입력하세요.");

    //  carrier/송장 필수 전제이므로 confirm에 그대로 노출
    if (!window.confirm(`발송 등록할까요?\n택배사: ${carrier}\n송장: ${no}`))
      return;

    try {
      await request(ADMIN.ORDERS.SHIP(order.id), {
        method: "POST",
        body: { carrier, trackingNo: no }, 
      });
      notify.success("발송 등록 완료");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  const deliverForce = async () => {
    if (!canDeliverForce) return;
    if (!window.confirm("배송완료(DELIVERED)로 강제 전환할까요?")) return;

    try {
      await request(ADMIN.ORDERS.DELIVER(order.id), { method: "POST" });
      notify.success("배송완료 처리 완료");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  const refundLog = async () => {
    if (!canRefund) return;

    const amount = order?.amounts?.grandTotal;
    if (!amount) return notify.error("환불 금액을 계산할 수 없습니다.");

    // memo 필수
    const memo = String(refundMemo ?? "").trim();
    if (!memo) return notify.error("환불 메모를 입력하세요.");

    // confirm에 메모 표시
    if (
      !window.confirm(
        `환불 로그를 기록할까요?\n금액: ${formatWon(amount)}\n메모: ${memo}`
      )
    )
      return;

    try {
      setRefundSaving(true);
      await request(ADMIN.ORDERS.REFUND(order.id), {
        method: "POST",
        body: { amount, memo },
      });
      notify.success("환불 로그 기록 완료");
      // 기록 후 메모 초기화
      setRefundMemo("");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setRefundSaving(false);
    }
  };

  const approveReturn = async () => {
    if (!canReturnApprove) return;
    if (!window.confirm("반품을 승인할까요?")) return;

    try {
      await request(ADMIN.RETURNS.APPROVE(ret.id), {
        method: "POST",
        body: returnApproveMemo ? { memo: returnApproveMemo } : undefined,
      });
      notify.success("반품 승인 완료");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  const rejectReturn = async () => {
    if (!canReturnReject) return;

    const reason = String(returnRejectReason || "").trim();
    if (!reason) return notify.error("거절 사유를 입력하세요.");
    if (!window.confirm(`반품을 거절할까요?\n사유: ${reason}`)) return;

    try {
      await request(ADMIN.RETURNS.REJECT(ret.id), {
        method: "POST",
        body: { reason },
      });
      notify.success("반품 거절 완료");
      await reload();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid min-h-[40vh] place-items-center">
          <p>로딩중…</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="border rounded-2xl p-4">
          주문을 찾을 수 없습니다.
          <div className="mt-3">
            <Link className="underline text-sm" to="/admin/orders">
              목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">관리자 · 주문 상세</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-sm">#{order.id}</span>
            <Badge text={order.status} />
            {isExpired && <Badge text="입금기한 만료" />}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            주문: {dt(order.createdAt)} / 만료: {dt(order.expiresAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/orders" className="text-sm underline">
            목록으로
          </Link>
          <button
            className="text-xs px-2 py-1 border rounded"
            onClick={() => navigator.clipboard?.writeText(String(order.id))}
          >
            주문번호 복사
          </button>
        </div>
      </header>

      {/* 주문자 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">주문자</h2>
        <div className="text-sm">
          <div>
            <span className="text-gray-500">이메일: </span>
            <b>{order?.buyer?.email ?? "-"}</b>
          </div>
          <div>
            <span className="text-gray-500">이름: </span>
            <b>{order?.buyer?.name ?? "-"}</b>
          </div>
        </div>
      </section>

      {/* 상품 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">주문 상품</h2>

        <div className="space-y-2">
          {(order.items ?? []).map((it, idx) => {
            const unit = getUnitPrice(it);
            const qty = Number(it.qty) || 0;
            const lineTotal = unit * qty;

            return (
              <div
                key={`${it.productId}-${idx}`}
                className="flex items-center justify-between gap-3 border rounded-xl p-3"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.name}</div>

                  {it.optionSummary && (
                    <div className="text-xs text-gray-500">
                      {it.optionSummary}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    수량 {qty} · 단가 {formatWon(unit)}
                  </div>
                </div>

                <div className="text-sm font-semibold whitespace-nowrap">
                  {formatWon(lineTotal)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-right">
          <span className="text-sm text-gray-500">총액 </span>
          <b className="text-lg">{formatWon(order?.amounts?.grandTotal)}</b>
        </div>
      </section>

      {/* 운영 액션 */}
      <section className="border rounded-2xl p-4 space-y-4">
        <h2 className="font-bold">운영 액션</h2>

        {/* 1) 입금 확인 */}
        <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
          <div className="min-w-0">
            <div className="font-semibold">입금 확인</div>
            <div className="text-xs text-gray-500">
              AWAITING_DEPOSIT 상태에서만 가능 / 만료 시 비활성
            </div>
          </div>
          <button
            disabled={!canDepositConfirm}
            onClick={depositConfirm}
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              canDepositConfirm
                ? "bg-black hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            입금확인
          </button>
        </div>

        {/* 2) 발송 등록 */}
        <div className="border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">발송 등록</div>
              <div className="text-xs text-gray-500">
                DEPOSIT_CONFIRMED 상태에서만 가능
              </div>
            </div>
            <button
              disabled={!canShip}
              onClick={ship}
              className={`px-4 py-2 rounded-xl text-sm text-white ${
                canShip
                  ? "bg-black hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              발송등록
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="border rounded px-2 py-2 text-sm"
              disabled={!canShip}
            >
              {SHIPPING_CARRIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>

            <input
              className="border rounded px-2 py-2 text-sm flex-1 font-mono"
              placeholder="송장번호"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              disabled={!canShip}
            />
          </div>
        </div>

        {/* 3) 배송완료 강제 */}
        <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
          <div className="min-w-0">
            <div className="font-semibold">배송완료 처리(관리자 강제)</div>
            <div className="text-xs text-gray-500">
              SHIPPED 상태에서만 가능 / 유저 구매확정 미수행 시 사용
            </div>
          </div>
          <button
            disabled={!canDeliverForce}
            onClick={deliverForce}
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              canDeliverForce
                ? "bg-black hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            배송완료 처리
          </button>
        </div>

        {/* 4) 환불 로그 */}
        <div className="border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">환불 로그 기록</div>
              <div className="text-xs text-gray-500">
                CANCELED 또는 DELIVERED 상태에서만 / Full refund only
              </div>
            </div>
            <button
              disabled={!canRefund || refundSaving}
              onClick={refundLog}
              className={`px-4 py-2 rounded-xl text-sm text-white ${
                canRefund && !refundSaving
                  ? "bg-black hover:opacity-90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {refundSaving ? "기록 중…" : "환불기록"}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            환불 금액(고정): <b>{formatWon(order?.amounts?.grandTotal)}</b>
          </div>

          <input
            className="border rounded px-2 py-2 text-sm w-full"
            placeholder="환불 메모(필수) 예: 무통장 환불 완료"
            value={refundMemo}
            onChange={(e) => setRefundMemo(e.target.value)}
            disabled={!canRefund || refundSaving}
            // 브라우저 기본 required(참고용), 실제 검증은 refundLog 함수에서 수행.
            required
          />
        </div>
      </section>

      {/* 반품 */}
      <section className="border rounded-2xl p-4 space-y-3">
        <h2 className="font-bold">반품</h2>

        {!ret?.id ? (
          <div className="text-sm text-gray-600">반품 요청 없음</div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge text={`return#${ret.id}`} />
              <Badge text={ret.status} />
            </div>

            <div className="text-xs text-gray-500">
              반품은 REQUESTED 상태에서만 승인/거절 가능
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-xl p-3 space-y-2">
                <div className="font-semibold">승인</div>
                <input
                  className="border rounded px-2 py-2 text-sm w-full"
                  placeholder="승인 메모(선택)"
                  value={returnApproveMemo}
                  onChange={(e) => setReturnApproveMemo(e.target.value)}
                  disabled={!canReturnApprove}
                />
                <button
                  disabled={!canReturnApprove}
                  onClick={approveReturn}
                  className={`w-full px-4 py-2 rounded-xl text-sm text-white ${
                    canReturnApprove
                      ? "bg-black hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  반품 승인
                </button>
              </div>

              <div className="border rounded-xl p-3 space-y-2">
                <div className="font-semibold">거절</div>
                <input
                  className="border rounded px-2 py-2 text-sm w-full"
                  placeholder="거절 사유(필수)"
                  value={returnRejectReason}
                  onChange={(e) => setReturnRejectReason(e.target.value)}
                  disabled={!canReturnReject}
                />
                <button
                  disabled={!canReturnReject}
                  onClick={rejectReturn}
                  className={`w-full px-4 py-2 rounded-xl text-sm text-white ${
                    canReturnReject
                      ? "bg-black hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  반품 거절
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 환불 로그 목록 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">환불 로그</h2>
        {Array.isArray(order?.refundLogs) && order.refundLogs.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {order.refundLogs.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 border rounded-xl p-3"
              >
                <div className="min-w-0">
                  <div className="font-semibold">{formatWon(r.amount)}</div>
                  {r.memo && (
                    <div className="text-gray-600 text-xs mt-1">{r.memo}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {dt(r.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-600">환불 내역 없음</div>
        )}
      </section>
    </main>
  );
}
