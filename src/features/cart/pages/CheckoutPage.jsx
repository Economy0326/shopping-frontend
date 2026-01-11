import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "features/cart/context/CartContext";
import { useAuth } from "features/auth/context/AuthContext";

import { OrdersAPI } from "features/orders/api/orders.api";
import { SystemAPI } from "shared/api/system.api";
import { getApiErrorMessage } from "shared/api/request";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cart, clearCart, removeItems } = useCart();
  const { user } = useAuth();

  // CartPage에서 넘어온 선택결제 데이터
  const selectedItemsFromState = location.state?.selectedItems || null;
  const selectedKeysFromState = location.state?.selectedKeys || null;

  // 결제 대상: 선택결제면 selectedItems, 아니면 cart 전체
  const payItems = useMemo(() => {
    if (Array.isArray(selectedItemsFromState) && selectedItemsFromState.length) {
      const map = new Map(cart.map((it) => [it.key, it]));
      return selectedItemsFromState.map((s) => map.get(s.key)).filter(Boolean);
    }
    return cart;
  }, [selectedItemsFromState, cart]);

  const isSelectedCheckout =
    Array.isArray(selectedKeysFromState) && selectedKeysFromState.length > 0;

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

  // bankAccount 정책(/system/policies/bankAccount)
  const [bankInfo, setBankInfo] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await SystemAPI.bankAccount();
        if (alive) setBankInfo(data ?? null);
      } catch {
        if (alive) setBankInfo(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const total = useMemo(
    () =>
      payItems.reduce(
        (sum, it) => sum + (Number(it?.product?.price) || 0) * (it?.qty || 1),
        0
      ),
    [payItems]
  );

  const requiredFilled = (...keys) =>
    keys.every((k) => String(form[k] ?? "").trim().length > 0);

  // variantId 없으면 결제 불가 (운영 안정성)
  const hasAllVariantIds = useMemo(() => {
    if (!payItems.length) return false;
    return payItems.every((it) => Boolean(it?.options?.variantId));
  }, [payItems]);

  const canSubmit =
    payItems.length > 0 &&
    hasAllVariantIds &&
    requiredFilled("name", "phone", "zipcode", "address1", "address2", "depositor") &&
    !!agree;

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
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address =
            data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

          setForm((f) => ({
            ...f,
            zipcode: data.zonecode || "",
            address1: address || "",
          }));

          setTimeout(() => document.getElementById("address2")?.focus(), 0);
        },
      }).open();
    } catch {
      alert("주소검색 스크립트를 불러오지 못했습니다.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!payItems.length) {
      alert("결제할 상품이 없습니다.");
      return;
    }

    if (!canSubmit) {
      if (!hasAllVariantIds) {
        alert("옵션/재고 정보(variant)가 누락된 상품이 있습니다. 장바구니에서 다시 담아주세요.");
        return;
      }
      alert("필수 항목을 확인해주세요.");
      return;
    }

    /**
     * Variant 기준 주문 payload
     * items: [{ productId, qty, variantId }]
     */
    const payload = {
      items: payItems.map((it) => ({
        productId: it?.product?.id,
        qty: it?.qty || 1,
        variantId: Number(it?.options?.variantId),
      })),
      receiver: {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: {
          zip: form.zipcode,
          address1: form.address1,
          address2: form.address2,
        },
        memo: form.memo || undefined,
      },
      payment: {
        method: "BANK_TRANSFER",
        depositor: form.depositor,
      },
    };

    try {
      const res = await OrdersAPI.checkout(payload);

      const newId = res?.data?.id ?? res?.id ?? res;

      // 선택결제면 선택 항목만 제거, 아니면 전체 clear
      if (isSelectedCheckout) {
        removeItems(selectedKeysFromState);
      } else {
        clearCart();
      }

      navigate(`/order/${newId}`, { state: { justCreated: true } });
    } catch (err) {
      alert(getApiErrorMessage(err, "주문 생성 중 오류가 발생했습니다."));
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">주문서 작성</h1>

      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">주문 상품</h2>

        {!hasAllVariantIds && payItems.length > 0 && (
          <p className="text-sm text-rose-600 mb-2">
            일부 상품에 variantId가 없습니다. 장바구니에서 다시 담아주세요.
          </p>
        )}

        <ul className="space-y-2">
          {payItems.map((it) => {
            const p = it.product || {};
            const qty = it.qty || 1;

            return (
              <li key={it.key} className="flex justify-between text-sm">
                <span>
                  {p.name ?? p.title}
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

      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">무통장입금 안내</h2>
        <p className="text-sm">은행: {bankInfo?.bank ?? "은행명 미설정"}</p>
        <p className="text-sm">계좌: {bankInfo?.account ?? "계좌 미설정"}</p>
        <p className="text-sm">예금주: {bankInfo?.holder ?? "예금주 미설정"}</p>
        <p className="text-xs text-gray-500 mt-2">
          {bankInfo?.notice ??
            "주문 후 12시간 내 입금이 확인되지 않으면 주문이 자동 취소됩니다."}
        </p>
      </section>

      {/* 주문서 폼 */}
      <form onSubmit={onSubmit} className="border rounded p-4 grid gap-3">
        <div className="grid gap-2">
          <label className="text-sm font-semibold">수령인</label>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="이름"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">연락처</label>
          <input
            className="border rounded p-2"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="휴대폰 번호"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">이메일(선택)</label>
          <input
            className="border rounded p-2"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">주소</label>
          <div className="flex gap-2">
            <input
              className="border rounded p-2 flex-1"
              value={form.zipcode}
              readOnly
              placeholder="우편번호"
            />
            <button type="button" onClick={openPostcode} className="border rounded px-3">
              주소검색
            </button>
          </div>

          <input className="border rounded p-2" value={form.address1} readOnly placeholder="기본주소" />

          <input
            id="address2"
            className="border rounded p-2"
            value={form.address2}
            onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))}
            placeholder="상세주소"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">배송 메모(선택)</label>
          <input
            className="border rounded p-2"
            value={form.memo}
            onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
            placeholder="문 앞에 놓아주세요"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">입금자명</label>
          <input
            className="border rounded p-2"
            value={form.depositor}
            onChange={(e) => setForm((f) => ({ ...f, depositor: e.target.value }))}
            placeholder="입금자명"
          />
        </div>

        <div className="flex items-center gap-2">
          <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <label htmlFor="agree" className="text-sm">
            주문 정보 제공 및 결제 진행에 동의합니다.
          </label>
        </div>

        {!!user && (
          <div className="flex items-center gap-2">
            <input
              id="saveDefault"
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
            />
            <label htmlFor="saveDefault" className="text-sm">
              기본 배송지로 저장
            </label>
          </div>
        )}

        <button type="submit" disabled={!canSubmit} className="px-4 py-3 rounded bg-black text-white disabled:opacity-40">
          주문 생성
        </button>
      </form>
    </main>
  );
}
