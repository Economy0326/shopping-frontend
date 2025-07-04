import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children,username }) {
  const [cart, setCart] = useState([]);

  // 장바구니 불러오기
  useEffect(() => {
    if (username === undefined) return; // username 초기 undefined일 때 skip
    const key = username || "guest";
    const stored = localStorage.getItem(`cart_${key}`);
    setCart(stored ? JSON.parse(stored) : []);
  }, [username]);

  // 장바구니 저장
  useEffect(() => {
    if (username === undefined) return; 
    const key = username || "guest";
    localStorage.setItem(`cart_${key}`, JSON.stringify(cart));
  }, [cart, username]);

  // 로그인 시 guest 장바구니 병합
  useEffect(() => {
    if (username) {
      const guestCart = JSON.parse(localStorage.getItem("cart_guest") || "[]");
      const userCart = JSON.parse(localStorage.getItem(`cart_${username}`) || "[]");

      // id 중복 시 수량 합치기
      const merged = [...userCart];
      guestCart.forEach((gItem) => {
        const existing = merged.find((uItem) => uItem.product.id === gItem.product.id);
        if (existing) {
          existing.quantity += gItem.quantity;
        } else {
          merged.push(gItem);
        }
      });

      setCart(merged);
      localStorage.removeItem("cart_guest");
    }
  }, [username]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const changeQuantity = (productId, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: qty > 0 ? qty : 1 }
          : item
      )
    );
  };

  const cleanCart = () => {
    setCart([]);
    const key = username || "guest";
    localStorage.setItem(`cart_${key}`, JSON.stringify([]));
  };

  return (
    <CartContext.Provider 
      value={{ cart, addToCart, removeFromCart, changeQuantity, cleanCart }}
    >
      {children}
    </CartContext.Provider>
  );
}