import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { E } from "../lib/env";
import { useAuth } from "../context/AuthContext";

import { UserAPI } from "../api/users";

const BANK_INFO = {
  bankName: E.BANK_NAME || "은행명 미설정",
  accountNo: E.BANK_ACCOUNT || "계좌 미설정",
  holder: E.BANK_HOLDER || "예금주 미설정",
  notice: "주문 후 24시간 내 입금이 확인되지 않으면 주문이 자동 취소될 수 있습니다.",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cleanCart } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    zipcode: "", address1: "", address2: "",
    memo: "", depositor: "",
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

  //  이메일/메모만 선택, 나머지 전부 필수
  const canSubmit =
    cart.length > 0 &&
    requiredFilled("name", "phone", "zipcode", "address1", "address2", "depositor") &&
    !!agree;

  // 다음(카카오) 우편번호 스크립트 로더
  const ensureDaumPostcode = () =>
    new Promise((resolve, reject) => {
      if (window.daum?.Postcode) return resolve();
      const s = document.createElement("script");
      s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
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
            data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
          setForm((f) => ({
            ...f,
            zipcode: data.zonecode || "",
            address1: address || "",
          }));
          // 상세주소로 포커스 이동
          setTimeout(() => document.getElementById("address2")?.focus(), 0);
        },
      }).open();
    } catch (e) {
      alert("주소검색 스크립트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
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
        email: form.email || undefined, // 선택
        address: {
          zipcode: form.zipcode,
          address1: form.address1,
          address2: form.address2,
        },
        memo: form.memo || undefined, // 선택
      },
      payment: { method: "무통장입금", depositor: form.depositor, bank: BANK_INFO },
      shipping: { carrier: "우체국", trackingNo: null },
    };

    try {
      const created = await Promise.resolve(createOrder(payload));
      const newId = created?.id || created;

      if (user && saveAsDefault) {
        try {
          await UserAPI.saveDefault({
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
      alert("주문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">주문서 작성</h1>

      {/* 주문 상품 */}
      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">주문 상품</h2>
        <ul className="space-y-2">
          {cart.map((it) => {
            const p = it.product || {};
            const qty = it.quantity || 1;
            const opt =
              p.selected ?? (p.color || p.size ? { color: p.color, size: p.size } : null);

            return (
              <li key={`${p.id}-${JSON.stringify(opt)}`} className="flex justify-between text-sm">
                <span>
                  {p.name ?? p.title}
                  {opt && (
                    <em className="ml-2 text-gray-500">
                      ({opt.color} / {opt.size})
                    </em>
                  )}
                  {" × "}{qty}
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
        <h2 className="font-bold mb-2">수령정보</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* 이름(필수) */}
          <input
            className="border p-2 rounded"
            placeholder="수령인 *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {/* 연락처(필수) */}
          <input
            className="border p-2 rounded"
            placeholder="연락처 *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          {/* 이메일(선택) */}
          <input
            className="border p-2 rounded col-span-2"
            placeholder="이메일(선택)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
          />

          {/* 우편번호 + 주소검색 버튼 (필수) */}
          <div className="flex gap-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="우편번호 *"
              value={form.zipcode}
              onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={openPostcode}
              className="shrink-0 px-3 py-2 border rounded bg-black text-white"
            >
              주소 검색
            </button>
          </div>

          {/* 주소1(필수) */}
          <input
            className="border p-2 rounded"
            placeholder="주소 *"
            value={form.address1}
            onChange={(e) => setForm({ ...form, address1: e.target.value })}
            required
          />
          {/* 상세주소(필수) */}
          <input
            id="address2"
            className="border p-2 rounded col-span-2"
            placeholder="상세주소 *"
            value={form.address2}
            onChange={(e) => setForm({ ...form, address2: e.target.value })}
            required
          />
          {/* 배송 메모(선택) */}
          <input
            className="border p-2 rounded col-span-2"
            placeholder="배송 메모(선택)"
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
        </div>

        <h2 className="font-bold mt-4">입금자명</h2>
        <input
          className="border p-2 rounded"
          placeholder="입금자명 *"
          value={form.depositor}
          onChange={(e) => setForm({ ...form, depositor: e.target.value })}
          required
        />

        {/* 기본 배송지 저장 설정 */}
        <label className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
          />
          <span className="text-sm">이 주소를 기본 배송지로 저장</span>
        </label>         

        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            required
          />
          <span className="text-sm">구매조건(교환/환불/배송 안내)에 동의합니다.</span>
        </label>

        <button
          type="submit"
          className={`mt-3 h-12 text-white font-bold rounded hover:opacity-90 ${
            canSubmit ? "bg-red-500" : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!canSubmit}
        >
          주문서 제출
        </button>
      </form>
    </main>
  );
}
