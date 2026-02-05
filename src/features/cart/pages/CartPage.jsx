import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "features/cart/context/CartContext";

// 안전 파싱
const num = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);

// 같은 product.id 끼리 묶기 (이미지 1장 + 옵션 요약용)
const groupByProduct = (cart) => {
  const map = new Map();
  (cart || [])
    .filter((it) => it?.product && it?.product?.id != null)
    .forEach((it) => {
      const pid = String(it.product.id);
      if (!map.has(pid)) map.set(pid, { product: it.product, items: [] });
      map.get(pid).items.push(it);
    });
  return Array.from(map.values());
};

// 썸네일 우선순위: product.images[0].url > product.images[0](string) > product.image > ""
const getThumb = (product) => {
  const img0 = product?.images?.[0];
  if (img0 && typeof img0 === "object" && typeof img0.url === "string") return img0.url ?? "";
  if (typeof img0 === "string") return img0;
  return product?.image || "";
};

// 상품 기본 가격
const getBasePrice = (product) => num(product?.price, 0);

// 단가(상품가 + 옵션추가금)
const getUnitPrice = (it) =>
  (Number(it?.product?.price) || 0) + (Number(it?.options?.priceDelta) || 0);

/**
 * optionGroups 기반으로 "옵션 value의 stock"을 찾는 헬퍼
 * - product.optionGroups: [{key, options:[{value, stock}]}]
 */
const getOptionStock = (product, key, value) => {
  const groups = Array.isArray(product?.optionGroups) ? product.optionGroups : [];
  const g = groups.find((x) => x?.key === key);
  if (!g) return null;
  const opt = (g.options || []).find((o) => String(o?.value) === String(value));
  return opt?.stock ?? null;
};

// 옵션 요약 포맷팅 헬퍼
const formatOption = (it) => {
  const qty = it?.qty ?? 1;
  const ov =
    it?.options?.optionValues && typeof it.options.optionValues === "object"
      ? it.options.optionValues
      : {};

  const delta = Number(it?.options?.priceDelta) || 0;
  const deltaLabel = delta ? ` (+${delta.toLocaleString()}원)` : "";

  const keys = Object.keys(ov).sort();
  if (!keys.length) return `수량(${qty}), 옵션없음${deltaLabel}`;

  // value + stock 표시
  const parts = keys.map((k) => {
    const v = String(ov[k]);
    const stock = getOptionStock(it?.product, k, v);
    // stock이 null이면 표시 생략, 숫자면 표시
    return stock == null ? `${k}:${v}` : `${k}:${v}(재고 ${stock})`;
  });

  return `수량(${qty}), ${parts.join(" / ")}${deltaLabel}`;
};

const stepBtn =
  "w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";
const stepQty =
  "w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded text-center select-none flex items-center justify-center";

export default function CartPage() {
  const { cart, removeFromCart, changeQty } = useCart();
  const navigate = useNavigate();

  // 그룹(상품 단위) 선택 상태: { [productId]: boolean }
  const [selectedGroup, setSelectedGroup] = useState({});

  const isEmpty = !cart || cart.length === 0;
  const groups = useMemo(() => groupByProduct(cart || []), [cart]);

  // 그룹 id 시그니처(상품 추가/삭제될 때만 선택 상태 동기화)
  const groupIdsSignature = useMemo(
    () => groups.map((g) => String(g.product.id)).sort().join("|"),
    [groups]
  );

  // 새 그룹은 기본 선택 = true, 빠진 그룹은 제거 (기존 선택 보존)
  useEffect(() => {
    setSelectedGroup((prev) => {
      const next = { ...prev };
      const ids = new Set(groups.map((g) => String(g.product.id)));

      groups.forEach((g) => {
        const id = String(g.product.id);
        if (!(id in next)) next[id] = true;
      });

      Object.keys(next).forEach((id) => {
        if (!ids.has(id)) delete next[id];
      });

      return next;
    });
  }, [groupIdsSignature, groups]);

  // 전체 선택 여부(그룹 기준)
  const allChecked = useMemo(() => {
    if (groups.length === 0) return false;
    return groups.every((g) => selectedGroup[String(g.product.id)]);
  }, [groups, selectedGroup]);

  // 선택된 라인아이템만 추출(결제/합계 계산용)
  const selectedItems = useMemo(() => {
    // flatmat으로 그룹 내 아이템들 펼치기
    return groups.flatMap((g) => (selectedGroup[String(g.product.id)] ? g.items : []));
  }, [groups, selectedGroup]);

  // 선택 총액: (상품가 + 옵션추가금) × 수량
  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + getUnitPrice(it) * (it?.qty ?? 1), 0);
  }, [selectedItems]);

  // toggleAll -> 전체 반전
  const toggleAll = () => {
    const target = !allChecked;
    const next = {};
    groups.forEach((g) => {
      next[String(g.product.id)] = target;
    });
    setSelectedGroup(next);
  };

  // toggleGroup -> 해당 그룹 반전
  const toggleGroup = (pid) => {
    const id = String(pid);
    setSelectedGroup((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 그룹 삭제(상품 단위 삭제): 해당 상품의 모든 라인아이템 삭제
  const removeGroup = (group) => {
    group.items.forEach((it) => removeFromCart(it.key)); // lineKey 기반 삭제
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 md:px-10 w-full">
      <div className="text-5xl p-4 text-center font-bold mb-6">What's in my bag?</div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-5xl p-16 text-center font-bold mb-6">NOTHING</div>
        </div>
      )}

      {!isEmpty && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleAll}
                aria-pressed={allChecked}
                className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white transition outline-none ring-0 [appearance:none]
                  ${allChecked ? "text-red-500" : "text-gray-300"}`}
              >
                <span
                  className={`w-5 h-5 border-2 flex items-center justify-center leading-none
                    ${
                      allChecked
                        ? "font-bold border-red-500 text-red-500"
                        : "font-bold border-gray-300 text-gray-300"
                    }`}
                >
                  ✓
                </span>
                <span className="text-xl font-bold md:text-base font-medium">전체 선택</span>
              </button>

              <span className="text-gray-600">
                선택 {selectedItems.length} / 총 {cart.length}개
              </span>
            </div>
          </div>

          <div className="grid gap-8">
            {groups.map((group) => {
              const p = group.product;
              const pid = String(p.id);
              const checked = !!selectedGroup[pid];

              const thumb = getThumb(p) || "/mood/nothing.png";
              const basePriceLabel = `${getBasePrice(p).toLocaleString()} WON`;

              return (
                <section key={pid} className="grid gap-4 md:grid-cols-[28px_180px_1fr] items-start">
                  {/* 선택 토글 */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(pid)}
                    aria-pressed={checked}
                    title="선택"
                    className={`w-7 h-7 border-2 flex items-center justify-center transition
                      outline-none ring-0 [appearance:none]
                      ${
                        checked
                          ? "bg-white text-xl font-bold text-red-500 border-red-500"
                          : "bg-white text-xl font-bold text-gray-300 border-gray-300"
                      }`}
                  >
                    ✓
                  </button>

                  {/* 썸네일 */}
                  <div className="relative">
                    <img
                      src={thumb}
                      alt={p?.name || "item"}
                      className="w-[180px] h-[180px] object-cover rounded-2xl"
                      onError={(e) => {
                        e.currentTarget.src = "/mood/nothing.png";
                      }}
                    />
                  </div>

                  {/* 우측 정보/옵션라인 */}
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <div className="text-2xl font-bold">{p?.name}</div>
                      <div className="text-sm font-bold text-black">PRICE {basePriceLabel}</div>
                    </div>

                    {/* 옵션 라인 아이템들 */}
                    <div className="grid gap-2">
                      {group.items.map((it) => {
                        const qty = it?.qty ?? 1;

                        return (
                          <div
                            key={it.key}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                          >
                            <div className="text-sm text-gray-700 break-words">
                              {formatOption(it)}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className={stepBtn}
                                onClick={() => changeQty(it.key, qty - 1)}
                                disabled={qty <= 1}
                                title="감소"
                              >
                                -
                              </button>

                              <div className={stepQty}>{qty}</div>

                              <button
                                type="button"
                                className={stepBtn}
                                onClick={() => changeQty(it.key, qty + 1)}
                                title="증가"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                className={`${stepBtn} w-6`}
                                onClick={() => removeFromCart(it.key)}
                                title="이 옵션만 삭제"
                              >
                                x
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* 결제 바 */}
          <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-3 bg-white border rounded-xl shadow px-4 py-3">
              <div className="text-lg">
                TOTAL PRICE{" "}
                <span className="font-semibold">{selectedTotal.toLocaleString()}WON</span>
              </div>

              <button
                disabled={selectedItems.length === 0}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      // 선택결제: key를 같이 넘겨서 Checkout 성공 후 선택 항목만 제거 가능
                      selectedKeys: selectedItems.map((it) => it.key),
                      selectedItems: selectedItems.map((it) => ({
                        key: it.key,
                        productId: it?.product?.id,
                        qty: it?.qty,
                        // optionValues + priceDelta만 넘김 (id류 없음)
                        options: it?.options,
                      })),
                    },
                  })
                }
                className={`px-5 py-2 rounded text-white text-lg ${
                  selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-black"
                }`}
              >
                선택 상품 결제하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
