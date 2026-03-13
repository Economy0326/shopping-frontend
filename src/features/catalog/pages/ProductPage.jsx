// 상품 상세페이지
// optionGroups.value(string) + stock 기반
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";

import { useCart } from "features/cart/context/CartContext";
import { ProductsAPI } from "features/catalog/api/products.api";
import { SystemAPI } from "shared/api/system.api";
import { pickData } from "shared/api/pickers";
import { getApiErrorMessage } from "shared/api/request";

const RETURNS_POLICY_KEY = "returns";

function TriangleArrow({
  className = "w-full h-full text-red-500",
  direction = "right",
}) {
  const rotateClass = direction === "left" ? "rotate-180" : "";
  return (
    <svg
      className={`${className} ${rotateClass}`}
      viewBox="8 0 12 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="8,4 8,20 20,12" fill="currentColor" />
    </svg>
  );
}

// optionGroups에서 특정 옵션 value의 stock 찾기
const getStockOfValue = (group, value) => {
  const opts = Array.isArray(group?.options) ? group.options : [];
  const found = opts.find((o) => String(o?.value) === String(value));
  return Number(found?.stock ?? 0);
};

export default function ProductPage() {
  // useParams: 라우터 파라미터에서 상품 ID 가져오기
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // value 기반 선택 상태
  const [selectedSizeValue, setSelectedSizeValue] = useState("");
  const [selectedColorValue, setSelectedColorValue] = useState("");

  const [error, setError] = useState("");
  const [open, setOpen] = useState({
    size: false,
    info: false,
    return: false,
  });

  const [sizeGuideMd, setSizeGuideMd] = useState("");
  const [productInfoMd, setProductInfoMd] = useState("");
  const [returnsMd, setReturnsMd] = useState("교환/환불 안내를 준비 중입니다.");
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // 옵션 섹션 열기/닫기 토글
  const toggle = (k) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  useEffect(() => {
    // alive: 비동기 작업 취소 플래그
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadErr("");

        const res = await ProductsAPI.get(id);
        const detail = pickData(res);

        if (!detail) throw new Error("상품 데이터가 비어있습니다.");

        // product 전용 페이지이므로 look 카테고리 진입 차단
        if (detail.categorySlug === "look") {
          throw new Error("look 항목은 /look/:id 경로를 사용하세요.");
        }

        if (alive) {
          setProduct(detail);

          // 상품 바뀌면 선택 초기화
          setSelectedSizeValue("");
          setSelectedColorValue("");
          setQty(1);
          setError("");
          setCurrentIndex(0);
        }
      } catch (e) {
        if (alive) {
          setProduct(null);
          setLoadErr(getApiErrorMessage(e, "상품 상세 로드 실패"));
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const images = product?.images ?? [];

  const rawPrice = product?.price;
  const hasPrice = typeof rawPrice === "number";
  const formattedPrice = hasPrice ? rawPrice.toLocaleString() : null;

  // opitionGroups: size, color
  const optionGroups = Array.isArray(product?.optionGroups)
    ? product.optionGroups
    : [];
  const sizeGroup = optionGroups.find((g) => g.key === "size");
  const colorGroup = optionGroups.find((g) => g.key === "color");

  const sizeOptions = Array.isArray(sizeGroup?.options) ? sizeGroup.options : [];
  const colorOptions = Array.isArray(colorGroup?.options) ? colorGroup.options : [];

  // 스와이프용 ref/state
  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    active: false,
  });

  // active 중앙 자동 스크롤
  const activeLinkRef = useRef(null);
  const currentCat = product?.categorySlug || "all";

  useEffect(() => {
    // 레이아웃/폰트 적용 후 스크롤되도록 RAF 2번
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        activeLinkRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      });
    });
  }, [currentCat]);

  // 공통 next/prev 함수 (버튼/스와이프 모두 사용)
  const goPrevImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNextImage = () => {
    if (images.length <= 1) return;
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  // 터치 스와이프 핸들러 (모바일에서 점+스와이프 조합)
  const onTouchStart = (e) => {
    if (images.length <= 1) return;
    const t = e.touches?.[0];
    if (!t) return;
    swipeRef.current.startX = t.clientX;
    swipeRef.current.startY = t.clientY;
    swipeRef.current.dx = 0;
    swipeRef.current.dy = 0;
    swipeRef.current.active = true;
  };

  const onTouchMove = (e) => {
    if (!swipeRef.current.active) return;
    const t = e.touches?.[0];
    if (!t) return;
    swipeRef.current.dx = t.clientX - swipeRef.current.startX;
    swipeRef.current.dy = t.clientY - swipeRef.current.startY;

    // 세로 스크롤을 막지 않기 위해 여기서는 preventDefault 안 함
  };

  const onTouchEnd = () => {
    if (!swipeRef.current.active) return;
    swipeRef.current.active = false;

    const { dx, dy } = swipeRef.current;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // 세로가 더 크면 스크롤로 간주
    if (absY > absX) return;

    // 민감도(임계값)
    const THRESHOLD = 45;

    if (dx > THRESHOLD) {
      // 오른쪽으로 밀면 이전
      goPrevImage();
    } else if (dx < -THRESHOLD) {
      // 왼쪽으로 밀면 다음
      goNextImage();
    }
  };

  // 현재 선택 기반 “조합 가능 재고(대략치)” 계산
  // - 둘 다 선택되면 min(sizeStock, colorStock)
  // - 하나만 선택되면 해당 옵션 stock
  // - 최종 재고 검증은 주문 생성 시 백엔드가 수행
  const selectedAvailableStock = useMemo(() => {
    const hasSize = sizeOptions.length > 0;
    const hasColor = colorOptions.length > 0;

    const sizePicked = hasSize ? selectedSizeValue : "";
    const colorPicked = hasColor ? selectedColorValue : "";

    if (hasSize && sizePicked) {
      const s = getStockOfValue(sizeGroup, sizePicked);
      if (hasColor && colorPicked) {
        const c = getStockOfValue(colorGroup, colorPicked);
        return Math.min(s, c);
      }
      return s;
    }

    if (hasColor && colorPicked) {
      return getStockOfValue(colorGroup, colorPicked);
    }

    // 아무것도 선택 안 했으면 제한 없음(버튼 활성화 판단은 validate에서 함)
    return Infinity;
  }, [
    sizeGroup,
    colorGroup,
    sizeOptions.length,
    colorOptions.length,
    selectedSizeValue,
    selectedColorValue,
  ]);

  /**
   * 버튼 선택 가능 여부(단일 옵션 기준)
   * - optionGroups의 stock 기준으로만 판단
   * - size 버튼: sizeOption.stock > 0 이면 가능
   * - color 버튼: colorOption.stock > 0 이면 가능
   */
  const isOptionAvailable = (groupKey, value) => {
    const group = groupKey === "size" ? sizeGroup : colorGroup;
    const stock = getStockOfValue(group, value);
    return stock > 0;
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await SystemAPI.policy(RETURNS_POLICY_KEY);
        if (alive) {
          const txt = data?.value ?? "";
          setReturnsMd(txt || "교환/환불 안내를 준비 중입니다.");
        }
      } catch {
        if (alive) setReturnsMd("교환/환불 안내를 준비 중입니다.");
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    let alive = true;

    async function fetchTextMaybe(url) {
      try {
        if (!url) return "";
        const res = await fetch(url);
        if (!res.ok) return "";
        return await res.text();
      } catch {
        return "";
      }
    }

    (async () => {
      setLoadingInfo(true);

      const sizeMdUrl = product?.sizeGuideMdUrl ?? "";
      const infoMdUrl = product?.productInfoMdUrl ?? "";

      const sizeTextFallback = product?.sizeGuideText ?? "";
      const infoTextFallback =
        product?.productInfoText ?? product?.description ?? "";

      const [sizeMdText, infoMdText] = await Promise.all([
        sizeMdUrl ? fetchTextMaybe(sizeMdUrl) : "",
        infoMdUrl ? fetchTextMaybe(infoMdUrl) : "",
      ]);

      if (alive) {
        setSizeGuideMd(sizeMdText?.trim() || sizeTextFallback);
        setProductInfoMd(infoMdText?.trim() || infoTextFallback);
        setLoadingInfo(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, product]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">로딩중…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">{loadErr || "상품을 찾을 수 없습니다."}</p>
        <button className="text-red-500 underline" onClick={() => navigate(-1)}>
          GET OUT
        </button>
      </main>
    );
  }

  // 선택 검증 함수 (장바구니 담기/바로구매 전에 호출)
  const validateSelection = () => {
    const needsSize = sizeOptions.length > 0;
    const needsColor = colorOptions.length > 0;

    if (
      (needsSize && !selectedSizeValue) ||
      (needsColor && !selectedColorValue)
    ) {
      setError("색상과 사이즈를 선택해주세요.");
      return false;
    }

    if (Number(selectedAvailableStock) <= 0) {
      setError("해당 옵션은 품절이거나 재고가 부족합니다.");
      return false;
    }

    if (qty > Number(selectedAvailableStock)) {
      setError(`재고가 부족합니다. (최대 ${Number(selectedAvailableStock)}개)`);
      return false;
    }

    return true;
  };

  // 장바구니 담기 (optionValues 기반)
  const addCurrentToCart = () => {
    if (!validateSelection()) return false;

    const optionValues = {};
    if (sizeOptions.length > 0 && selectedSizeValue) {
      optionValues.size = selectedSizeValue;
    }
    if (colorOptions.length > 0 && selectedColorValue) {
      optionValues.color = selectedColorValue;
    }

    addToCart(product, Math.max(1, qty), { optionValues, priceDelta: 0 });
    return true;
  };

  const handleBuyNow = () => {
    setError("");
    if (!addCurrentToCart()) return;
    navigate("/cart");
  };

  const handleAddOnly = () => {
    setError("");
    if (!addCurrentToCart()) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  // 버튼 비활성(옵션 미선택 or 품절 or 재고보다 qty 큼)
  const buyDisabled =
    (sizeOptions.length > 0 && !selectedSizeValue) ||
    (colorOptions.length > 0 && !selectedColorValue) ||
    Number(selectedAvailableStock) <= 0 ||
    qty > Number(selectedAvailableStock);

  return (
    <>
      {/* 카테고리/탭 */}
      <header>
        {/* product 카테고리 탭 */}
        <div className="relative w-full sm:w-[80%] mx-auto p-5 bg-white">
          <nav
            className="
              flex flex-nowrap items-center
              justify-start
              gap-3 sm:gap-6 xl:gap-10
              overflow-x-auto
              scroll-smooth
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              [scroll-snap-type:x_mandatory]
            "
            aria-label="카테고리"
          >
            {categories.map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${cat}`}
                ref={currentCat === cat ? activeLinkRef : null}
                className={({ isActive }) =>
                  `shrink-0 text-2xl xl:text-5xl font-bold uppercase mb-6 px-2 py-1 transition-colors duration-200
                  [scroll-snap-align:center]
                  ${isActive ? "text-white" : "text-red-500"}`
                }
                style={({ isActive }) =>
                  isActive ? { WebkitTextStroke: "1px red" } : {}
                }
              >
                {cat}
              </NavLink>
            ))}
          </nav>

          <div className="sm:hidden pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/90 to-transparent" />
          <div className="sm:hidden pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white via-white/90 to-transparent" />
        </div>
      </header>

      {/* 상세 */}
      <main className="max-w-screen-2xl mx-auto p-6 grid gap-12 lg:grid-cols-2">
        {/* 이미지 */}
        <div className="lg:sticky lg:top-6 justify-self-center w-full">
          <div className="w-full max-w-[520px] mx-auto">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
              {/* LEFT ARROW (sm 이상에서만 노출) */}
              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={goPrevImage}
                  className="hidden sm:grid w-12 h-24 place-items-center translate-x-2 hover:shadow-lg hover:bg-red-50 active:scale-95"
                  aria-label="이전 이미지"
                >
                  <TriangleArrow className="w-12 h-24 text-red-500" direction="left" />
                </button>
              ) : (
                <div className="hidden sm:block w-12 h-12" aria-hidden="true" />
              )}

              {/* IMAGE + SWIPE HANDLERS */}
              <div
                className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-50">
                  <img
                    src={images[currentIndex]?.url ?? images[currentIndex]}
                    alt={`${product?.name || "product"} ${currentIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* MOBILE DOT INDICATOR (sm 미만에서만) */}
                {images.length > 1 && (
                  <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`${idx + 1}번 이미지로 이동`}
                        className={[
                          "w-2.5 h-2.5 rounded-full transition-transform",
                          idx === currentIndex ? "bg-red-500 scale-110" : "bg-red-200",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT ARROW (sm 이상에서만 노출) */}
              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={goNextImage}
                  className="hidden sm:grid w-12 h-24 place-items-center -translate-x-2 hover:shadow-lg hover:bg-red-50 active:scale-95"
                  aria-label="다음 이미지"
                >
                  <TriangleArrow className="w-12 h-24 text-red-500" direction="right" />
                </button>
              ) : (
                <div className="hidden sm:block w-12 h-12" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {/* 정보 + 옵션 + 구매 + 설명 */}
        <section className="flex flex-col gap-8">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold">{product?.name}</h1>
            {hasPrice && (
              <div className="text-xl font-bold text-black">
                PRICE {formattedPrice} WON
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {sizeOptions.length > 0 && (
              <div role="radiogroup" className="flex flex-wrap gap-1">
                {sizeOptions.map((opt) => {
                  const val = String(opt?.value ?? "");
                  const isSelected = selectedSizeValue === val;
                  const soldOut = !isOptionAvailable("size", val);

                  return (
                    <button
                      key={`size-${val}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`사이즈 ${val}`}
                      onClick={() => setSelectedSizeValue(val)}
                      disabled={soldOut}
                      className={[
                        "w-9 h-9 rounded-md border-2 flex items-center justify-center font-bold transition-colors select-none text-sm outline-none ring-0",
                        "border-red-500",
                        soldOut
                          ? "opacity-30 cursor-not-allowed bg-white text-red-600"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-white text-red-600",
                      ].join(" ")}
                      title={soldOut ? "품절" : `${val} (재고 ${Number(opt?.stock ?? 0)})`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            )}

            {colorOptions.length > 0 && (
              <div role="radiogroup" className="flex flex-wrap gap-1">
                {colorOptions.map((opt) => {
                  const val = String(opt?.value ?? "");
                  const isSelected = selectedColorValue === val;
                  const soldOut = !isOptionAvailable("color", val);

                  const bgClass =
                    ["white", "black"].includes(val.toLowerCase())
                      ? val.toLowerCase() === "white"
                        ? "bg-white"
                        : "bg-black"
                      : "";
                  const inlineStyle = bgClass ? undefined : { backgroundColor: val };

                  return (
                    <button
                      key={`color-${val}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`색상 ${val}`}
                      onClick={() => setSelectedColorValue(val)}
                      disabled={soldOut}
                      className={[
                        "w-9 h-9 rounded-md border-2 flex items-center justify-center transition select-none outline-none ring-0",
                        "border-red-500",
                        bgClass,
                        soldOut ? "opacity-30 cursor-not-allowed" : "",
                      ].join(" ")}
                      style={inlineStyle}
                      title={soldOut ? "품절" : `${val} (재고 ${Number(opt?.stock ?? 0)})`}
                    >
                      {isSelected && !soldOut && (
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {/* 모바일 전용 컨트롤 */}
          <div className="sm:hidden grid gap-3">
            {/* 수량 */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                className="w-10 h-10 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-10 h-10 border-4 border-red-500 text-red-500 font-bold rounded text-center appearance-none
                          [&::-webkit-inner-spin-button]:appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none
                          [-moz-appearance:textfield]"
              />
              <button
                type="button"
                className="w-10 h-10 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>

            {/* BUY + 장바구니 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buyDisabled}
                aria-disabled={buyDisabled}
                className="flex-1 h-10 bg-red-500 rounded font-bold text-2xl text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY!
              </button>

              <button
                type="button"
                onClick={handleAddOnly}
                disabled={buyDisabled}
                aria-disabled={buyDisabled}
                aria-label="장바구니에 담기"
                className="w-8 h-10 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <img src="/mood/bag.png" alt="bag" className="w-5 h-8" />
              </button>
            </div>
          </div>

          {/* sm 이상(모바일보다 큰 화면)에서만 기존 가로 줄 유지 */}
          <div className="hidden sm:flex w-full h-10 items-center gap-2">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={buyDisabled}
              aria-disabled={buyDisabled}
              className="flex-[0_0_80%] h-full bg-red-500 rounded font-bold text-2xl text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              BUY!
            </button>

            <div className="flex-[0_0_20%] h-full flex items-center justify-end gap-2">
              <div className="flex">
                <button
                  type="button"
                  className="w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded text-center appearance-none
                            [&::-webkit-inner-spin-button]:appearance-none
                            [&::-webkit-outer-spin-button]:appearance-none
                            [-moz-appearance:textfield]"
                />
                <button
                  type="button"
                  className="w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddOnly}
                disabled={buyDisabled}
                aria-disabled={buyDisabled}
                aria-label="장바구니에 담기"
                className="w-7 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <img
                  src="/mood/bag.png"
                  alt="bag"
                  className="inline-flex items-center justify-center w-4 h-7"
                />
              </button>
            </div>
          </div>

          {/* 설명 */}
          <div>
            {[
              { key: "size", title: "SIZE GUIDE", content: sizeGuideMd },
              { key: "info", title: "PRODUCT INFO", content: productInfoMd },
              { key: "return", title: "RETURN/EXCHANGE", content: returnsMd },
            ].map(({ key, title, content }) => (
              <div key={key}>
                <button
                  onClick={() => toggle(key)}
                  aria-expanded={open[key]}
                  aria-controls={`sec-${key}`}
                  className="relative w-full flex justify-start font-bold py-2"
                >
                  <span className="pr-10">{title}</span>
                  <span
                    className={`absolute left-1/2 transform -translate-x-1/2 transition-transform ${
                      open[key] ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {open[key] && (
                  <div id={`sec-${key}`} className="text-sm text-black px-2 pb-2">
                    {loadingInfo ? "로딩 중…" : (content || "준비 중입니다.")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {added && (
          <div className="fixed top-4 right-4 bg-white p-2 rounded shadow">
            장바구니에 담겼습니다!
          </div>
        )}
      </main>
    </>
  );
}