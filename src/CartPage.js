import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

export default function CartPage() {
  const { cart, removeFromCart, changeQuantity } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen text-2xl p-4 text-center text-gray-500 bg-white">
        장바구니가 비어있습니다.
        <button
          onClick={() => navigate("/")}
          className="mt-2 text-2xl text-blue-500 underline"
        >
          쇼핑 계속하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 mx-auto">
      <h1 className="text-3xl font-bold mb-4">🛒 장바구니</h1>

      {cart.map((item) => (
        <div key={item.product.id} className="flex items-center justify-between mb-3 border-b pb-2">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1 ml-2">
            <div className="text-2xl font-semibold">{item.product.name}</div>
            <div className="text-xl text-gray-500">x {item.quantity}</div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() =>
                changeQuantity(item.product.id, item.quantity - 1)
              }
              className="border px-3 py-2 text-2xl mr-1"
            >
              -
            </button>
            <button
              onClick={() =>
                changeQuantity(item.product.id, item.quantity + 1)
              }
              className="border px-3 py-2 text-2xl mr-1"
            >
              +
            </button>
            <button
              onClick={() => removeFromCart(item.product.id)}
              className="text-red-500 text-2xl"
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate("/checkout")}
        className="mt-4 w-full bg-black text-white py-2 rounded text-2xl"
      >
        결제하기
      </button>
    </div>
  );
}
