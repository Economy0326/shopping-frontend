// src/pages/App.js
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "../components/Layout";
import LayoutWithImage from "../components/LayoutWithImage";

import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";

import Homepage from "./Homepage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import SecretPage from "./SecretPage";
import CategoryPage from "./CategoryPage";
import LookPage from "./LookPage";
import MyOrdersPage from "./MyOrderPage";
import OrderDetailPage from "./OrderDetailPage";

// 마이페이지
import MyPageLayout from "./mypage/MyPageLayout";
import PasswordChangePage from "./mypage/PasswordChangePage";

// Q&A
import QnaTabs from "./qna/QnaTabs";
import AskListPage from "./qna/AskListPage";
import AskWritePage from "./qna/AskWritePage";
import NoticeListPage from "./qna/NoticeListPage";
import NoticeDetailPage from "./qna/NoticeDetailPage";

// 컨텍스트
import { AuthProvider, useAuth } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { OrderProvider } from "../context/OrderContext";

// 회원가입 / 비번 재설정
import SignupPage from "./auth/SignupPage";
import PasswordResetRequestPage from "./auth/PasswordResetRequestPage";

// 관리자
import AdminGuard from "./admin/AdminGuard";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import AdminProductNew from "./admin/AdminProductNew";

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

function AppShell() {
  const { user, ready, setUser } = useAuth();
  if (!ready) return null;

  const username = user?.username || "";
  const isLoggedIn = !!user;
  const currentUserId = username || "guest";
  const isAdmin = username === "admin";

  const setUsername = (name) => setUser(name ? { ...(user ?? {}), username: name } : null);

  return (
    <CartProvider username={user?.username}>
      <Routes>
        {/* 메인(홈/시크릿) : 기본 레이아웃 */}
        <Route
          element={
            <WithLayout
              username={username}
              setUsername={setUsername}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={(v) => setUser(v ? (user ?? { username }) : null)}
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
              setIsLoggedIn={(v) => setUser(v ? (user ?? { username }) : null)}
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
          {/* 관리자 - 상품 등록 */}
          <Route
            path="admin/products/new"
            element={
              <AdminGuard>
                <AdminProductNew />
              </AdminGuard>
            }
          />
        </Route>

        {/* 존재하지 않는 경로 → 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppShell />
      </OrderProvider>
    </AuthProvider>
  );
}
