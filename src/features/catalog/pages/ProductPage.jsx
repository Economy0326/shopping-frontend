// 상품 상세페이지 + 룩북 상세페이지
import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";

import { useCart } from "features/cart/context/CartContext";
import { ProductsAPI } from "features/catalog/api/products.api"; // 명세 기준: get/list 통일
import { SystemAPI } from "shared/api/system.api";
import { pickData } from "shared/api/pickers"; // { data: ... } 껍데기 벗기기
import { getApiErrorMessage } from "shared/api/request";

// 정책키는 상수로 고정
// 운영자가 /system/policies/returns 만 수정하면 전상품에 반영됨
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

// variant => 둘 다 선택은 해당 조합 재고로 판단
// 하나만 선택은 해당 옵션을 포함하는 variant 중 stock>0 있으면 가능
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);

  const [qty, setQty] = useState(1); // 구매 수량
  const [added, setAdded] = useState(false); // 장바구니 담김 표시

  /**
   *  옵션 선택은 value가 아니라 option.id(= optionId)로 저장해야 함
   * - 명세: 주문 payload는 optionId(option.id) 기반
   * - value/index 기반 전송 금지
   */
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);

  const [error, setError] = useState("");
  const [open, setOpen] = useState({
    // 아코디언 섹션 열림 상태
    size: false,
    info: false,
    return: false,
  });

  const [sizeGuideMd, setSizeGuideMd] = useState("");
  const [productInfoMd, setProductInfoMd] = useState("");
  const [returnsMd, setReturnsMd] = useState("교환/환불 안내를 준비 중입니다.");
  const [loadingInfo, setLoadingInfo] = useState(true);

  // 룩북 전용 md 텍스트
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lookMd, setLookMd] = useState("");

  // 서버 로딩/에러 상태 (운영버전 기본)
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  // 아코디언 토글 헬퍼
  const toggle = (k) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  useEffect(() => {
    // alive 플래그: 언마운트 후 setState 방지
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadErr("");

        // 명세: GET /products/{id}
        const res = await ProductsAPI.get(id);
        const detail = pickData(res);

        if (!detail) throw new Error("상품 데이터가 비어있습니다.");
        if (alive) setProduct(detail);
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

  // product가 null일 때 접근 안전하게 처리
  const images = product?.images ?? [];
  const isLook = product?.categorySlug === "look";

  // 룩북 md URL (명세: lookMdUrl optional)
  const lookMdUrl = product?.lookMdUrl ?? "";

  const rawPrice = product?.price;
  // 룩북 이면 가격 노출 안 함
  const hasPrice = typeof rawPrice === "number" && !isLook;
  const formattedPrice = hasPrice ? rawPrice.toLocaleString() : null;

  /**
   *  optionGroups 기반 렌더링
   * - optionGroups: [{ key:'size'|'color', options:[{id,value,stock}] }]
   */
  const optionGroups = Array.isArray(product?.optionGroups) ? product.optionGroups : [];
  const sizeGroup = optionGroups.find((g) => g.key === "size");
  const colorGroup = optionGroups.find((g) => g.key === "color");

  const sizeOptions = Array.isArray(sizeGroup?.options) ? sizeGroup.options : [];
  const colorOptions = Array.isArray(colorGroup?.options) ? colorGroup.options : [];

  // Variant 목록 (조합 재고)
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  // optionIds 배열 비교용(정렬 후 문자열 키)
  const keyOf = (ids = []) =>
    ids
      .filter(Boolean)
      .map((n) => Number(n))
      .sort((a, b) => a - b)
      .join(",");

  // 현재 선택(또는 후보) optionIds로 variant 찾기
  const findVariantByOptionIds = (ids = []) => {
    const k = keyOf(ids);
    return variants.find((v) => keyOf(v?.optionIds || []) === k) || null;
  };

  // 현재 선택된 조합 variant
  const selectedVariant =
    !isLook && selectedSizeId && selectedColorId
      ? findVariantByOptionIds([selectedSizeId, selectedColorId])
      : null;

  // 특정 옵션(버튼)이 "선택 가능"한지 계산
  // - 둘 다 선택이면 해당 조합 재고로 판단
  // - 하나만 선택이면 해당 옵션을 포함하는 variant 중 stock>0 있으면 가능
  const isOptionAvailable = (groupKey, optionId) => {
    if (isLook) return true;

    const sizeId = groupKey === "size" ? optionId : selectedSizeId;
    const colorId = groupKey === "color" ? optionId : selectedColorId;

    // 둘 다 있으면 조합 variant 재고
    if (sizeId && colorId) {
      const v = findVariantByOptionIds([sizeId, colorId]);
      return Boolean(v && Number(v.stock) > 0);
    }

    // 하나만 있으면 partial 포함 variant 중 재고 있는지
    const partial = [sizeId, colorId].filter(Boolean).map(Number);
    if (partial.length === 0) return true;

    return variants.some((v) => {
      const ids = Array.isArray(v?.optionIds) ? v.optionIds : [];
      const ok = partial.every((x) => ids.includes(x));
      return ok && Number(v.stock) > 0;
    });
  };

  /**
   * (공통 정책) 교환/반품/환불 안내
   * - /system/policies/returns
   * - 서버가 { key, value } 형태로 준다는 전제 (명세)
   */
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

  /**
   * 상품별 상세/사이즈 안내
   * - URL 방식: sizeGuideMdUrl / productInfoMdUrl
   * - Text 방식: sizeGuideText / productInfoText
   * - fallback 우선순위: URL fetch -> Text -> description -> 미노출
   */
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

      // 서버가 텍스트만 주는 경우 fallback
      const sizeTextFallback = product?.sizeGuideText ?? "";
      const infoTextFallback = product?.productInfoText ?? product?.description ?? "";

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

  //룩북 md는 서버가 lookMdUrl(URL)을 주면 fetch
  useEffect(() => {
    let alive = true;

    async function loadMd() {
      if (isLook && lookMdUrl) {
        try {
          const res = await fetch(lookMdUrl);
          if (!res.ok) throw new Error("md fetch fail");
          const txt = await res.text();
          if (alive) setLookMd(txt);
        } catch {
          if (alive) setLookMd("");
        }
      } else {
        if (alive) setLookMd("");
      }
    }

    loadMd();
    return () => {
      alive = false;
    };
  }, [isLook, lookMdUrl]);

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

  const validateSelection = () => {
    if (isLook) return true;

    const needsSize = Array.isArray(sizeOptions) && sizeOptions.length > 0;
    const needsColor = Array.isArray(colorOptions) && colorOptions.length > 0;

    if ((needsSize && !selectedSizeId) || (needsColor && !selectedColorId)) {
      setError("색상과 사이즈를 선택해주세요.");
      return false;
    }

    // 선택 조합이 실제 variant로 존재하는지 + 재고 확인
    const v = findVariantByOptionIds([selectedSizeId, selectedColorId]);
    if (!v) {
      setError("선택한 옵션 조합을 찾을 수 없습니다.");
      return false;
    }
    if (Number(v.stock) <= 0) {
      setError("해당 옵션은 품절입니다.");
      return false;
    }

    return true;
  };

  // 장바구니에 현재 상품 추가
  const addCurrentToCart = () => {
    if (!validateSelection()) return false;

    // Cart에는 optionIds를 저장(주문 payload와 동일한 “id 기반”)
    const optionIds = [
      ...(selectedSizeId ? [Number(selectedSizeId)] : []),
      ...(selectedColorId ? [Number(selectedColorId)] : []),
    ].filter(Boolean);

    const optionLabels = [
      ...(selectedSizeId
        ? [
            `SIZE:${String(
              sizeOptions.find((o) => String(o.id) === String(selectedSizeId))?.value ?? ""
            )}`,
          ]
        : []),
      ...(selectedColorId
        ? [
            `COLOR:${String(
              colorOptions.find((o) => String(o.id) === String(selectedColorId))?.value ?? ""
            )}`,
          ]
        : []),
    ].filter((s) => s && !s.endsWith(":"));

    // variantid 계산
    const v = findVariantByOptionIds(optionIds);

    addToCart(
      product,
      Math.max(1, qty),
      optionIds.length
        ? { optionIds, optionLabels, variantId: v?.id }
        : {}
    );
    
    return true;
  };

  // 바로 구매 처리
  const handleBuyNow = () => {
    setError("");
    if (!addCurrentToCart()) return;
    navigate("/cart");
  };

  // 장바구니에 담기 처리
  const handleAddOnly = () => {
    setError("");
    if (!addCurrentToCart()) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  // 버튼 비활성 조건
  const buyDisabled =
    (!isLook && sizeOptions.length > 0 && !selectedSizeId) ||
    (!isLook && colorOptions.length > 0 && !selectedColorId) ||
    (!isLook && selectedVariant && Number(selectedVariant.stock) <= 0);
  
    return (
    <>
      {/* 카테고리/탭 */}
      <header>
        {isLook ? (
          <nav
            aria-label="카테고리"
            className="flex justify-center w-full xl:w-4/5 mx-auto p-5 bg-white"
          >
            <NavLink
              to="/look"
              className={({ isActive }) =>
                `relative text-4xl xl:text-5xl font-bold -translate-x-1 uppercase px-2 py-1 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-red-500"
                }`
              }
              style={({ isActive }) =>
                isActive ? { WebkitTextStroke: "1px red" } : {}
              }
            >
              look
            </NavLink>
          </nav>
        ) : (
          <nav className="flex justify-between gap-2 xl:gap-4 w-full xl:w-4/5 mx-auto p-5 bg-white">
            {categories.map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${cat}`}
                className={({ isActive }) =>
                  `text-2xl xl:text-5xl font-bold uppercase mb-6 px-2 py-1 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-red-500"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { WebkitTextStroke: "1px red" } : {}
                }
              >
                {cat}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* 상세 */}
      <main className="max-w-screen-2xl mx-auto p-6 grid gap-12 lg:grid-cols-2">
        {/* 이미지 */}
        <div className="lg:sticky lg:top-6 justify-self-center">
          <div className="relative w-[520px] mx-auto lg:mx-0">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex(
                    (i) => (i - 1 + images.length) % images.length
                  )
                }
                className="group absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 z-20 w-12 h-[16%] min-h-12 flex items-center justify-center"
                aria-label="이전 이미지"
              >
                <TriangleArrow
                  className="h-[145%] text-red-500 scale-y-150 transition-transform"
                  direction="left"
                />
              </button>
            )}

            <img
              src={images[currentIndex]?.url}
              alt={`${product?.name || "product"} ${currentIndex + 1}`}
              className="w-full h-auto object-cover rounded-2xl"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
                className="group absolute top-1/2 right-0 translate-x-full -translate-y-1/2 z-20 w-12 h-[16%] min-h-12 flex items-center justify-center"
                aria-label="다음 이미지"
              >
                <TriangleArrow
                  className="h-[145%] text-red-500 scale-y-150 transition-transform"
                  direction="right"
                />
              </button>
            )}
          </div>
        </div>

        {/* 정보 + 옵션 + 구매 + 설명 */}
        <section className="flex flex-col gap-8">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold">
              {isLook ? "NO THINKING AREA" : product?.name}
            </h1>
            {hasPrice && (
              <div className="text-xl font-bold text-black">
                PRICE {formattedPrice} WON
              </div>
            )}
          </div>

          {!isLook && (
            <>
              {/* 사이즈/색상(optionGroups) */}
              <div className="grid gap-6">
                {/* 옵션이 없으면 UI 자체를 숨김 */}
                {sizeOptions.length > 0 && (
                  <div role="radiogroup" className="flex flex-wrap gap-1">
                    {sizeOptions.map((opt) => {
                      const isSelected = String(selectedSizeId) === String(opt.id);
                      const soldOut = !isOptionAvailable("size", opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`사이즈 ${opt.value}`}
                          onClick={() => setSelectedSizeId(opt.id)}
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
                          title={soldOut ? "품절" : String(opt.value)}
                        >
                          {String(opt.value)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {colorOptions.length > 0 && (
                  <div role="radiogroup" className="flex flex-wrap gap-1">
                    {colorOptions.map((opt) => {
                      const isSelected = String(selectedColorId) === String(opt.id);
                      const soldOut = !isOptionAvailable("color", opt.id);

                      // UI용 배경 처리(값이 black/white면 색상칩)
                      const color = String(opt.value ?? "");
                      const bgClass =
                        ["white", "black"].includes(color.toLowerCase())
                          ? color.toLowerCase() === "white"
                            ? "bg-white"
                            : "bg-black"
                          : "";
                      const inlineStyle = bgClass ? undefined : { backgroundColor: color };

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`색상 ${color}`}
                          onClick={() => setSelectedColorId(opt.id)}
                          disabled={soldOut}
                          className={[
                            "w-9 h-9 rounded-md border-2 flex items-center justify-center transition select-none outline-none ring-0",
                            "border-red-500",
                            bgClass,
                            soldOut ? "opacity-30 cursor-not-allowed" : "",
                          ].join(" ")}
                          style={inlineStyle}
                          title={soldOut ? "품절" : color}
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
            </>
          )}

          {!isLook && (
            <div className="flex w-full h-10 items-center gap-2">
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
                    onChange={(e) =>
                      setQty(Math.max(1, Number(e.target.value) || 1))
                    }
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
          )}

          {/* 설명 */}
          {isLook ? (
            <section className="text-sm leading-7 text-black/90 max-w-none">
              {lookMd ? (
                <div className="whitespace-pre-line">{lookMd.trim()}</div>
              ) : (
                <p className="whitespace-pre-line">
                  {product?.description ?? "룩 설명을 준비 중입니다."}
                </p>
              )}
            </section>
          ) : (
            <div>
              <div>
                {[
                  { key: "size", title: "SIZE GUIDE", content: sizeGuideMd },
                  { key: "info", title: "PRODUCT INFO", content: productInfoMd },
                  { key: "return", title: "RETURN/EXCHANGE", content: returnsMd },
                ]
                  // 전부 비어있으면 섹션 자체를 숨기고 싶으면 여기서 filter 가능
                  .map(({ key, title, content }) => (
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
            </div>
          )}
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
