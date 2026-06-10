import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrdersAPI } from "features/orders/api/orders.api";
import { getApiErrorMessage } from "shared/api/request";
import { notify } from "shared/ui/notify";

export default function GuestOrderLookupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    orderId: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const orderId = form.orderId.trim();
    const phone = form.phone.trim();

    if (!orderId) return notify.error("주문번호를 입력해주세요.");
    if (!phone) return notify.error("휴대폰 번호를 입력해주세요.");

    try {
      setLoading(true);

      await OrdersAPI.guestLookup({ orderId, phone });

      sessionStorage.setItem(`guestOrderPhone:${orderId}`, phone);

      navigate(`/guest-orders/${orderId}`);
    } catch (e) {
      notify.error(getApiErrorMessage(e, "주문 정보를 찾을 수 없습니다."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-2">비회원 주문조회</h1>
      <p className="text-sm text-gray-500 mb-6">
        주문번호와 주문 시 입력한 휴대폰 번호를 입력해주세요.
      </p>

      <form onSubmit={submit} className="grid gap-3">
        <input
          className="border rounded-xl px-3 py-2"
          placeholder="주문번호"
          value={form.orderId}
          onChange={(e) =>
            setForm((f) => ({ ...f, orderId: e.target.value }))
          }
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="휴대폰 번호"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />

        <button
          disabled={loading}
          className="bg-black text-white rounded-xl px-4 py-2 disabled:opacity-40"
        >
          {loading ? "조회 중..." : "조회하기"}
        </button>
      </form>
    </main>
  );
}