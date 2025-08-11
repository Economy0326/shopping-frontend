import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, cleanCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    cleanCart();
    alert("주문이 완료되었습니다!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 mx-auto">
      <h1 className="text-3xl font-bold mb-4">✅ 결제</h1>
      {cart.map((item) => (
        <div key={item.product.id} className="flex justify-between mb-2">
          <div className="text-2xl">
            {item.product.name} x {item.quantity}
          </div>
          <div className="text-2xl">{item.product.price}</div>
        </div>
      ))}
      <button
        onClick={handleCheckout}
        className="mt-4 w-full bg-black text-white py-2 rounded text-2xl"
      >
        결제하기
      </button>
    </div>
  );
}
