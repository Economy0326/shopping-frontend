// src/pages/App.js
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useCallback, useState } from "react";

import Layout from "../components/Layout";
import LayoutWithImage from "../components/LayoutWithImage";

import Homepage from "./Homepage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import SecretPage from "./SecretPage";
import CategoryPage from "./CategoryPage";
import LookPage from "./LookPage";
import MyOrdersPage from "./MyOrderPage";

// 마이페이지 + Q&A
import MyPageLayout from "./mypage/MyPageLayout";
import QnaTabs from "./qna/QnaTabs";
import AskListPage from "./qna/AskListPage"; 
import AskWritePage from "./qna/AskWritePage";

// 주문 페이지
import { CartProvider } from "../context/CartContext";
import { OrderProvider } from "../context/OrderContext";
import OrderDetailPage from "./OrderDetailPage"; 

// 관리자 페이지
import AdminGuard from "./admin/AdminGuard";
import AdminOrdersPage from "./admin/AdminOrdersPage";

function WithLayout(props) {
  return (
    <Layout {...props}>
      <Outlet />
    </Layout>
  );
}

function WithImageLayout(props) {
  return (
    <LayoutWithImage {...props}>
      <Outlet />
    </LayoutWithImage>
  );
}

export default function App() {
  const initial = localStorage.getItem("username") || "";
  const [username, setUsername] = useState(initial);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initial);

  const updateUsername = useCallback((name) => {
    setUsername(name);
    localStorage.setItem("username", name);
    setIsLoggedIn(!!name);
  }, []);

  const currentUserId = username || "guest";
  const isAdmin = username === "admin"; // 필요 시 로직 교체

  return (
    <OrderProvider>
      {/* 전역 장바구니 컨텍스트 */}
      <CartProvider username={username}>
        <Routes>
          {/* 메인 + 비밀 */}
          <Route
            element={
              <WithLayout
                username={username}
                setUsername={updateUsername}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          >
            <Route index element={<Homepage />} />
            <Route path="secret" element={<SecretPage />} />
          </Route>

          {/* 그 외 나머지 */}
          <Route
            element={
              <WithImageLayout
                username={username}
                setUsername={updateUsername}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
              />
            }
          >
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />

            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />

            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="look" element={<LookPage />} />
            
            <Route
              path="mypage"
              element={
                <MyPageLayout
                  isLoggedIn={isLoggedIn}
                  username={username}
                  onLogout={() => updateUsername("")}
                />
              }
            />

            <Route
              path="qna"
              element={<QnaTabs
                        isLoggedIn={isLoggedIn} 
                        username={username}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                />
              }
            />

            <Route
              path="qna/ask"
              element={
                <AskListPage
                  currentUserId={currentUserId}
                  currentUserName={username}
                  isAdmin={isAdmin}
                />
              }
            />
            <Route
              path="qna/ask/:id"
              element={
                <AskListPage
                  currentUserId={currentUserId}
                  currentUserName={username}
                  isAdmin={isAdmin}
                />
              }
            />
            <Route
              path="qna/ask/write"
              element={
                <AskWritePage
                  isLoggedIn={isLoggedIn}
                  username={username}
                  userId={currentUserId}
                />
              }
            />    

            <Route
              path="admin/orders"
              element={
                <AdminGuard>
                  <AdminOrdersPage />
                </AdminGuard>
              }
            />
          </Route>

          {/* 존재하지 않는 경로 → 홈으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </OrderProvider>
  );
}
