import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "ui/layout/Layout";
import LayoutWithImage from "ui/layout/LayoutWithImage";

import AdminGuard from "features/admin/routes/AdminGuard";
import AdminLayout from "features/admin/routes/AdminLayout";

// Admin pages
import AdminOrdersPage from "features/admin/pages/AdminOrdersPage";
import AdminOrderDetailPage from "features/admin/pages/AdminOrderDetailPage";
import AdminProductsPage from "features/admin/pages/AdminProductsPage";
import AdminProductNew from "features/admin/pages/AdminProductNew";
import AdminProductEdit from "features/admin/pages/AdminProductEdit";
import AdminReturnsPage from "features/admin/pages/AdminReturnsPage";
import AdminNoticesPage from "features/admin/pages/AdminNoticesPage";
import AdminQnaPage from "features/admin/pages/AdminQnaPage";
import AdminFaqPage from "features/admin/pages/AdminFaqPage";

// Home pages
import Homepage from "features/home/pages/HomePage";
import SecretPage from "features/home/pages/SecretPage";

// Catalog pages
import ProductPage from "features/catalog/pages/ProductPage";
import CategoryPage from "features/catalog/pages/CategoryPage";
import LookPage from "features/catalog/pages/LookPage";

// Cart pages
import CartPage from "features/cart/pages/CartPage";
import CheckoutPage from "features/cart/pages/CheckoutPage";

// MyPage pages
import MyPageLayout from "features/mypage/pages/MypageLayout";
import PasswordChangePage from "features/mypage/pages/PasswordChangePage";

// Order detail page
import OrderDetailPage from "features/orders/pages/OrderDetailPage";

// QnA pages
import QnaTabs from "features/qna/pages/QnaTabs";
import AskListPage from "features/qna/pages/AskListPage";
import AskWritePage from "features/qna/pages/AskWritePage";
import NoticeListPage from "features/qna/pages/NoticeListPage";
import NoticeDetailPage from "features/qna/pages/NoticeDetailPage";

// Auth pages
import SignupPage from "features/auth/pages/SignupPage";
import PasswordResetRequestPage from "features/auth/pages/PasswordResetRequestPage";

// Legal pages
import PrivacyPage from "features/legal/pages/PrivacyPage";
import TermsPage from "features/legal/pages/TermsPage";
import RefundPage from "features/legal/pages/RefundPage";
import ShippingPage from "features/legal/pages/ShippingPage";

function NoLogoLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function LogoLayout() {
  return (
    <LayoutWithImage>
      <Outlet />
    </LayoutWithImage>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 홈/시크릿만 로고 없는 헤더 */}
      <Route element={<NoLogoLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/secret" element={<SecretPage />} />
      </Route>

      {/* 나머지 전부 로고 있는 헤더 */}
      <Route element={<LogoLayout />}>
        {/* catalog */}
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="category/:categoryName" element={<CategoryPage />} />
        <Route path="look" element={<LookPage />} />

        {/* cart */}
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />

        {/* mypage */}
        <Route path="mypage/*" element={<MyPageLayout />} />
        <Route path="mypage/password" element={<PasswordChangePage />} />

        {/* order detail (Panels link here) */}
        <Route path="order/:id" element={<OrderDetailPage />} />

        {/* auth */}
        <Route path="auth/signup" element={<SignupPage />} />
        <Route path="auth/password-reset" element={<PasswordResetRequestPage />} />
        <Route path="auth/reset-confirm" element={<PasswordChangePage />} />

        {/* qna */}
        <Route path="qna" element={<QnaTabs />} />
        <Route path="qna/ask" element={<AskListPage />} />
        <Route path="qna/ask/write" element={<AskWritePage />} />
        <Route path="qna/ask/:id" element={<AskListPage />} />
        <Route path="qna/notice" element={<NoticeListPage />} />
        <Route path="qna/notice/:id" element={<NoticeDetailPage />} />

        {/* legal */}
        <Route path="legal/privacy" element={<PrivacyPage />} />
        <Route path="legal/terms" element={<TermsPage />} />
        <Route path="legal/refund" element={<RefundPage />} />
        <Route path="legal/shipping" element={<ShippingPage />} />

        {/* admin */}
        <Route
          path="admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="returns" element={<AdminReturnsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductNew />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="qna" element={<AdminQnaPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}