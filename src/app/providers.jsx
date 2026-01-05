import React from "react";

// 컨텍스트
import { AuthProvider } from "features/auth/context/AuthContext";
import { OrderProvider } from "features/orders/context/OrderContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <OrderProvider>
        {/* CartProvider는 user 정보가 필요해서 routes(AppShell) 안에서 감싸도 되지만,
            기존 동작 그대로 유지하려면 여기서 감싸지 않고 routes 쪽에서 감쌈 */}
        {children}
      </OrderProvider>
    </AuthProvider>
  );
}