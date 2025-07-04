import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

export default function CheckoutPage({ darkMode }) {
  const { cart, cleanCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    cleanCart();
    alert("주문이 완료되었습니다!");
    navigate("/");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">✅ 결제</h1>
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between mb-2">
            <div>
              {item.product.name} x {item.quantity}
            </div>
            <div>{item.product.price}</div>
          </div>
        ))}
        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-black text-white py-2 rounded"
        >
          결제하기
        </button>
      </div>
    </div>
  );
}
