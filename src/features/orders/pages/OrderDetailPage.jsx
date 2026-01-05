import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { OrdersAPI } from "features/orders/api/orders.api";
import { request, getApiErrorMessage } from "shared/api/request";
import { SYSTEM } from "shared/api/endpoints";
import { statusLabel, statusColor } from "shared/utils/constants";
import { buildTrackingUrl } from "shared/utils/buildTrackingUrl";
import {
  canCancel,
  canReturn,
  isShippingVisible,
  isBankInfoVisible,
} from "shared/utils/orderPolicy";

function formatWon(n) {
  return (Number(n) || 0).toLocaleString() + "원";
}

function Modal({ open, title, children, onClose, disableClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={() => (!disableClose ? onClose?.() : null)}
            className={`text-sm ${
              disableClose ? "text-gray-300" : "text-gray-500 hover:underline"
            }`}
          >
            닫기
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [bankPolicy, setBankPolicy] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* 반품 */
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: "", memo: "" });
  const [returnSaving, setReturnSaving] = useState(false);

  /* 취소 */
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelForm, setCancelForm] = useState({ reason: "", memo: "" });
  const [cancelSaving, setCancelSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await OrdersAPI.get(id);
      setOrder(res?.data ?? null);
      setErr("");
    } catch (e) {
      setErr(getApiErrorMessage(e, "주문 상세를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    request(SYSTEM.POLICY("bankAccount"))
      .then((res) => setBankPolicy(res?.data ?? null))
      .catch(() => {});
  }, []);

  const status = order?.status;

  const canCancelBtn = canCancel(status);
  const canReturnBtn = canReturn(status);
  const hasReturn = Boolean(order?.return?.id);
  const canOpenReturn = canReturnBtn && !hasReturn;

  const trackingUrl = useMemo(() => {
    return buildTrackingUrl(order?.shipping?.carrier, order?.shipping?.trackingNo);
  }, [order?.shipping?.carrier, order?.shipping?.trackingNo]);

  const showShipping = isShippingVisible(status);
  const showBankInfo = isBankInfoVisible(status);

  const submitCancel = async () => {
    if (!cancelForm.reason.trim()) return alert("취소 사유를 입력해주세요.");
    try {
      setCancelSaving(true);
      await OrdersAPI.cancelRequest({
        orderId: id,
        reason: cancelForm.reason.trim(),
        memo: cancelForm.memo?.trim() ?? "",
      });
      alert("취소 요청이 완료되었습니다.");
      setCancelOpen(false);
      await load();
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setCancelSaving(false);
    }
  };

  const submitReturn = async () => {
    if (!returnForm.reason.trim()) return alert("반품 사유를 입력해주세요.");
    try {
      setReturnSaving(true);
      await OrdersAPI.returnRequest({
        orderId: id,
        reason: returnForm.reason.trim(),
        memo: returnForm.memo?.trim() ?? "",
      });
      alert("반품 신청이 접수되었습니다.");
      setReturnOpen(false);
      await load();
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setReturnSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 grid place-items-center min-h-[40vh]">
        로딩중…
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-rose-600">{err}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        주문을 찾을 수 없습니다.
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      {/* header */}
      <header className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 상세</h1>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
                status
              )}`}
            >
              {statusLabel(status)}
            </span>
            <span className="text-sm text-gray-500 font-mono">#{order.id}</span>
          </div>
        </div>
      </header>

      {/* 금액 */}
      <section className="border rounded-2xl p-4">
        총 결제금액: <b>{formatWon(order.amounts?.grandTotal)}</b>
        <div className="mt-3">
          <button
            disabled={!canCancelBtn}
            onClick={() => setCancelOpen(true)}
            className={`px-4 py-2 rounded-xl text-sm text-white ${
              canCancelBtn ? "bg-black" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            취소 요청
          </button>
        </div>
      </section>

      {/* 입금 안내 */}
      {showBankInfo && (
        <section className="border rounded-2xl p-4">
          <h2 className="font-bold mb-2">입금 안내</h2>

          {bankPolicy?.value ? (
            typeof bankPolicy.value === "string" ? (
              <p className="text-sm whitespace-pre-line">{bankPolicy.value}</p>
            ) : (
              <>
                <p className="text-sm">
                  <b>{bankPolicy.value.bank}</b> {bankPolicy.value.account} / 예금주{" "}
                  <b>{bankPolicy.value.holder}</b>
                </p>
                {bankPolicy.value.notice && (
                  <p className="text-xs text-gray-500 mt-1">
                    {bankPolicy.value.notice}
                  </p>
                )}
              </>
            )
          ) : (
            <p className="text-sm text-gray-600">무통장 입금 확인 후 배송이 진행됩니다.</p>
          )}

          <p className="mt-2 text-sm">
            입금 금액: <b>{formatWon(order.amounts?.grandTotal)}</b>
          </p>

          {order.expiresAt && (
            <p className="text-xs text-gray-500 mt-1">
              입금 기한: {new Date(order.expiresAt).toLocaleString()}
            </p>
          )}
        </section>
      )}

      {/* 배송 */}
      {showShipping && (
        <section className="border rounded-2xl p-4">
          <h2 className="font-bold mb-2">배송 정보</h2>
          {order.shipping?.trackingNo ? (
            <>
              <div className="text-sm">택배사: {order.shipping.carrier}</div>
              <div className="text-sm">
                송장번호:{" "}
                <span className="font-mono">{order.shipping.trackingNo}</span>
              </div>
              <button
                onClick={() =>
                  trackingUrl ? window.open(trackingUrl, "_blank") : alert("조회 링크 없음")
                }
                className="mt-2 border px-3 py-2 rounded-xl text-sm"
              >
                배송 조회
              </button>
            </>
          ) : (
            <p className="text-sm">송장 정보가 없습니다.</p>
          )}
        </section>
      )}

      {/* 반품 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">반품</h2>

        {order.return?.id ? (
          <p className="text-sm">
            상태: <b>{order.return.status}</b>
          </p>
        ) : (
          <p className="text-sm text-gray-600">반품 정보 없음</p>
        )}

        <button
          disabled={!canOpenReturn}
          onClick={() => setReturnOpen(true)}
          className={`mt-3 px-4 py-2 rounded-xl text-sm text-white ${
            canOpenReturn ? "bg-black" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          반품 신청
        </button>
      </section>

      {/* 환불 로그 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">환불 로그</h2>
        {order.refundLogs?.length ? (
          order.refundLogs.map((r) => (
            <div key={r.id} className="text-sm">
              {formatWon(r.amount)} / {r.memo}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">환불 내역 없음</p>
        )}
      </section>

      {/* modals */}
      <Modal
        open={cancelOpen}
        title="취소 요청"
        onClose={() => setCancelOpen(false)}
        disableClose={cancelSaving}
      >
        <input
          className="w-full border p-2 mb-2"
          placeholder="사유"
          value={cancelForm.reason}
          onChange={(e) => setCancelForm((f) => ({ ...f, reason: e.target.value }))}
        />
        <textarea
          className="w-full border p-2 mb-3"
          placeholder="메모(선택)"
          value={cancelForm.memo}
          onChange={(e) => setCancelForm((f) => ({ ...f, memo: e.target.value }))}
        />
        <button onClick={submitCancel} className="bg-black text-white px-4 py-2 rounded">
          요청
        </button>
      </Modal>

      <Modal
        open={returnOpen}
        title="반품 신청"
        onClose={() => setReturnOpen(false)}
        disableClose={returnSaving}
      >
        <input
          className="w-full border p-2 mb-2"
          placeholder="사유"
          value={returnForm.reason}
          onChange={(e) => setReturnForm((f) => ({ ...f, reason: e.target.value }))}
        />
        <textarea
          className="w-full border p-2 mb-3"
          placeholder="메모(선택)"
          value={returnForm.memo}
          onChange={(e) => setReturnForm((f) => ({ ...f, memo: e.target.value }))}
        />
        <button onClick={submitReturn} className="bg-black text-white px-4 py-2 rounded">
          신청
        </button>
      </Modal>
    </main>
  );
}