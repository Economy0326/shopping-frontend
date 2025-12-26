import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "features/cart/context/CartContext";

/** 안전 파싱 */
const num = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);

/** 라인아이템 고유키: sku > lineItemId > product.id + 옵션 조합 */
const getItemKey = (it) => {
  const pid = String(it?.product?.id ?? "");
  const sku = it?.sku;
  const lid = it?.lineItemId;
  const size =
    it?.selectedOptions?.Size ||
    it?.size ||
    it?.product?.selectedSize ||
    it?.product?.size ||
    "";
  const color =
    it?.selectedOptions?.Color ||
    it?.color ||
    it?.product?.selectedColor ||
    it?.product?.color ||
    "";
  return String(sku || lid || `${pid}:${size}:${color}`);
};

/** 같은 product.id 끼리 묶기 (이미지 1장 + 옵션 요약용) */
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

/** 옵션 요약 포맷: 수량(2),size(1),color(white) */
const formatOption = (it) => {
  const size =
    it?.selectedOptions?.Size ??
    it?.size ??
    it?.product?.selectedSize ??
    it?.product?.size ??
    "-";
  const color =
    it?.selectedOptions?.Color ??
    it?.color ??
    it?.product?.selectedColor ??
    it?.product?.color ??
    "-";
  const qty = it?.quantity ?? 1;
  return `수량(${qty}),size(${String(size)}),color(${String(color)})`;
};

/** 썸네일 우선순위: product.images[0] > product.image > (레거시) item.image > 빈 문자열 */
const getThumb = (item) =>
  item?.product?.images?.[0] ??
  item?.product?.image ??
  item?.image ??
  "";

/** 상품 가격: product.price 숫자 */
const getPrice = (product) => num(product?.price, 0);

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // 그룹(상품 단위) 선택 상태: { [productId]: boolean }
  const [selectedGroup, setSelectedGroup] = useState({});

  const isEmpty = !cart || cart.length === 0;

  // 그룹 목록
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
    return groups.flatMap((g) =>
      selectedGroup[String(g.product.id)] ? g.items : []
    );
  }, [groups, selectedGroup]);

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => {
      return sum + getPrice(it?.product) * (it?.quantity ?? 1);
    }, 0);
  }, [selectedItems]);

  const toggleAll = () => {
    const target = !allChecked;
    const next = {};
    groups.forEach((g) => {
      next[String(g.product.id)] = target;
    });
    setSelectedGroup(next);
  };

  const toggleGroup = (pid) => {
    const id = String(pid);
    setSelectedGroup((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 그룹 삭제: 해당 상품의 모든 라인아이템 삭제
  const removeGroup = (group) => {
    group.items.forEach((it) => removeFromCart(getItemKey(it))); // removeFromCart가 lineKey/sku 지원
  };

  return (
    <div className="min-h-screen bg-white text-black pl-10 pr-10 w-full">
      <div className="text-5xl p-4 text-center font-bold mb-6">
        What's in my bag?
      </div>

      {/* 빈 상태 */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-5xl p-16 text-center font-bold mb-6">NOTHING</div>
        </div>
      )}

      {/* 상품 있을 때 */}
      {!isEmpty && (
        <>
          {/* 상단 바 (전체 선택/개수) */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* 전체 선택 버튼 */}
              <button
                type="button"
                onClick={toggleAll}
                aria-pressed={allChecked}
                className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white transition outline-none ring-0 [appearance:none]
                  ${allChecked ? "text-red-500" : "text-gray-300"}`}
              >
                <span
                  className={`w-5 h-5 border-2 flex items-center justify-center leading-none
                    ${allChecked ? "font-bold border-red-500 text-red-500" : "font-bold border-gray-300 text-gray-300"}`}
                >
                  ✓
                </span>
                <span className="text-xl font-bold md:text-base font-medium">전체 선택</span>
              </button>

              {/* 선택 / 총 */}
              <span className="text-gray-600">
                선택 {selectedItems.length} / 총 {cart.length}개
              </span>
            </div>
          </div>

          {/* 제품 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => {
              const p = group.product;
              const pid = String(p.id);
              const checked = !!selectedGroup[pid];

              // 옵션 요약: "option : 수량(2),size(1),color(white) / 수량(1),size(1),color(black)"
              const summary = group.items.map(formatOption).join(" / ");

              // 썸네일
              const thumb =
                p?.images?.[0] ??
                p?.image ??
                group.items.find((it) => getThumb(it))?.image ??
                "";

              return (
                <div key={pid} className="p-4">
                  {/* 체크 버튼 */}
                  <div className="mb-2">
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
                  </div>

                  {/* 이미지 (안쪽 우상단 X 삭제) */}
                  <div className="relative">
                    <img
                      src={thumb}
                      alt={p?.name || "item"}
                      className="w-full aspect-square object-cover rounded-xl"
                      onError={(e) => {
                        // 경로 깨질 때 대비: public에 placeholder가 있다면 교체
                        e.currentTarget.src = "/mood/nothing.png";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGroup(group)}
                      title="삭제"
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full border-2
                                  flex items-center justify-center bg-white/80 hover:bg-white
                                  focus:outline-none focus:ring"
                    >
                      ×
                    </button>
                  </div>

                  {/* 상품명 */}
                  <div className="mt-3 text-2xl text-center font-bold line-clamp-2">
                    {p?.name}
                  </div>

                  {/* 가격 */}
                  <div className="mt-3 text-xl text-center font-bold line-clamp-2">
                    {getPrice(p).toLocaleString()}WON
                  </div>

                  {/* 옵션 요약 (라인 목록·번호 없음) */}
                  <div className="mt-3 text-xl text-center font-bold">
                    OPTION : {summary}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 우하단 고정 결제 박스 */}
          <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-3 bg-white border rounded-xl shadow px-4 py-3">
              <div className="text-lg">
                TOTAL PRICE{" "}
                <span className="font-semibold">
                  {selectedTotal.toLocaleString()}WON
                </span>
              </div>
              <button
                disabled={selectedItems.length === 0}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      selectedItems: selectedItems.map((it) => ({
                        id: it?.product?.id,
                        quantity: it?.quantity,
                        sku: it?.sku,
                        selectedOptions: it?.selectedOptions,
                      })),
                    },
                  })
                }
                className={`px-5 py-2 rounded text-white text-lg ${
                  selectedItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black"
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
