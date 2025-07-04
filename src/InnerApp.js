import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { parsePrice, renderStars } from "./utils"; 
import products from "./Product";      
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// InnerApp: 메인 쇼핑몰 UI 컴포넌트
// - 카테고리, 검색, 정렬, 필터, 상품 카드, 로그인/다크모드 UI 렌더링
// - 상위 App에서 전달받은 username, 로그인 상태, 다크모드 상태를 사용
// - 장바구니 추가 및 토스트 알림 처리
function InnerApp({ username, updateUsername, isLoggedIn, setIsLoggedIn, darkMode,setDarkMode}) {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [category, setCategory] = useState("tops");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("default");
  const [priceFilter, setPriceFilter] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  //검색어 포함된 상품만 추림
  let sortedProducts = [...products[category]]
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 필터 있을 경우 필터 값보다 작은 상품들만 출력
  if (priceFilter !== null) {
    sortedProducts = sortedProducts.filter(p => parsePrice(p.price) <= priceFilter);
  }

  if (sortType === "priceAsc") {
    sortedProducts.sort((a,b) => parsePrice(a.price) - parsePrice(b.price));
  }else if( sortType === "priceDesc") {
    sortedProducts.sort((a,b) => parsePrice(b.price)- parsePrice(a.price));
  }
  
  return (
    <div className={darkMode ? "dark" : ""}>
      {/* 다크 모드 */}
      <div className="min-h-screen p-4 bg-white text-black dark:bg-black dark:text-white">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">🛍️ Gun&Sung</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="border rounded px-2 py-1 text-sm"
            >
              {darkMode ? "라이트 모드" : "다크 모드"}
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="border rounded px-2 py-1 text-sm"
            >
              🛒
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  setIsLoggedIn(false);
                  toast.info("로그아웃 되었습니다");
                }else {
                  setShowLoginModal(true);
                }
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {isLoggedIn ? "로그아웃" : "로그인"}
            </button>
          </div>
        </header>

        <div className="p-4 w-full font-sans">

          {/* 상단 바 */}
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-black z-10">
            <div className="flex gap-3 text-2xl">
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
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 정렬 & 필터 UI */}
          <div className="flex items-center gap-2 mb-4">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border border-gray-300 p-1 rounded text-sm bg-white text-black dark:bg-gray-800 dark:text-white"
            >
              <option value = "default">기본 정렬</option>
              <option value = "priceAsc">가격 낮은 순</option>
              <option value = "priceDesc">가격 높은 순</option>
            </select>
            <button
              onClick={() => setPriceFilter(50000)}
              className="border rounded px-2 py-1 text-sm bg-white text-black"
            >
              5만원 이하
            </button>
            <button
              onClick={() => setPriceFilter(null)}
              className="border rounded px-2 py-1 text-sm bg-white text-black"
            >
              필터 해제
            </button>
          </div>

          {/* 카테고리 탭 */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-sm font-medium">
            {["tops", "bottoms", "hats", "accessories"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 rounded-full ${
                  category === cat
                    ? "bg-black text-white shadow"
                    : "bg-gray-200 text-gray-700"
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

          {/* 상품 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedProducts.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl overflow-hidden shadow hover:shadow-lg bg-white transition"
              >
                <div
                  className="w-full h-40 bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 flex flex-col justify-between h-24">
                  {/* 상품 이름 */}
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  {/* 상품 리뷰 + 별점 */}
                  <p className="text-yellow-500 text-xs">
                    {renderStars(p.rating)} {p.rating.toFixed(1)}
                  </p>
                  {/* 상품 가격 + 담기 버튼 */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">{p.price}</p>
                    <button
                      onClick={() => {
                        if (!p.soldOut) {
                          addToCart(p)
                          toast.success(`${p.name} 이(가) 장바구니에 추가되었습니다!`);
                        }
                      }}
                      disabled={p.soldOut}
                      className= {`text-xs border border-black rounded px-2 py-1 transition ${
                        p.soldOut 
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-white text-black dark:bg-gray-800 dark:text-white hover:bg-black hover:text-white"
                      }`}
                    >
                      {p.soldOut ? "품절" : "담기"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 로그인 모달 */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-4 rounded w-72">
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

      {/* 장바구니 담기 시 토스트 알림*/}
      <ToastContainer />
    </div>
  );
}

export default InnerApp;