import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { renderStars } from "./utils";

export default function ProductPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = location.state?.product;

  if (!product) {
    return (
      <div className="min-h-screen p-4 text-gray-500 max-w-2xl mx-auto">
        상품 정보를 불러올 수 없습니다.
        <button
          onClick={() => navigate("/")}
          className="block mt-2 text-2xl underline text-blue-500"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-500">
        ← 돌아가기
      </button>
      <div className="border rounded-xl overflow-hidden shadow-sm mt-4 bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="p-4">
          <h2 className="text-3xl font-bold">{product.name}</h2>
          <p className="text-yellow-500 text-2xl mb-1">
            {renderStars(product.rating)} ({product.rating.toFixed(1)}) /{" "}
            {product.reviewCount} 리뷰
          </p>
          <p className="text-gray-500 mb-2">{product.price}</p>
          <p className="text-2xl text-gray-600">
            상품 상세 설명을 여기에 추가하세요.
          </p>
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
  );
}
