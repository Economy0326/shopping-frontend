import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// 안전 파서
function safeParse(json, fallback) {
  try {
    if (json == null || json === "") return fallback;
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// 항상 "배열"로 정규화
function toArray(v) {
  if (Array.isArray(v)) return v;
  // 예전 형태 지원: { items: [...] }
  if (v && typeof v === "object" && Array.isArray(v.items)) return v.items;
  return [];
}

/** 선택 옵션 정규화 */
function normalizeSelectedOptions(product, selectedOptions) {
  const src = selectedOptions || product?.selectedOptions || product?.selected || {};
  const Size  = src.Size  ?? src.size  ?? product?.selectedSize  ?? product?.size  ?? null;
  const Color = src.Color ?? src.color ?? product?.selectedColor ?? product?.color ?? null;
  const out = {};
  if (Size  != null) out.Size  = String(Size);
  if (Color != null) out.Color = String(Color);
  return out;
}

/** 라인키 생성 */
function makeLineKey(product, selectedOptions = {}, sku) {
  if (sku) return String(sku);
  const pid   = String(product?.id ?? "");
  const opts  = normalizeSelectedOptions(product, selectedOptions);
  const size  = opts.Size  ?? "";
  const color = opts.Color ?? "";
  return `${pid}:${size}:${color}`;
}

/** 엔트리의 라인키 */
function lineKeyOfEntry(entry) {
  return entry.sku || makeLineKey(entry.product, entry.selectedOptions);
}

export function CartProvider({ children, username }) {
  const key = (username && String(username).trim()) || "guest";
  const storageKey = `cart_${key}`;

  const [cart, setCart] = useState([]);   // 상태는 항상 "배열"만 유지
  const [loaded, setLoaded] = useState(false);

  // 로드
  useEffect(() => {
    if (username === undefined) return; // 사용자 미정 상태
    const raw    = localStorage.getItem(storageKey);
    const parsed = safeParse(raw, []);
    const arr    = toArray(parsed);
    setCart(arr);
    // 저장 구조가 배열이 아니었다면 덮어써서 복구
    if (!Array.isArray(parsed)) {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    }
    setLoaded(true);
  }, [storageKey, username]);

  // 로그인 시: guest → user 병합 (배열 보장으로 변경)
  useEffect(() => {
    if (!username) return;
    const guestArr = toArray(safeParse(localStorage.getItem("cart_guest"), []));
    if (guestArr.length === 0) return;

    const userArr  = toArray(safeParse(localStorage.getItem(`cart_${username}`), []));
    const merged   = [...userArr];

    guestArr.forEach(g => {
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

  // 저장 (항상 배열로 저장)
  useEffect(() => {
    if (!loaded || username === undefined) return;
    localStorage.setItem(storageKey, JSON.stringify(toArray(cart)));
  }, [cart, loaded, username, storageKey]);

  // 액션들
  const addToCart = useCallback((product, qty = 1, selectedOptions = {}, sku) => {
    const n = Math.max(1, Number(qty) || 1);
    const lineKey = makeLineKey(product, selectedOptions, sku);

    setCart(prev => {
      const list = toArray(prev);
      const idx = list.findIndex(it => lineKeyOfEntry(it) === lineKey);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity ?? 1) + n };
        return next;
      }
      const normalizedOpts = normalizeSelectedOptions(product, selectedOptions);
      return [
        ...list,
        {
          product,
          quantity: n,
          selectedOptions: normalizedOpts,
          sku: sku || product?.sku,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((lineKeyOrEntry) => {
    setCart(prev => {
      const list = toArray(prev);
      const key =
        typeof lineKeyOrEntry === "string"
          ? lineKeyOrEntry
          : lineKeyOfEntry(lineKeyOrEntry);
      return list.filter(it => lineKeyOfEntry(it) !== key);
    });
  }, []);

  const changeQuantity = useCallback((lineKeyOrEntry, qty) => {
    const n = Math.max(1, Number(qty) || 1);
    setCart(prev => {
      const list = toArray(prev);
      const key =
        typeof lineKeyOrEntry === "string"
          ? lineKeyOrEntry
          : lineKeyOfEntry(lineKeyOrEntry);
      return list.map(it =>
        lineKeyOfEntry(it) === key ? { ...it, quantity: n } : it
      );
    });
  }, []);

  const cleanCart = useCallback(() => {
    setCart([]);
    localStorage.setItem(storageKey, JSON.stringify([]));
  }, [storageKey]);

  // 파생값 (배열 전제)
  const count = useMemo(
    () => toArray(cart).reduce((s, it) => s + (it.quantity || 1), 0),
    [cart]
  );
  const total = useMemo(
    () => toArray(cart).reduce(
      (sum, it) => sum + (Number(it?.product?.price) || 0) * (it?.quantity || 1),
      0
    ),
    [cart]
  );

  const value = useMemo(() => ({
    cart: toArray(cart),
    addToCart,
    removeFromCart,
    changeQuantity,
    cleanCart,
    count,
    total,
  }), [cart, addToCart, removeFromCart, changeQuantity, cleanCart, count, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
