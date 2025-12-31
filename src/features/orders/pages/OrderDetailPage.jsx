import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrdersAPI } from "features/orders/api/orders.api";
import { getApiErrorMessage } from "shared/api/request";
import { statusLabel, statusColor } from "shared/utils/constants";
import { buildTrackingUrl } from "shared/utils/tracking";

function formatWon(n) {
  const v = Number(n) || 0;
  return v.toLocaleString() + "원";
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
            className={`text-sm ${disableClose ? "text-gray-300" : "text-gray-500 hover:underline"}`}
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 반품 신청
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: "", memo: "" });
  const [returnSaving, setReturnSaving] = useState(false);

  // 취소 요청
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const status = order?.status;

  const canCancel = status === "AWAITING_DEPOSIT"; // 명세 6
  const canReturn = status === "DELIVERED";        // 명세 7
  const hasReturn = Boolean(order?.return?.id);
  const canOpenReturn = canReturn && !hasReturn;

  const trackingUrl = useMemo(() => {
    const carrier = order?.shipping?.carrier;
    const trackingNo = order?.shipping?.trackingNo;
    return buildTrackingUrl(carrier, trackingNo);
  }, [order?.shipping?.carrier, order?.shipping?.trackingNo]);

  const openReturn = () => {
    setReturnForm({ reason: "", memo: "" });
    setReturnOpen(true);
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

  const openCancel = () => {
    setCancelForm({ reason: "", memo: "" });
    setCancelOpen(true);
  };

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

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="grid min-h-[40vh] place-items-center"><p>로딩중…</p></div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded-2xl p-4">
          <p className="text-rose-600">{err}</p>
          <div className="mt-3 text-sm">
            <Link to="/" className="text-blue-600 underline">홈으로</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded-2xl p-4">
          주문을 찾을 수 없습니다.
          <div className="mt-3 text-sm">
            <Link to="/" className="text-blue-600 underline">홈으로</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">주문 상세</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(status)}`}>
              {statusLabel(status)}
            </span>
            <span className="text-sm text-gray-500 font-mono">#{order.id}</span>
          </div>
        </div>

        <button
          className="text-xs px-2 py-1 border rounded"
          onClick={() => navigator.clipboard?.writeText(String(order.id))}
        >
          주문번호 복사
        </button>
      </header>

      {/* 총액 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">결제 금액</h2>
        <p className="text-sm">
          총 결제금액: <b>{formatWon(order?.amounts?.grandTotal)}</b>
        </p>

        {/* 취소 요청 (AWAITING_DEPOSIT only) */}
        <div className="mt-3">
          <button
            disabled={!canCancel}
            onClick={openCancel}
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              canCancel ? "bg-black hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            취소 요청
          </button>
          {!canCancel && (
            <p className="mt-2 text-xs text-gray-500">
              취소 요청은 입금대기(AWAITING_DEPOSIT) 상태에서만 가능합니다.
            </p>
          )}
        </div>
      </section>

      {/* 입금 안내: 입금대기에서만 */}
      {status === "AWAITING_DEPOSIT" && (
        <section className="border rounded-2xl p-4">
          <h2 className="font-bold mb-2">입금 안내</h2>
          <p className="text-sm text-gray-600">
            무통장 입금 확인 후 배송이 진행됩니다.
          </p>
          <p className="mt-2 text-sm">
            입금 금액: <b>{formatWon(order?.amounts?.grandTotal)}</b>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            입금 계좌/예금주는 정책(/system/policies)에서 내려받아 표시하는 것을 권장합니다.
          </p>
        </section>
      )}

      {/* 배송 정보: shipped/delivered */}
      {(status === "SHIPPED" || status === "DELIVERED") && (
        <section className="border rounded-2xl p-4">
          <h2 className="font-bold mb-2">배송 정보</h2>
          {order?.shipping?.trackingNo ? (
            <div className="text-sm space-y-1">
              <div>택배사: <b>{order?.shipping?.carrier || "-"}</b></div>
              <div>송장번호: <b className="font-mono">{order?.shipping?.trackingNo}</b></div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (trackingUrl) window.open(trackingUrl, "_blank", "noopener");
                    else alert("추적 링크가 없습니다.");
                  }}
                  className="rounded-xl px-3 py-2 text-xs md:text-sm border hover:bg-gray-50"
                >
                  배송 조회
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                (직접택배 운영: 택배사 API 연동 없음 / 링크 조회만 제공)
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">송장 정보가 아직 등록되지 않았습니다.</p>
          )}
        </section>
      )}

      {/* 반품 섹션 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">반품</h2>

        {order?.return?.id ? (
          <div className="text-sm space-y-2">
            <div>반품번호: <span className="font-mono">{order.return.id}</span></div>
            <div>상태: <b>{order.return.status}</b></div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">반품 정보가 없습니다.</p>
        )}

        <div className="mt-3">
          <button
            disabled={!canOpenReturn}
            onClick={openReturn}
            className={`rounded-xl px-4 py-2 text-sm text-white ${
              canOpenReturn ? "bg-black hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            반품 신청
          </button>

          {!canReturn && (
            <p className="mt-2 text-xs text-gray-500">
              반품 신청은 배송완료(DELIVERED) 상태에서만 가능합니다.
            </p>
          )}
          {hasReturn && (
            <p className="mt-2 text-xs text-gray-500">
              이미 반품이 접수/처리 중인 주문입니다. (주문당 활성 반품 1개)
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          반품은 관리자 승인 후 안내에 따라 직접 발송합니다. (택배사 자동 수거/조회 없음)
        </p>
      </section>

      {/* 환불 로그 */}
      <section className="border rounded-2xl p-4">
        <h2 className="font-bold mb-2">환불 로그</h2>

        {Array.isArray(order?.refundLogs) && order.refundLogs.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {order.refundLogs.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 border rounded-xl p-3">
                <div className="min-w-0">
                  <div className="font-semibold">{formatWon(r.amount)}</div>
                  {r.memo && <div className="text-gray-600 text-xs mt-1">{r.memo}</div>}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{r.createdAt}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">환불 내역이 없습니다.</p>
        )}
      </section>

      {/* 취소 요청 모달 */}
      <Modal
        open={cancelOpen}
        title="취소 요청"
        onClose={() => setCancelOpen(false)}
        disableClose={cancelSaving}
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold">사유 (필수)</span>
            <input
              value={cancelForm.reason}
              onChange={(e) => setCancelForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300"
              placeholder="예) 변심"
              disabled={cancelSaving}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">메모 (선택)</span>
            <textarea
              value={cancelForm.memo}
              onChange={(e) => setCancelForm((f) => ({ ...f, memo: e.target.value }))}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300 min-h-[90px]"
              placeholder="추가 메모"
              disabled={cancelSaving}
            />
          </label>

          <div className="pt-2 flex gap-2">
            <button
              onClick={submitCancel}
              disabled={cancelSaving}
              className={`rounded-xl px-4 py-2 text-sm text-white ${
                cancelSaving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
              }`}
            >
              {cancelSaving ? "요청 중…" : "요청하기"}
            </button>
            <button
              onClick={() => setCancelOpen(false)}
              disabled={cancelSaving}
              className="rounded-xl px-4 py-2 text-sm border hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>
      </Modal>

      {/* 반품 신청 모달 */}
      <Modal
        open={returnOpen}
        title="반품 신청"
        onClose={() => setReturnOpen(false)}
        disableClose={returnSaving}
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold">사유 (필수)</span>
            <input
              value={returnForm.reason}
              onChange={(e) => setReturnForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300"
              placeholder="예) 사이즈 불만"
              disabled={returnSaving}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">메모 (선택)</span>
            <textarea
              value={returnForm.memo}
              onChange={(e) => setReturnForm((f) => ({ ...f, memo: e.target.value }))}
              className="w-full rounded p-3 mt-1 border-2 border-gray-300 min-h-[90px]"
              placeholder="추가 설명이 있으면 입력"
              disabled={returnSaving}
            />
          </label>

          <div className="pt-2 flex gap-2">
            <button
              onClick={submitReturn}
              disabled={returnSaving}
              className={`rounded-xl px-4 py-2 text-sm text-white ${
                returnSaving ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
              }`}
            >
              {returnSaving ? "신청 중…" : "신청하기"}
            </button>
            <button
              onClick={() => setReturnOpen(false)}
              disabled={returnSaving}
              className="rounded-xl px-4 py-2 text-sm border hover:bg-gray-50"
            >
              닫기
            </button>
          </div>

          <p className="text-xs text-gray-500">
            직접택배 운영: 승인 후 안내에 따라 직접 발송합니다. (택배사 자동 수거/조회 없음)
          </p>
        </div>
      </Modal>
    </main>
  );
}
