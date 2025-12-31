import { createContext, useContext, useMemo } from "react";
import { OrdersAPI } from "features/orders/api/orders.api";

const OrderContext = createContext(null);
export const useOrders = () => useContext(OrderContext);

export function OrderProvider({ children }) {
  const value = useMemo(
    () => ({
      createOrder: (payload) => OrdersAPI.checkout(payload),
      listMyOrders: (params) => OrdersAPI.list(params),
      getOrder: (id) => OrdersAPI.get(id),
      confirmOrder: (id, note) => OrdersAPI.confirm(id, note),
      cancelOrder: (payload) => OrdersAPI.cancelRequest(payload),
      returnOrder: (payload) => OrdersAPI.returnRequest(payload),
      // track 제거: 주문 상세에 shipping 포함(명세 9)
    }),
    []
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
