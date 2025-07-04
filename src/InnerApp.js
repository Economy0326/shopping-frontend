import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { parsePrice, renderStars } from "./utils";
import products from "./Product";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function InnerApp({ username, updateUsername, isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [category, setCategory] = useState("tops");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("default");
  const [priceFilter, setPriceFilter] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  let sortedProducts = [...products[category]].filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //필터
  if (priceFilter !== null) {
    sortedProducts = sortedProducts.filter(
      (p) => parsePrice(p.price) <= priceFilter
    );
  }

  //기본 정렬
  if (sortType === "priceAsc") {
    sortedProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortType === "priceDesc") {
    sortedProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }

  return (
    <div>
      <div className="min-h-screen p-10 bg-white text-black">

        {/* 제목 */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">🛍️ Gun&Sung</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/cart")}
              className="border rounded px-2 py-1 text-2xl"
            >
              🛒
            </button>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setIsLoggedIn(false);
                  toast.info("로그아웃 되었습니다");
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="border rounded px-2 py-1 text-2xl"
            >
              {isLoggedIn ? "로그아웃" : "로그인"}
            </button>
          </div>
        </header>

        {/* 🤍 + 🛒 */}
        <div className="p-4 w-full font-sans">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
            <div className="flex gap-3 text-3xl">
              <span>🤍</span>
              <span
                className="cursor-pointer relative"
                onClick={() => navigate("/cart")}
              >
                🛒
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 검색창 */}
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 정렬, 필터 */}
          <div className="flex items-center gap-2 mb-4">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border border-gray-300 p-1 rounded text-2xl bg-white text-black"
            >
              <option value="default">기본 정렬</option>
              <option value="priceAsc">가격 낮은 순</option>
              <option value="priceDesc">가격 높은 순</option>
            </select>
            <button
              onClick={() => setPriceFilter(50000)}
              className="border rounded px-2 py-1 text-2xl bg-white text-black"
            >
              5만원 이하
            </button>
            <button
              onClick={() => setPriceFilter(null)}
              className="border rounded px-2 py-1 text-2xl bg-white text-black"
            >
              필터 해제
            </button>
          </div>

          {/* 카테고리 */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-2xl font-medium">
            {["tops", "bottoms", "hats", "accessories"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 rounded-full ${
                  category === cat
                    ? "bg-black text-white shadow"
                    : "bg-gray-200 text-gray-1000"
                }`}
              >
                {cat === "tops"
                  ? "상의"
                  : cat === "bottoms"
                  ? "하의"
                  : cat === "hats"
                  ? "모자"
                  : "악세사리"}
              </button>
            ))}
          </div>
          
          {/* 상품카드 */}
          <div className="w-full px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
              {sortedProducts.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-xl overflow-hidden shadow hover:shadow-lg bg-white transition"
                >
                  <div
                    className="w-full aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                    onClick={() =>
                      navigate(`/product/${p.id}`, { state: { product: p } })
                    }
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 flex flex-col justify-between min-h-[6rem]">
                    <p className="text-3xl font-semibold truncate">{p.name}</p>
                    <p className="text-yellow-500 text-2xl">
                      {renderStars(p.rating)} {p.rating.toFixed(1)}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-2xl text-gray-500">{p.price}</p>
                      <button
                        onClick={() => {
                          if (!p.soldOut) {
                            addToCart(p);
                            toast.success(
                              `${p.name} 이(가) 장바구니에 추가되었습니다!`
                            );
                          }
                        }}
                        disabled={p.soldOut}
                        className={`text-2xl border border-black rounded px-2 py-1 transition ${
                          p.soldOut
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {p.soldOut ? "품절" : "담기"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 로그인모달 */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-lg font-bold mb-2">로그인</h2>
                <input
                  type="text"
                  placeholder="아이디"
                  className="border p-2 rounded mb-2 w-full text-sm"
                  value={username}
                  onChange={(e) => updateUsername(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (username.trim()) {
                      setIsLoggedIn(true);
                      setShowLoginModal(false);
                      toast.success(`환영합니다, ${username}님!`);
                    }
                  }}
                  className="w-full bg-black text-white rounded py-2 mb-1"
                >
                  로그인
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full text-sm text-gray-500"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default InnerApp;
