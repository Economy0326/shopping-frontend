import React from "react";
import { BrowserRouter } from "react-router-dom";

import AppProviders from "app/providers";
import AppRoutes from "app/routes";

import { useAuth } from "features/auth/context/AuthContext";
import { CartProvider } from "features/cart/context/CartContext";

function AppShell() {
  const { user, ready, setUser } = useAuth();

  if (!ready) return null;

  const username = user?.username || "";
  const isLoggedIn = !!user;
  const currentUserId = user?.id ? String(user.id) : "guest";
  const isAdmin = user?.role === "admin";

  const setUsername = (name) =>
    setUser(name ? { ...(user ?? {}), username: name } : null);

  // 장바구니 저장 키: 로그인 시 email, 아니면 guest
  const cartStorageKey = user?.email ?? "guest";

  return (
    <CartProvider username={cartStorageKey}>
      <AppRoutes
        username={username}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        setUsername={setUsername}
        setUser={setUser}
      />
    </CartProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </BrowserRouter>
  );
}
