import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { E } from "../lib/env";
import { useAuth } from "../context/AuthContext";
import { OrdersAPI } from "../api/orders";
import { UsersAPI } from "../api/users";

const BANK_INFO = {
  bankName: E.BANK_NAME || "은행명 미설정",
  accountNo: E.BANK_ACCOUNT || "계좌 미설정",
  holder: E.BANK_HOLDER || "예금주 미설정",
  notice:
    "주문 후 24시간 내 입금이 확인되지 않으면 주문이 자동 취소될 수 있습니다.",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cleanCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    zipcode: "",
    address1: "",
    address2: "",
    memo: "",
    depositor: "",
  });
  const [agree, setAgree] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, it) =>
          sum + (Number(it?.product?.price) || 0) * (it?.quantity || 1),
        0
      ),
    [cart]
  );

  const requiredFilled = (...keys) =>
    keys.every((k) => String(form[k] ?? "").trim().length > 0);

  const canSubmit =
    cart.length > 0 &&
    requiredFilled(
      "name",
      "phone",
      "zipcode",
      "address1",
      "address2",
      "depositor"
    ) &&
    !!agree;

  const ensureDaumPostcode = () =>
    new Promise((resolve, reject) => {
      if (window.daum?.Postcode) return resolve();
      const s = document.createElement("script");
      s.src =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("postcode script load failed"));
      document.body.appendChild(s);
    });

  const openPostcode = async () => {
    try {
      await ensureDaumPostcode();
      /* global daum */
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address =
            data.userSelectedType === "R"
              ? data.roadAddress
              : data.jibunAddress;
          setForm((f) => ({
            ...f,
            zipcode: data.zonecode || "",
            address1: address || "",
          }));
          setTimeout(() => document.getElementById("address2")?.focus(), 0);
        },
      }).open();
    } catch (e) {
      alert("주소검색 스크립트를 불러오지 못했습니다.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      alert("필수 항목을 확인해주세요.");
      return;
    }

    const payload = {
      customer: {
        username: user?.username || "guest",
      },
      items: cart.map((it) => ({
        productId: it?.product?.id,
        name: it?.product?.name ?? it?.product?.title,
        price: Number(it?.product?.price) || 0,
        qty: it?.quantity || 1,
        options:
          it?.product?.selected ??
          (it?.product?.color || it?.product?.size
            ? { color: it?.product?.color, size: it?.product?.size }
            : null),
      })),
      total,
      receiver: {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: {
          zipcode: form.zipcode,
          address1: form.address1,
          address2: form.address2,
        },
        memo: form.memo || undefined,
      },
      payment: {
        method: "무통장입금",
        depositor: form.depositor,
        bank: BANK_INFO,
      },
      shipping: { carrier: "우체국", trackingNo: null },
    };

    try {
      const res = await OrdersAPI.checkout(payload);
      const newId = res?.id || res;
      if (user && saveAsDefault) {
        try {
          await UsersAPI.saveDefault({
            receiver: form.name,
            phone: form.phone,
            zip: form.zipcode,
            address1: form.address1,
            address2: form.address2,
          });
        } catch (e) {
          console.warn("기본 배송지 저장 실패:", e);
        }
      }
      cleanCart();
      navigate(`/order/${newId}`, { state: { justCreated: true } });
    } catch (err) {
      console.error(err);
      alert("주문 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">주문서 작성</h1>

      {/* 상품 목록 */}
      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">주문 상품</h2>
        <ul className="space-y-2">
          {cart.map((it) => {
            const p = it.product || {};
            const qty = it.quantity || 1;
            const opt =
              p.selected ??
              (p.color || p.size ? { color: p.color, size: p.size } : null);

            return (
              <li
                key={`${p.id}-${JSON.stringify(opt)}`}
                className="flex justify-between text-sm"
              >
                <span>
                  {p.name ?? p.title}
                  {opt && (
                    <em className="ml-2 text-gray-500">
                      ({opt.color} / {opt.size})
                    </em>
                  )}
                  {" × "}
                  {qty}
                </span>
                <span>{(Number(p.price) || 0).toLocaleString()}원</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 text-right font-bold">
          합계: {total.toLocaleString()}원
        </div>
      </section>

      {/* 입금 안내 */}
      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">무통장입금 안내</h2>
        <p className="text-sm">은행: {BANK_INFO.bankName}</p>
        <p className="text-sm">계좌: {BANK_INFO.accountNo}</p>
        <p className="text-sm">예금주: {BANK_INFO.holder}</p>
        <p className="text-xs text-gray-500 mt-2">{BANK_INFO.notice}</p>
      </section>

      {/* 주문서 폼 */}
      <form onSubmit={onSubmit} className="border rounded p-4 grid gap-3">
        {/* 수령 정보 + 동의 영역 그대로 */}
        {/* ...생략 (네가 올린 원본 동일)... */}
      </form>
    </main>
  );
}
