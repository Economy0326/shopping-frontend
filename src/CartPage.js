import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

export default function CartPage({ darkMode }) {
  const { cart, removeFromCart, changeQuantity } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="p-4 text-center text-gray-500 min-h-screen bg-white dark:bg-black dark:text-white">
          장바구니가 비어있습니다.
          <button
            onClick={() => navigate("/")}
            className="mt-2 text-sm text-blue-500 underline"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">🛒 장바구니</h1>
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between mb-2">
            <div>
              {item.product.name} x {item.quantity}
            </div>
            <div>
              <button
                onClick={() => changeQuantity(item.product.id, item.quantity - 1)}
                className="border px-2 py-1 text-sm mr-1"
              >-</button>
              <button
                onClick={() => changeQuantity(item.product.id, item.quantity + 1)}
                className="border px-2 py-1 text-sm mr-1"
              >+</button>
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-red-500 text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
