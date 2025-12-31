import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const CartContext = createContext(null);
// useCart -> value를 꺼내 쓰는 훅
export const useCart = () => useContext(CartContext);

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

// 로컬스토리지에 장바구니 저장
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// value를 전달하는 컴포넌트
export function CartProvider({ children, username }) {
  const key = username ? `cart_${username}` : "cart_guest";
  const [cart, setCart] = useState([]);

  // load
  useEffect(() => {
    setCart(load(key));
  }, [key]);

  // save
  useEffect(() => {
    save(key, cart);
  }, [key, cart]);

  const addToCart = useCallback((product, qty = 1, options = {}) => {
    // prev -> 이전 상태 기반 업데이트
    setCart((prev) => {
      // id -> 같은 상품이라도 옵션 다르면 다른 줄 취급
      const id = `${product.id}:${options.Size || ""}:${options.Color || ""}`;
      // found -> 기존에 같은 상품+옵션이 있는지 확인
      const found = prev.find((it) => it.key === id);
      if (found) {
        return prev.map((it) =>
          it.key === id
            ? { ...it, qty: it.qty + qty }
            : it
        );
      }
      return [
        ...prev,
        { key: id, product, qty, options },
      ];
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((it) => it.key !== key));
  }, []);

  const changeQty = useCallback((key, qty) => {
    setCart((prev) =>
      prev.map((it) =>
        it.key === key ? { ...it, qty: Math.max(1, qty) } : it
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, it) => sum + it.qty * (it.product.price || 0),
        0
      ),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((s, it) => s + it.qty, 0),
    [cart]
  );

  // 공유 데이터 패키지 (UseMemo로 감싸서 불필요한 리렌더링 방지)
  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      changeQty,
      clearCart,
      total,
      count,
    }),
    [cart, addToCart, removeFromCart, changeQty, clearCart, total, count]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}