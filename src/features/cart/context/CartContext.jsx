import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 *  옵션 표준화(운영버전)
 * - 명세: optionGroups -> 주문은 optionIds(= option.id) 기반
 * - Cart는 프론트 로컬이라서 optionIds를 그대로 저장해두는 게 제일 안정적
 *
 * options shape (권장):
 * {
 *   optionIds: number[]   // 예: [sizeOptionId, colorOptionId]
 * }
 */
function normalizeOptions(options = {}) {
  // 과거 호환(혹시 이전 코드가 size/color를 넘기는 경우)
  const optionIds =
    Array.isArray(options.optionIds) ? options.optionIds.filter(Boolean) : [];

  // (레거시) sizeId/colorId로 들어오면 optionIds로 합쳐줌
  const sizeId = options.sizeId ?? options.sizeOptionId ?? null;
  const colorId = options.colorId ?? options.colorOptionId ?? null;

  const merged = [
    ...optionIds,
    ...(sizeId ? [sizeId] : []),
    ...(colorId ? [colorId] : []),
  ].filter(Boolean);

  // 중복 제거 + 안정 정렬(키 안정성)
  const uniq = Array.from(new Set(merged)).sort((a, b) => Number(a) - Number(b));

  const optionLabels = Array.isArray(options.optionLabels)
    ? options.optionLabels.map(String).filter((v) => v.trim().length > 0)
    : [];

  const variantId =
    options.variantId != null ? Number(options.variantId) : null;
  
    return {
    ...(uniq.length ? { optionIds: uniq } : {}),
    ...(optionLabels.length ? { optionLabels } : {}),
    ...(variantId ? { variantId } : {}),
  };
}

function makeLineKey(productId, options = {}) {
  const o = normalizeOptions(options);
  if (o.variantId) return `${String(productId)}:v:${String(o.variantId)}`;
  
  const ids = Array.isArray(o.optionIds) ? o.optionIds : [];
  // productId:101:201 같은 형태 (옵션 없으면 productId만)
  return ids.length ? `${String(productId)}:${ids.join(":")}` : String(productId);
}

/**
 * CartItem shape (FRONT LOCAL)
 * {
 *   key: string,                // productId:optionIds...
 *   product: { id, name, price, images... },
 *   qty: number,
 *   options: { optionIds?: number[] }
 * }
 */
export function CartProvider({ children, username }) {
  const storageKey = username ? `cart_${username}` : "cart_guest";
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(load(storageKey));
  }, [storageKey]);

  useEffect(() => {
    save(storageKey, cart);
  }, [storageKey, cart]);

  // product는 "상품 객체", options는 { optionIds: [] }
  const addToCart = useCallback((product, qty = 1, options = {}) => {
    const productId = product?.id;
    if (productId == null) return;

    const safeQty = Math.max(1, Number(qty) || 1);
    const normOpt = normalizeOptions(options);
    const lineKey = makeLineKey(productId, normOpt);

    setCart((prev) => {
      const found = prev.find((it) => it.key === lineKey);
      if (found) {
        return prev.map((it) =>
          it.key === lineKey ? { ...it, qty: it.qty + safeQty } : it
        );
      }
      return [
        ...prev,
        { key: lineKey, product, qty: safeQty, options: normOpt },
      ];
    });
  }, []);

  const removeFromCart = useCallback((lineKey) => {
    setCart((prev) => prev.filter((it) => it.key !== lineKey));
  }, []);

  const removeItems = useCallback((keys = []) => {
    const set = new Set(keys.map(String));
    setCart((prev) => prev.filter((it) => !set.has(String(it.key))));
  }, []);

  const changeQty = useCallback((lineKey, qty) => {
    const safe = Math.max(1, Number(qty) || 1);
    setCart((prev) =>
      prev.map((it) => (it.key === lineKey ? { ...it, qty: safe } : it))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + (it.qty || 0) * (it.product?.price || 0), 0),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((s, it) => s + (it.qty || 0), 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      removeItems,
      changeQty,
      clearCart,
      total,
      count,
      makeLineKey, // (Checkout에서 key 계산 필요하면 사용 가능)
    }),
    [cart, addToCart, removeFromCart, removeItems, changeQty, clearCart, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
