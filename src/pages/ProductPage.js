// src/pages/ProductPage.js
// 상품 상세페이지 + 룩북 상세페이지
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import products from "../data/Product";                 // 로컬 폴백
import { useCart } from "../context/CartContext";
import { ProductsAPI } from "../api/products";          // 서버 우선

function TriangleArrow({ className = "w-full h-full text-red-500", direction = "right" }) {
  const rotateClass = direction === "left" ? "rotate-180" : "";
  return (
    <svg className={`${className} ${rotateClass}`} viewBox="8 0 12 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8,4 8,20 20,12" fill="currentColor" />
    </svg>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState({ size: false, info: false, return: false });

  // 서버/로컬에서 불러올 상세 텍스트들
  const [sizeGuideMd, setSizeGuideMd]     = useState("");
  const [productInfoMd, setProductInfoMd] = useState("");
  const [returnsMd, setReturnsMd]         = useState("교환/환불 안내를 준비 중입니다.");
  const [loadingInfo, setLoadingInfo]     = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lookMd, setLookMd] = useState("");

  const toggle = (k) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  // 1) 우선 로컬 데이터에서 상품 찾기(즉시 렌더를 위해)
  const productLocal = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [id]
  );

  // 2) 서버 상세를 가져와서 폴백 대체
  const [product, setProduct] = useState(productLocal || null);

  // 서버 상세 로드 (있으면 교체)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const detail = await ProductsAPI.byId?.(id) ?? await ProductsAPI.detail?.(id);
        if (detail && alive) setProduct(detail);
      } catch {
        // 서버 준비 전/오류 → 로컬 유지
        if (alive) setProduct(productLocal || null);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 옵션/가격/룩 여부 계산
  const images = product?.images ?? productLocal?.images ?? [];
  const isLook = (product?.category ?? productLocal?.category) === "look";
  const lookMdPath = product?.lookMd ?? productLocal?.lookMd ?? "";

  const rawPrice = typeof product?.price === "number" ? product.price : productLocal?.price;
  const hasPrice = typeof rawPrice === "number" && !isLook;
  const formattedPrice = hasPrice ? rawPrice.toLocaleString() : null;

  const sizeOptions = (Array.isArray(product?.sizes) && product.sizes.length)
    ? product.sizes
    : (Array.isArray(productLocal?.sizes) && productLocal.sizes.length ? productLocal.sizes : [1, 2]);

  const colorOptions = (Array.isArray(product?.colors) && product.colors.length)
    ? product.colors
    : (Array.isArray(productLocal?.colors) && productLocal.colors.length ? productLocal.colors : ["white", "black"]);

  // 설명 섹션 로딩: 서버 우선, 실패 시 로컬/기본 문구
  useEffect(() => {
    let alive = true;

    async function fetchTextMaybe(url) {
      try {
        if (!url) return "";
        const res = await fetch(url);
        if (!res.ok) return "";
        return await res.text();
      } catch { return ""; }
    }

    (async () => {
      setLoadingInfo(true);

      // 서버 상세(문서 URL 포함) 시도
      let detail = null;
      try {
        detail = await ProductsAPI.byId?.(id) ?? await ProductsAPI.detail?.(id);
      } catch { /* 서버 준비 전 */ }

      const sizeMdUrl = detail?.sizeGuideMd ?? productLocal?.sizeGuideMd;
      const infoMdUrl = detail?.productInfoMd ?? productLocal?.productInfoMd;

      const sizeTextFallback = productLocal?.sizeGuideText ?? "";
      const infoTextFallback = productLocal?.productInfoText ?? "";

      const [sizeMdText, infoMdText] = await Promise.all([
        sizeMdUrl ? fetchTextMaybe(sizeMdUrl) : "",
        infoMdUrl ? fetchTextMaybe(infoMdUrl) : "",
      ]);

      if (alive) {
        setSizeGuideMd(sizeMdText?.trim() || sizeTextFallback);
        setProductInfoMd(infoMdText?.trim() || infoTextFallback);
        // returnsMd는 시스템 정책 API 제거했고, 기본 문구 유지
        setReturnsMd("교환/환불 안내를 준비 중입니다.");
        setLoadingInfo(false);
      }
    })();

    return () => { alive = false; };
  }, [id, productLocal?.sizeGuideMd, productLocal?.productInfoMd, productLocal?.sizeGuideText, productLocal?.productInfoText]);

  // LOOK면 public의 md 파일(fetch) 로드
  useEffect(() => {
    let alive = true;
    async function loadMd() {
      if (isLook && lookMdPath) {
        try {
          const res = await fetch(lookMdPath);
          const txt = await res.text();
          if (alive) setLookMd(txt);
        } catch {
          if (alive) setLookMd("");
        }
      } else {
        setLookMd("");
      }
    }
    loadMd();
    return () => { alive = false; };
  }, [isLook, lookMdPath]);

  if (!productLocal && !product) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
        <button className="text-red-500 underline" onClick={() => navigate(-1)}>GET OUT</button>
      </main>
    );
  }

  // 옵션 선택 검증
  const validateSelection = () => {
    if (!isLook && (!selectedSize || !selectedColor)) {
      setError("색상과 사이즈를 선택해주세요.");
      return false;
    }
    return true;
  };

  // 현재 선택 상태를 장바구니에 추가
  const addCurrentToCart = () => {
    if (!validateSelection()) return false;
    const base = product || productLocal;
    const item = {
      ...base,
      price: Number(base?.price) || 0,
      selected: { size: selectedSize, color: selectedColor },
    };
    addToCart(item, Math.max(1, qty));
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

  return (
    <>
      {/* 카테고리/탭 */}
      <header>
        {isLook ? (
          <nav aria-label="카테고리" className="flex justify-center w-full xl:w-4/5 mx-auto p-5 bg-white">
            <NavLink
              to="/look"
              className={({ isActive }) =>
                `relative text-4xl xl:text-5xl font-bold -translate-x-1 uppercase px-2 py-1 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-red-500"
                }`
              }
              style={({ isActive }) => (isActive ? { WebkitTextStroke: "1px red" } : {})}
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
                style={({ isActive }) => (isActive ? { WebkitTextStroke: "1px red" } : {})}
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
                onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
                className="group absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 z-20 w-12 h-[16%] min-h-12 flex items-center justify-center"
                aria-label="이전 이미지"
              >
                <TriangleArrow className="h-[145%] text-red-500 scale-y-150 transition-transform" direction="left" />
              </button>
            )}

            <img
              src={images[currentIndex]}
              alt={`${(product?.name ?? productLocal?.name) || "product"} ${currentIndex + 1}`}
              className="w-full h-auto object-cover rounded-2xl"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
                className="group absolute top-1/2 right-0 translate-x-full -translate-y-1/2 z-20 w-12 h-[16%] min-h-12 flex items-center justify-center"
                aria-label="다음 이미지"
              >
                <TriangleArrow className="h-[145%] text-red-500 scale-y-150 transition-transform" direction="right" />
              </button>
            )}
          </div>
        </div>

        {/* 정보 + 옵션 + 구매 + 설명 */}
        <section className="flex flex-col gap-8">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold">
              {isLook ? "NO THINKING AREA" : (product?.name ?? productLocal?.name)}
            </h1>
            {hasPrice && (
              <div className="text-xl font-bold text-black">
                PRICE {formattedPrice} WON
              </div>
            )}
          </div>

          {!isLook && (
            <>
              {/* 사이즈 */}
              <div className="grid gap-6">
                <div role="radiogroup" className="flex flex-wrap gap-1">
                  {sizeOptions.map((s) => {
                    const isSelected = String(selectedSize) === String(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`사이즈 ${s}`}
                        onClick={() => setSelectedSize(s)}
                        className={[
                          "w-9 h-9 rounded-md border-2 flex items-center justify-center font-bold transition-colors select-none text-sm outline-none ring-0",
                          "border-red-500",
                          isSelected ? "bg-red-500 text-white" : "bg-white text-red-600",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                {/* 색상 */}
                <div role="radiogroup" className="flex flex-wrap gap-1">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColor === color;
                    const bgClass =
                      typeof color === "string" && ["white", "black"].includes(color.toLowerCase())
                        ? (color.toLowerCase() === "white" ? "bg-white" : "bg-black")
                        : "";
                    const inlineStyle = bgClass ? undefined : { backgroundColor: color };

                    return (
                      <button
                        key={color}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`색상 ${color}`}
                        onClick={() => setSelectedColor(color)}
                        className={[
                          "w-9 h-9 rounded-md border-2 flex items-center justify-center transition select-none outline-none ring-0",
                          "border-red-500",
                          bgClass,
                        ].join(" ")}
                        style={inlineStyle}
                        title={String(color)}
                      >
                        {isSelected && <span className="w-3 h-3 rounded-full bg-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            </>
          )}

          {!isLook && (
            <div className="flex w-full h-10 items-center gap-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColor}
                aria-disabled={!selectedSize || !selectedColor}
                className="flex-[0_0_80%] h-full bg-red-500 rounded font-bold text-2xl text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY!
              </button>

              <div className="flex-[0_0_20%] h-full flex items-center justify-end gap-2">
                <div className="flex">
                  <button type="button" className="w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
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
                  <button type="button" className="w-8 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                    onClick={() => setQty((q) => q + 1)}>+</button>
                </div>

                <button
                  type="button"
                  onClick={handleAddOnly}
                  disabled={!selectedSize || !selectedColor}
                  aria-disabled={!selectedSize || !selectedColor}
                  aria-label="장바구니에 담기"
                  className="w-7 h-8 border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                >
                  <img src="/mood/bag.png" alt="bag" className="inline-flex items-center justify-center w-4 h-7"/>
                </button>
              </div>
            </div>
          )}

          {/* 설명 */}
          {isLook ? (
            <section className="text-sm leading-7 text-black/90 max-w-none">
              {lookMd
                ? <div className="whitespace-pre-line">{lookMd.trim()}</div>
                : <p className="whitespace-pre-line">{product?.description ?? productLocal?.description ?? "룩 설명을 준비 중입니다."}</p>}
            </section>
          ) : (
            <div>
              <div>
                {[
                  { key: "size",   title: "SIZE GUIDE",      content: sizeGuideMd || "사이즈 안내를 준비 중입니다." },
                  { key: "info",   title: "PRODUCT INFO",    content: productInfoMd || "상품 정보를 준비 중입니다." },
                  { key: "return", title: "RETURN/EXCHANGE", content: returnsMd || "교환/환불 안내를 준비 중입니다." },
                ].map(({ key, title, content }) => (
                  <div key={key}>
                    <button
                      onClick={() => toggle(key)}
                      aria-expanded={open[key]}
                      aria-controls={`sec-${key}`}
                      className="relative w-full flex justify-start font-bold py-2"
                    >
                      <span className="pr-10">{title}</span>
                      <span className={`absolute left-1/2 transform -translate-x-1/2 transition-transform ${open[key] ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {open[key] && (
                      <div id={`sec-${key}`} className="text-sm text-black px-2 pb-2">
                        {loadingInfo ? "로딩 중…" : (content || "")}
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
