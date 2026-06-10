import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OrdersAPI } from "features/orders/api/orders.api";
import { request, getApiErrorMessage } from "shared/api/request";
import { SYSTEM } from "shared/api/endpoints";
import { statusLabel, statusColor } from "shared/utils/orderStatusView";
import { buildTrackingUrl } from "shared/utils/buildTrackingUrl";
import {
  canCancel,
  canReturn,
  canConfirm,
  isShippingVisible,
  isBankInfoVisible,
} from "shared/utils/orderPolicy";
import { notify } from "shared/ui/notify";

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

export default function GuestOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState("");
  const [bankPolicy, setBankPolicy] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelForm, setCancelForm] = useState({ reason: "", memo: "" });
  const [cancelSaving, setCancelSaving] = useState(false);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: "", memo: "" });
  const [returnSaving, setReturnSaving] = useState(false);

  const load = async () => {
    const savedPhone = sessionStorage.getItem(`guestOrderPhone:${id}`);

    if (!savedPhone) {
      notify.error("비회원 주문조회 후 접근해주세요.");
      navigate("/guest-orders");
      return;
    }

    try {
      setLoading(true);
      setPhone(savedPhone);

      const res = await OrdersAPI.guestLookup({
        orderId: id,
        phone: savedPhone,
      });

      setOrder(res?.data ?? res);
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
  const canConfirmBtn = canConfirm(status);
  const canReturnBtn = canReturn(status);
  const hasReturn = Boolean(order?.return?.id);
  const canOpenReturn = canReturnBtn && !hasReturn;

  const showShipping = isShippingVisible(status);
  const showBankInfo = isBankInfoVisible(status);

  const trackingUrl = useMemo(() => {
    return buildTrackingUrl(order?.shipping?.carrier, order?.shipping?.trackingNo);
  }, [order?.shipping?.carrier, order?.shipping?.trackingNo]);

  const submitCancel = async () => {
    if (!cancelForm.reason.trim()) {
      return notify.error("취소 사유를 입력해주세요.");
    }

    try {
      setCancelSaving(true);

      await OrdersAPI.cancelRequest({
        orderId: id,
        reason: cancelForm.reason.trim(),
        memo: cancelForm.memo?.trim() ?? "",
        phone,
      });

      notify.success("취소 요청이 완료되었습니다.");
      setCancelOpen(false);
      await load();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setCancelSaving(false);
    }
  };

  const submitReturn = async () => {
    if (!returnForm.reason.trim()) {
      return notify.error("반품 사유를 입력해주세요.");
    }

    try {
      setReturnSaving(true);

      await OrdersAPI.returnRequest({
        orderId: id,
        reason: returnForm.reason.trim(),
        memo: returnForm.memo?.trim() ?? "",
        phone,
      });

      notify.success("반품 신청이 접수되었습니다.");
      setReturnOpen(false);
      await load();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    } finally {
      setReturnSaving(false);
    }
  };

  const confirmOrder = async () => {
    if (!window.confirm("구매확정 처리하시겠습니까?")) return;

    try {
      await OrdersAPI.confirm(id, { phone });
      notify.success("구매확정 처리되었습니다.");
      await load();
    } catch (e) {
      notify.error(getApiErrorMessage(e));
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6 grid place-items-center min-h-[40vh]">
        로딩중…
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <p className="text-rose-600">{err}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        주문을 찾을 수 없습니다.
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 grid gap-4 sm:gap-6">
      <header>
        <h1 className="text-2xl font-bold">비회원 주문 상세</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
              status
            )}`}
          >
            {statusLabel(status)}
          </span>
          <span className="text-sm text-gray-500 font-mono">#{order.id}</span>
        </div>
      </header>

      <section className="border rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            총 결제금액: <b>{formatWon(order.amounts?.grandTotal)}</b>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              disabled={!canCancelBtn}
              onClick={() => setCancelOpen(true)}
              className={`px-4 py-2 rounded-xl text-sm text-white ${
                canCancelBtn ? "bg-black" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              취소 요청
            </button>

            <button
              disabled={!canConfirmBtn}
              onClick={confirmOrder}
              className={`px-4 py-2 rounded-xl text-sm text-white ${
                canConfirmBtn ? "bg-black" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              구매확정
            </button>

            <button
              disabled={!canOpenReturn}
              onClick={() => setReturnOpen(true)}
              className={`px-4 py-2 rounded-xl text-sm text-white ${
                canOpenReturn ? "bg-black" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              반품 신청
            </button>
          </div>
        </div>
      </section>

      {showBankInfo && (
        <section className="border rounded-2xl p-4">
          <h2 className="font-bold mb-2">입금 안내</h2>

          {bankPolicy?.value ? (
            <p className="text-sm whitespace-pre-line">{bankPolicy.value}</p>
          ) : (
            <p className="text-sm text-gray-600">
              무통장 입금 확인 후 배송이 진행됩니다.
            </p>
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
                  trackingUrl
                    ? window.open(trackingUrl, "_blank")
                    : notify.error("조회 링크 없음")
                }
                className="mt-3 w-full sm:w-auto border px-3 py-2 rounded-xl text-sm"
              >
                배송 조회
              </button>
            </>
          ) : (
            <p className="text-sm">송장 정보가 없습니다.</p>
          )}
        </section>
      )}

      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-3">주문 상품</h2>

        <div className="grid gap-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border"
                />
              )}

              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                {item.optionSummary && (
                  <div className="text-sm text-gray-500">
                    {item.optionSummary}
                  </div>
                )}
                <div className="text-sm">
                  {item.qty}개 / {formatWon(item.lineTotal)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">받는 사람</h2>
        <p className="text-sm">이름: {order.receiver?.name}</p>
        <p className="text-sm">연락처: {order.receiver?.phone}</p>
        <p className="text-sm">
          주소: {order.receiver?.address?.address1}{" "}
          {order.receiver?.address?.address2}
        </p>
      </section>

      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">반품</h2>

        {order.return?.id ? (
          <p className="text-sm">
            상태: <b>{order.return.status}</b>
          </p>
        ) : (
          <p className="text-sm text-gray-600">반품 정보 없음</p>
        )}

        {!canReturnBtn && (
          <p className="mt-2 text-xs text-gray-500">
            반품은 배송완료 상태에서만 신청할 수 있습니다.
          </p>
        )}
      </section>

      <Modal
        open={cancelOpen}
        title="취소 요청"
        onClose={() => setCancelOpen(false)}
        disableClose={cancelSaving}
      >
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="사유"
          value={cancelForm.reason}
          onChange={(e) =>
            setCancelForm((f) => ({ ...f, reason: e.target.value }))
          }
        />
        <textarea
          className="w-full border p-2 mb-3 rounded"
          placeholder="메모(선택)"
          value={cancelForm.memo}
          onChange={(e) =>
            setCancelForm((f) => ({ ...f, memo: e.target.value }))
          }
        />
        <button
          onClick={submitCancel}
          disabled={cancelSaving}
          className="w-full bg-black text-white px-4 py-2 rounded disabled:opacity-40"
        >
          {cancelSaving ? "요청 중…" : "요청"}
        </button>
      </Modal>

      <Modal
        open={returnOpen}
        title="반품 신청"
        onClose={() => setReturnOpen(false)}
        disableClose={returnSaving}
      >
        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="사유"
          value={returnForm.reason}
          onChange={(e) =>
            setReturnForm((f) => ({ ...f, reason: e.target.value }))
          }
        />
        <textarea
          className="w-full border p-2 mb-3 rounded"
          placeholder="메모(선택)"
          value={returnForm.memo}
          onChange={(e) =>
            setReturnForm((f) => ({ ...f, memo: e.target.value }))
          }
        />
        <button
          onClick={submitReturn}
          disabled={returnSaving}
          className="w-full bg-black text-white px-4 py-2 rounded disabled:opacity-40"
        >
          {returnSaving ? "신청 중…" : "신청"}
        </button>
      </Modal>
    </main>
  );
}