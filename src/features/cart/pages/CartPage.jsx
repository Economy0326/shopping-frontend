import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "features/cart/context/CartContext";
import { useBottomBarOffset } from "ui/hooks/useBottomBarOffset";

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

/**
 * 현재 라인아이템의 "대략 재고 상한" 계산
 * - size/color 둘 다 있으면 min(sizeStock, colorStock)
 * - 하나만 있으면 그 stock
 * - 없으면 null(재고제한 없음으로 취급)
 */
const getLineStockLimit = (it) => {
  const p = it?.product;
  if (!p) return null;

  const ov =
    it?.options?.optionValues && typeof it.options.optionValues === "object"
      ? it.options.optionValues
      : {};

  const hasSize = Object.prototype.hasOwnProperty.call(ov, "size");
  const hasColor = Object.prototype.hasOwnProperty.call(ov, "color");

  const sizeStock = hasSize ? getOptionStock(p, "size", String(ov.size)) : null;
  const colorStock = hasColor ? getOptionStock(p, "color", String(ov.color)) : null;

  const candidates = [sizeStock, colorStock].filter((v) => typeof v === "number");
  if (!candidates.length) return null;
  return Math.min(...candidates);
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

  const bottomOffset = useBottomBarOffset();

  // 화면 상단 안내/에러 스크롤용
  const topRef = useRef(null);
  const [notice, setNotice] = useState(null);

  // 그룹(상품 단위) 선택 상태: { [productId]: boolean }
  const [selectedGroup, setSelectedGroup] = useState({});

  // 깨진 라인아이템 감지(product 없거나 id 없는 경우)
  const invalidCount = useMemo(() => {
    return (cart || []).filter((it) => !(it?.product && it?.product?.id != null)).length;
  }, [cart]);

  const isEmpty = !cart || cart.length === 0;

  // 유효한 아이템만 대상으로 그룹화
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

  // invalid 아이템이 있으면 상단 경고(결제 대상에서 제외됨)
  useEffect(() => {
    if (invalidCount > 0) {
      setNotice({
        type: "warn",
        title: "장바구니 일부 항목을 확인해 주세요",
        message:
          "상품 정보가 없는 항목이 있어 결제 대상에서 제외했습니다. 문제가 계속되면 장바구니를 비우고 다시 담아주세요.",
      });
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      // invalid 없어졌으면 경고 자동 해제
      setNotice(null);
    }
  }, [invalidCount]);

  // 전체 선택 여부(그룹 기준)
  const allChecked = useMemo(() => {
    if (groups.length === 0) return false;
    return groups.every((g) => selectedGroup[String(g.product.id)]);
  }, [groups, selectedGroup]);

  // 선택된 라인아이템만 추출(결제/합계 계산용)
  const selectedItems = useMemo(() => {
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

  // 수량 변경 안전 가드: 재고가 있으면 초과 방지 + 1 미만 방지
  const safeChangeQty = (it, nextQty) => {
    const currentQty = it?.qty ?? 1;
    const q = Math.max(1, Number(nextQty) || 1);

    const limit = getLineStockLimit(it);
    if (typeof limit === "number" && limit >= 0) {
      if (q > limit) {
        setNotice({
          type: "error",
          title: "재고 수량을 초과했습니다",
          message: `선택한 옵션의 재고가 부족합니다. (최대 ${limit}개)`,
        });
        requestAnimationFrame(() => {
          topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        // 재고 초과면 변경 안 함
        return;
      }
    }

    // 변화 없으면 무시
    if (q === currentQty) return;

    changeQty(it.key, q);
  };

  // checkout 진입 전 사고 방지
  const goCheckoutSelected = () => {
    // 선택 0개
    if (!selectedItems.length) {
      setNotice({
        type: "error",
        title: "선택된 상품이 없습니다",
        message: "결제할 상품을 선택해주세요.",
      });
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    // 결제 대상에 product가 없는 항목이 섞였는지(그룹화에서 제외되긴 하지만 이중 안전)
    const broken = selectedItems.some((it) => !(it?.product && it?.product?.id != null));
    if (broken) {
      setNotice({
        type: "error",
        title: "결제할 수 없는 항목이 포함되어 있어요",
        message: "상품 정보가 없는 항목이 포함되어 결제를 진행할 수 없습니다. 장바구니를 정리 후 다시 시도해주세요.",
      });
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    // 재고 상한이 있는 경우 qty 초과 체크(수량 버튼에서 막지만 마지막에 한 번 더)
    const overStock = selectedItems.find((it) => {
      const limit = getLineStockLimit(it);
      if (typeof limit !== "number") return false;
      return (it?.qty ?? 1) > limit;
    });
    if (overStock) {
      const limit = getLineStockLimit(overStock);
      setNotice({
        type: "error",
        title: "재고 부족",
        message: `일부 옵션의 수량이 재고를 초과합니다. (최대 ${limit}개)`,
      });
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    // 정상 → checkout 이동
    navigate("/checkout", {
      state: {
        selectedKeys: selectedItems.map((it) => it.key),
        selectedItems: selectedItems.map((it) => ({
          key: it.key,
          productId: it?.product?.id,
          qty: it?.qty,
          options: it?.options,
        })),
      },
    });
  };

  return (
    <div
      ref={topRef}
      className="min-h-screen bg-white text-black px-6 md:px-10 w-full"
      style={{
        paddingBottom: `calc(120px + env(safe-area-inset-bottom) + ${bottomOffset}px)`,
      }}
    >
      <div className="text-5xl p-4 text-center font-bold mb-6">What's in my bag?</div>

      {/* 상단 안내/에러 박스 */}
      {notice && (
        <div
          className={[
            "mb-6 border rounded-xl p-4",
            notice.type === "error" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <div
            className={[
              "font-bold",
              notice.type === "error" ? "text-rose-700" : "text-amber-800",
            ].join(" ")}
          >
            {notice.title}
          </div>
          <div
            className={[
              "mt-1 text-sm whitespace-pre-line",
              notice.type === "error" ? "text-rose-700" : "text-amber-800",
            ].join(" ")}
          >
            {notice.message}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="text-xs underline text-gray-600"
              onClick={() => setNotice(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="text-xs underline text-gray-600"
                          onClick={() => removeGroup(group)}
                        >
                          이 상품 전체 삭제
                        </button>
                      </div>
                    </div>

                    {/* 옵션 라인 아이템들 */}
                    <div className="grid gap-2">
                      {group.items.map((it) => {
                        const qty = it?.qty ?? 1;
                        const limit = getLineStockLimit(it); // null이면 제한 없음
                        const incDisabled =
                          typeof limit === "number" ? qty >= limit : false;

                        return (
                          <div
                            key={it.key}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                          >
                            <div className="text-sm text-gray-700 break-words">
                              {formatOption(it)}
                              {typeof limit === "number" && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (최대 {limit}개)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className={stepBtn}
                                onClick={() => safeChangeQty(it, qty - 1)}
                                disabled={qty <= 1}
                                title="감소"
                              >
                                -
                              </button>

                              <div className={stepQty}>{qty}</div>

                              <button
                                type="button"
                                className={stepBtn}
                                onClick={() => safeChangeQty(it, qty + 1)}
                                disabled={incDisabled}
                                title={incDisabled ? "재고 부족" : "증가"}
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
          <div
            className="fixed right-4 z-50"
            style={{
              bottom: `calc(16px + env(safe-area-inset-bottom) + ${bottomOffset}px)`,
            }}
          >
            <div className="flex items-center gap-3 bg-white border rounded-xl shadow px-4 py-3">
              <div className="text-lg">
                TOTAL PRICE{" "}
                <span className="font-semibold">{selectedTotal.toLocaleString()}WON</span>
              </div>

              <button
                disabled={selectedItems.length === 0}
                onClick={goCheckoutSelected}
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
