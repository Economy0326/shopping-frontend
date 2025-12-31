import React, { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";

import AppProviders from "app/providers";
import AppRoutes from "app/routes";

import { useAuth } from "features/auth/context/AuthContext";
import { CartProvider } from "features/cart/context/CartContext";

function AppShell() {
  const navigate = useNavigate();

  const { user, ready, setUser, authRequired, setAuthRequired } = useAuth();

  // authRequired면 로그인 페이지로 보내기
  useEffect(() => {
    if (!ready) return;
    if (authRequired) {
      setAuthRequired(false); // 무한루프 방지
      navigate("/auth/login", { replace: true }); // 현재 히스토리 항목을 로그인 페이지로 덮어씀
    }
  }, [authRequired, ready, navigate, setAuthRequired]);

  if (!ready) return null;

  const username = user?.username || "";
  const isLoggedIn = !!user; // !!은 boolean으로 바꿔줌
  const currentUserId = username || "guest";
  const isAdmin = user?.role === "admin" || username === "admin";

  // 기존 user 정보를 유지한 채 username만 변경
  const setUsername = (name) =>
    setUser(name ? { ...(user ?? {}), username: name } : null);

  return (
    <CartProvider username={user?.username}>
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
