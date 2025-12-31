import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// 레이아웃 (기존 경로 유지)
import Layout from "ui/layout/Layout";
import LayoutWithImage from "ui/layout/LayoutWithImage";

// 페이지들 (기존 경로 유지)
import TermsPage from "features/legal/pages/TermsPage";
import PrivacyPage from "features/legal/pages/PrivacyPage";

import Homepage from "features/home/pages/HomePage";
import ProductPage from "features/catalog/pages/ProductPage";
import CartPage from "features/cart/pages/CartPage";
import CheckoutPage from "features/cart/pages/CheckoutPage";
import SecretPage from "features/home/pages/SecretPage";
import CategoryPage from "features/catalog/pages/CategoryPage";
import LookPage from "features/catalog/pages/LookPage";
import MyOrdersPage from "features/orders/pages/MyorderPage";
import OrderDetailPage from "features/orders/pages/OrderDetailPage";

// 마이페이지
import MyPageLayout from "features/mypage/pages/MypageLayout";
import PasswordChangePage from "features/mypage/pages/PasswordChangePage";

// Q&A
import QnaTabs from "features/qna/pages/QnaTabs";
import AskListPage from "features/qna/pages/AskListPage";
import AskWritePage from "features/qna/pages/AskWritePage";
import NoticeListPage from "features/qna/pages/NoticeListPage";
import NoticeDetailPage from "features/qna/pages/NoticeDetailPage";

// 회원가입 / 비번 재설정
import SignupPage from "features/auth/pages/SignupPage";
import PasswordResetRequestPage from "features/auth/pages/PasswordResetRequestPage";

// 관리자
import AdminGuard from "features/admin/routes/AdminGuard";
import AdminOrdersPage from "features/admin/pages/AdminOrdersPage";
import AdminProductNew from "features/admin/pages/AdminProductNew";

// 환불
import AdminReturnsPage from "features/returns/pages/AdminReturnsPage";

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

/**
 * 원본 AppShell 안에 있던 Routes 덩어리만 "함수"로 분리
 * - user/ready/setUser 등은 호출한 쪽(AppShell)에서 내려줌
 */
export default function AppRoutes({
  username,
  isLoggedIn,
  currentUserId,
  isAdmin,
  setUsername,
  setUser,
}) {
  return (
    <Routes>
      {/* 메인(홈/시크릿) : 기본 레이아웃 */}
      <Route
        element={
          <WithLayout
            username={username}
            setUsername={setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={(v) => setUser(v ? { username } : null)}
          />
        }
      >
        <Route index element={<Homepage />} />
        <Route path="secret" element={<SecretPage />} />
      </Route>

      {/* 나머지 페이지 : 이미지 포함 레이아웃 */}
      <Route
        element={
          <WithImageLayout
            username={username}
            setUsername={setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={(v) => setUser(v ? { username } : null)}
          />
        }
      >
        {/* 상품/장바구니/결제/주문 */}
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="order/:id" element={<OrderDetailPage />} />

        {/* 카테고리/룩북 */}
        <Route path="category/:categoryName" element={<CategoryPage />} />
        <Route path="look" element={<LookPage />} />

        {/* 이용약관 */}
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />

        {/* 회원가입 */}
        <Route path="auth/signup" element={<SignupPage />} />

        {/* 마이페이지 */}
        <Route
          path="mypage"
          element={
            <MyPageLayout
              isLoggedIn={isLoggedIn}
              username={username}
              onLogout={() => setUser(null)}
            />
          }
        />
        {/* 비밀번호 변경 */}
        <Route
          path="mypage/password"
          element={isLoggedIn ? <PasswordChangePage /> : <Navigate to="/" replace />}
        />

        {/* 비번 재설정 */}
        <Route path="auth/password-reset/confirm" element={<PasswordChangePage />} />
        <Route path="auth/password-reset" element={<PasswordResetRequestPage />} />

        {/* QnA */}
        <Route
          path="qna"
          element={
            <QnaTabs
              isLoggedIn={isLoggedIn}
              username={username}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          }
        />
        <Route
          path="qna/ask"
          element={<AskListPage currentUserId={currentUserId} currentUserName={username} isAdmin={isAdmin} />}
        />
        <Route
          path="qna/ask/:id"
          element={<AskListPage currentUserId={currentUserId} currentUserName={username} isAdmin={isAdmin} />}
        />
        <Route
          path="qna/ask/write"
          element={<AskWritePage isLoggedIn={isLoggedIn} username={username} userId={currentUserId} />}
        />

        {/* 공지 */}
        <Route path="qna/notice" element={<NoticeListPage />} />
        <Route path="qna/notice/:id" element={<NoticeDetailPage />} />

        {/* 관리자 */}
        <Route
          path="admin/orders"
          element={
            <AdminGuard>
              <AdminOrdersPage />
            </AdminGuard>
          }
        />
        <Route
          path="admin/products/new"
          element={
            <AdminGuard>
              <AdminProductNew />
            </AdminGuard>
          }
        />
        <Route
          path="admin/returns"
          element={
            <AdminGuard>
              <AdminReturnsPage />
            </AdminGuard>
          }
        />
      </Route>

      {/* 존재하지 않는 경로 → 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}