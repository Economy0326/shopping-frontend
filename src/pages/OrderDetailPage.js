import { useParams, useLocation, Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { getOrder } = useOrders();
  const { state } = useLocation();
  const justCreated = state?.justCreated;

  const order = getOrder(id); // 나중에 API 모드로 바뀌어도 시그니처 유지
  if (!order) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="border rounded p-4">
          주문을 찾을 수 없습니다.
          <div className="mt-3 text-sm">
            <Link to="/" className="text-blue-600 underline">홈으로</Link>
          </div>
        </div>
      </main>
    );
  }

  const { receiver, payment, items, total, status } = order;

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      {justCreated && (
        <div className="p-3 rounded bg-green-50 text-green-700 border border-green-200">
          주문이 생성되었습니다. 아래의 입금 안내를 확인해주세요.
        </div>
      )}

      <h1 className="text-2xl font-bold">주문 완료</h1>
      <div className="border rounded p-4">
        <div className="font-bold">주문번호: {order.id}</div>
        <div className="mt-2 text-sm">상태: {status}</div>
        <button
          className="mt-2 text-xs px-2 py-1 border rounded"
          onClick={() => navigator.clipboard?.writeText(order.id)}
          aria-label="주문번호 복사"
        >
          주문번호 복사
        </button>
      </div>

      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">입금 안내</h2>
        <p>입금자명: <b>{payment?.depositor}</b></p>
        <p>입금 금액: <b>{total.toLocaleString()}원</b></p>
        <p>은행/계좌: <b>{payment?.bank?.bankName} {payment?.bank?.accountNo} ({payment?.bank?.holder})</b></p>
        {payment?.bank?.notice && (
          <p className="text-xs text-gray-500 mt-2">{payment.bank.notice}</p>
        )}
      </section>

      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">배송지</h2>
        <p>{receiver?.name} / {receiver?.phone}</p>
        <p>{receiver?.address?.zipcode} {receiver?.address?.address1} {receiver?.address?.address2}</p>
        {receiver?.memo && <p className="text-sm text-gray-600">메모: {receiver.memo}</p>}
      </section>

      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">상품</h2>
        <ul className="space-y-2 text-sm">
          {items.map((it, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{it.name}{it.options && ` (${it.options.color}/${it.options.size})`} × {it.qty}</span>
              <span>{(it.price || 0).toLocaleString()}원</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-right font-bold">합계: {total.toLocaleString()}원</div>
      </section>
    </main>
  );
}
