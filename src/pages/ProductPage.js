// src/pages/ProductPage.js
import { useMemo, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import products from "../data/Product";
import { useCart } from "../context/CartContext";

function TriangleArrow({ className = "w-full h-full text-red-500", direction = "right" }) {
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

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState({
    size: false,
    info: false,
    return: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const toggle = (sectionKey) =>
    setOpen((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));

  const categories = ["all", "outer", "top", "bottom", "acc", "for-artist"];

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [id]
  );

  if (!product) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
        <button className="text-red-500 underline" onClick={() => navigate(-1)}>돌아가기</button>
      </main>
    );
  }

  const images = product.images;

  const sizeOptions =
    Array.isArray(product?.sizes) && product.sizes.length ? product.sizes : [1, 2];
  const colorOptions =
    Array.isArray(product?.colors) && product.colors.length ? product.colors : ["white", "black"];

  const isLook = product.category === "look";
  const hasPrice = typeof product.price === "number" && !isLook;
  const formattedPrice = hasPrice ? product.price.toLocaleString() : null;

  const handleAdd = () => {
    setError("");
    if (!isLook && (!selectedSize || !selectedColor)) {
      setError("색상과 사이즈를 선택해주세요.");
      return;
    }
    const item = {
      ...product,
      price: Number(product.price) || 0,
      selected: { size: selectedSize, color: selectedColor },
    };
    addToCart(item, Math.max(1, qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      {/* 카테고리 */}
      <header>
        <nav
          aria-label="카테고리"
          className="flex justify-between gap-2 xl:gap-4 w-full xl:w-4/5 mx-auto p-5 bg-white"
        >
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
      </header>

      {/* 상세 페이지 내용 */}
      <main className="max-w-screen-2xl mx-auto p-6 grid gap-12 lg:grid-cols-2">
        {/* 이미지 */}
        <div className="lg:sticky lg:top-6 justify-self-center">
          <div 
            className="
              relative 
              w-[520px] sm:w-[520px] md:w-[520px] lg:w-[520px]
              mx-auto lg:mx-0
            "
          >
            {/* 왼쪽 삼각형 버튼 */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
                className="group absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 z-20
                          w-12 sm:w-12 md:w-12 lg:w-16            
                          h-[16%] md:h-[14%]                       
                          min-h-12 md:min-h-14                      
                          flex items-center justify-center focus:outline-none"
                aria-label="이전 이미지"
              >
                <TriangleArrow
                  className="h-[95%] md:h-[95%] lg:h-[145%] text-red-500
                            scale-y-150 transition-transform"
                  direction="left"
                />
              </button>
            )}

            {/* 현재 이미지 */}
            <img
              src={product.images[currentIndex]}
              alt={`${product.name} ${currentIndex + 1}`}
              className="w-full h-auto object-cover"
            />

            {/* 오른쪽 삼각형 버튼 */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
                className="group absolute top-1/2 right-0 translate-x-full -translate-y-1/2 z-20
                          w-12 sm:w-12 md:w-12 lg:w-16            
                          h-[16%] md:h-[14%]                     
                          min-h-12 md:min-h-14
                          flex items-center justify-center focus:outline-none"
                aria-label="다음 이미지"
              >
                <TriangleArrow
                  className="h-[95%] md:h-[95%] lg:h-[145%] text-red-500
                            scale-y-150 transition-transform"
                  direction="right"
                />
              </button>
            )}
          </div>
        </div>


        {/* 정보 + 옵션 + 구매 + 설명 */}
        <section className="flex flex-col gap-8">
          {/* 정보 */}
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            {hasPrice && (
              <div className="text-xl font-bold text-black">
                PRICE {formattedPrice} WON
              </div>
            )}
          </div>

          {/* 옵션 (사이즈 → 색상 순서) */}
          {!isLook && (
            <>
              <div className="grid gap-6">
                {/* 사이즈 */}
                <div role="radiogroup" className="flex flex-wrap">
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
                          "w-9 h-9 rounded-md border-2 flex items-center justify-center font-bold transition-colors select-none text-sm outline-none ring-0 [appearance:none]",
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
                <div role="radiogroup" className="flex flex-wrap">
                  {colorOptions.map((color) => {
                    const isSelected = selectedColor === color;
                    const bgClass =
                      typeof color === "string" && ["white", "black"].includes(color.toLowerCase())
                        ? color.toLowerCase() === "white"
                          ? "bg-white"
                          : "bg-black"
                        : "";
                    const inlineStyle = bgClass === "" ? { backgroundColor: color } : undefined;

                    return (
                      <button
                        key={color}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`색상 ${color}`}
                        onClick={() => setSelectedColor(color)}
                        className={[
                          "w-9 h-9 rounded-md border-2 flex items-center justify-center transition select-none outline-none ring-0 [appearance:none]",
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

          {/* 구매 섹션 */}
          {!isLook && (
            <div className="flex w-full h-10 items-center gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedSize || !selectedColor}
                aria-disabled={!selectedSize || !selectedColor}
                className="flex-[0_0_80%] h-full bg-red-500 rounded font-bold text-2xl text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY!
              </button>

              {/* 수량 조절 */}
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

                {/* 장바구니 버튼 */}
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="border-4 border-red-500 text-red-500 font-bold rounded hover:bg-gray-50"
                >
                  @
                </button>
              </div>
            </div>
          )}

          {/* 상품 설명 */}
          <div>
            <div> 
              {[
                { key: "size", title: "SIZE GUIDE", content: "사이즈 안내 내용" },
                { key: "info", title: "PRODUCT INFO", content: "상품 정보 내용" },
                { key: "return", title: "RETURN/EXCHANGE", content: "교환/환불 안내" },
              ].map(({ key, title, content }) => (
                <div key={key} >
                  <button
                    onClick={() => toggle(key)}
                    aria-expanded={open[key]}
                    aria-controls={`sec-${key}`}
                    className="relative w-full flex justify-start font-bold py-2 outline-none ring-0 [appearance:none]"
                  >
                    {/* 제목 */}
                    <span className="pr-10">{title}</span>

                    {/* 화살표  */}
                    <span
                      className={`absolute left-1/2 transform -translate-x-1/2 transition-transform ${
                        open[key] ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* 내용 */}
                  {open[key] && (
                    <div id={`sec-${key}`} className="text-sm text-black px-2 pb-2">
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
