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
 * optionValues 기반 정규화
 * - optionValues: { size: "M", color: "black" } 형태
 * - 빈 값 제거, 키 안정 정렬(라인키 안정성)
 * - priceDelta: 옵션 조합 추가금(있으면)
 */
function normalizeOptions(options = {}) {
  const raw = options?.optionValues && typeof options.optionValues === "object"
    ? options.optionValues
    : {};

  // key 정렬 + 값 trim + 빈값 제거
  const optionValues = Object.keys(raw)
    .sort()
    .reduce((acc, k) => {
      const v = String(raw[k] ?? "").trim();
      if (v.length > 0) acc[k] = v;
      return acc;
    }, {});

  const priceDelta = options.priceDelta != null ? Number(options.priceDelta) : 0;

  return {
    ...(Object.keys(optionValues).length ? { optionValues } : {}),
    ...(priceDelta ? { priceDelta } : {}),
  };
}

/**
 *  라인키 생성 (productId + optionValues)
 * - 예: "12|color=black&size=M"
 * - optionValues 없으면 productId만
 */
function makeLineKey(productId, options = {}) {
  const o = normalizeOptions(options);
  const ov = o.optionValues || {};
  const keys = Object.keys(ov).sort();

  if (!keys.length) return String(productId);

  const qs = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(ov[k])}`).join("&");
  return `${String(productId)}|${qs}`;
}

// 라인 단가 = 상품 가격 + 옵션 조합 추가금(priceDelta)
const getUnitPrice = (it) =>
  (Number(it?.product?.price) || 0) + (Number(it?.options?.priceDelta) || 0);

export function CartProvider({ children, username }) {
  const storageKey = username ? `cart_${username}` : "cart_guest";
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(load(storageKey));
  }, [storageKey]);

  useEffect(() => {
    save(storageKey, cart);
  }, [storageKey, cart]);

  /**
   * 상품 담기
   * - product: 상품 객체
   * - qty: 수량
   * - options: { optionValues: {size, color, ...}, priceDelta? }
   */
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

  // 라인 삭제(단일): lineKey로 해당 라인 제거
  const removeFromCart = useCallback((lineKey) => {
    setCart((prev) => prev.filter((it) => it.key !== lineKey));
  }, []);

  // 여러 라인 삭제(선택결제 완료 후 선택 항목만 제거)
  const removeItems = useCallback((keys = []) => {
    const set = new Set(keys.map(String));
    setCart((prev) => prev.filter((it) => !set.has(String(it.key))));
  }, []);

  // 수량 변경(최소 1)
  const changeQty = useCallback((lineKey, qty) => {
    const safe = Math.max(1, Number(qty) || 1);
    // linekey: productId|k=v&k=v
    setCart((prev) =>
      prev.map((it) => (it.key === lineKey ? { ...it, qty: safe } : it))
    );
  }, []);

  // 장바구니 비우기(전체결제 완료 후)
  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    // 장바구니 총액: (상품가 + 옵션추가금) × 수량
    () => cart.reduce((sum, it) => sum + (it.qty || 0) * getUnitPrice(it), 0),
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
      makeLineKey,
    }),
    [cart, addToCart, removeFromCart, removeItems, changeQty, clearCart, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
