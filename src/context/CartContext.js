// src/context/CartContext.js
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

function safeParse(json, fallback) {
  try { return JSON.parse(json); } catch { return fallback; }
}

/** 선택 옵션 정규화: {Size, Color} 대문자 키로 맞춤 (여러 입력 케이스 허용) */
function normalizeSelectedOptions(product, selectedOptions) {
  const src = selectedOptions || product?.selectedOptions || product?.selected || {};
  const Size  = src.Size  ?? src.size  ?? product?.selectedSize  ?? product?.size  ?? null;
  const Color = src.Color ?? src.color ?? product?.selectedColor ?? product?.color ?? null;
  const out = {};
  if (Size  != null) out.Size  = String(Size);
  if (Color != null) out.Color = String(Color);
  return out;
}

/** 라인키 생성: sku > product.id + Size + Color */
function makeLineKey(product, selectedOptions = {}, sku) {
  if (sku) return String(sku);
  const pid   = String(product?.id ?? "");
  const opts  = normalizeSelectedOptions(product, selectedOptions);
  const size  = opts.Size  ?? "";
  const color = opts.Color ?? "";
  return `${pid}:${size}:${color}`;
}

/** 기존 장바구니 엔트리에서 lineKey 뽑기 (마이그레이션/머지용) */
function lineKeyOfEntry(entry) {
  return entry.sku || makeLineKey(entry.product, entry.selectedOptions);
}

export function CartProvider({ children, username }) {
  const [cart, setCart] = useState([]);
  const key = username || "guest";
  const storageKey = `cart_${key}`;
  const [loaded, setLoaded] = useState(false);

  // 로드
  useEffect(() => {
    if (username === undefined) return; // 아직 사용자정보 미정
    const stored = safeParse(localStorage.getItem(storageKey), []);
    setCart(stored);
    setLoaded(true);
  }, [username]); // username 바뀌면 해당 사용자 장바구니 로드

  // 로그인 시 게스트 → 사용자 병합 (라인키 기준으로 수량 합치기)
  useEffect(() => {
    if (!username) return;
    const guest = safeParse(localStorage.getItem("cart_guest"), []);
    if (guest.length === 0) return;

    const userCart = safeParse(localStorage.getItem(`cart_${username}`), []);
    const merged = [...userCart];

    guest.forEach(g => {
      const gKey = lineKeyOfEntry(g);
      const i = merged.findIndex(u => lineKeyOfEntry(u) === gKey);
      if (i >= 0) {
        merged[i] = { ...merged[i], quantity: (merged[i].quantity ?? 1) + (g.quantity ?? 1) };
      } else {
        merged.push(g);
      }
    });

    setCart(merged);
    localStorage.removeItem("cart_guest");
  }, [username]);

  // 저장
  useEffect(() => {
    if (!loaded || username === undefined) return;
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, loaded, username, storageKey]);

  /**
   * 담기: 같은 옵션(SKU)면 수량 합치고, 다르면 새 줄 추가
   * - product: 상품 객체
   * - qty: 담을 수량(기본 1)
   * - selectedOptions: { Size, Color } 또는 { size, color } 등
   * - sku: 옵션별 고유 SKU(있으면 최우선)
   */
  const addToCart = useCallback((product, qty = 1, selectedOptions = {}, sku) => {
    const n = Math.max(1, Number(qty) || 1);
    const lineKey = makeLineKey(product, selectedOptions, sku);

    setCart(prev => {
      const idx = prev.findIndex(it => lineKeyOfEntry(it) === lineKey);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity ?? 1) + n };
        return next;
      }
      const normalizedOpts = normalizeSelectedOptions(product, selectedOptions);
      return [
        ...prev,
        {
          product,
          quantity: n,
          selectedOptions: normalizedOpts,
          sku: sku || product.sku, // 있으면 보관
        },
      ];
    });
  }, []);

  /**
   * 삭제: lineKey(또는 sku)로 특정 라인만 삭제
   * - 인자로 lineKey 문자열 or cart 엔트리 그대로 전달해도 됨
   */
  const removeFromCart = useCallback((lineKeyOrEntry) => {
    setCart(prev => {
      const key =
        typeof lineKeyOrEntry === "string"
          ? lineKeyOrEntry
          : lineKeyOfEntry(lineKeyOrEntry);
      return prev.filter(it => lineKeyOfEntry(it) !== key);
    });
  }, []);

  /**
   * 수량 변경: lineKey(또는 sku) 기준
   * - 기존처럼 productId만 넘기면 같은 상품의 다른 옵션까지 엮이는 문제가 생김
   */
  const changeQuantity = useCallback((lineKeyOrEntry, qty) => {
    const n = Math.max(1, Number(qty) || 1);
    setCart(prev => {
      const key =
        typeof lineKeyOrEntry === "string"
          ? lineKeyOrEntry
          : lineKeyOfEntry(lineKeyOrEntry);
      return prev.map(it =>
        lineKeyOfEntry(it) === key ? { ...it, quantity: n } : it
      );
    });
  }, []);

  const cleanCart = useCallback(() => {
    setCart([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  }, [storageKey]);

  const count = useMemo(() => cart.reduce((s, it) => s + (it.quantity || 1), 0), [cart]);
  const total = useMemo(
    () => cart.reduce((sum, it) => sum + (Number(it?.product?.price) || 0) * (it?.quantity || 1), 0),
    [cart]
  );

  const value = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,     // now expects lineKey or entry
    changeQuantity,     // now expects lineKey or entry
    cleanCart,
    count,
    total,
  }), [cart, addToCart, removeFromCart, changeQuantity, cleanCart, count, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
