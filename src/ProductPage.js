import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { renderStars } from "./utils";

export default function ProductPage({ darkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = location.state?.product;

  if (!product) {
    return (
      <div className={darkMode ? "dark min-h-screen" : "min-h-screen"}>
        <div className="p-4 text-gray-500 dark:text-gray-400">
          상품 정보를 불러올 수 없습니다.
          <button
            onClick={() => navigate("/")}
            className="block mt-2 text-sm underline text-blue-500 dark:text-blue-300"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-500">← 돌아가기</button>
        <div className="border rounded-xl overflow-hidden shadow-sm mt-4 bg-white dark:bg-gray-800">
          <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
          <div className="p-4">
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-yellow-500 text-sm mb-1">
              {renderStars(product.rating)} ({product.rating.toFixed(1)}) / {product.reviewCount} 리뷰
            </p>
            <p className="text-gray-500 mb-2">{product.price}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">상품 상세 설명을 여기에 추가하세요.</p>
            <button
              onClick={() => {
                addToCart(product);
                navigate("/cart");
              }}
              className="mt-4 w-full bg-black text-white py-2 rounded"
            >
              장바구니 담기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}