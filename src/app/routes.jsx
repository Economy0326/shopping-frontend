import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Layout from "ui/layout/Layout";
import LayoutWithImage from "ui/layout/LayoutWithImage";

import Homepage from "features/home/pages/HomePage";
import ProductPage from "features/catalog/pages/ProductPage";
import CategoryPage from "features/catalog/pages/CategoryPage";
import LookPage from "features/catalog/pages/LookPage";

import CartPage from "features/cart/pages/CartPage";
import CheckoutPage from "features/cart/pages/CheckoutPage";

import MyPageLayout from "features/mypage/pages/MypageLayout";

import QnaTabs from "features/qna/pages/QnaTabs";
import AskListPage from "features/qna/pages/AskListPage";
import AskWritePage from "features/qna/pages/AskWritePage";
import NoticeListPage from "features/qna/pages/NoticeListPage";
import NoticeDetailPage from "features/qna/pages/NoticeDetailPage";

import SignupPage from "features/auth/pages/SignupPage";
import PasswordResetRequestPage from "features/auth/pages/PasswordResetRequestPage";

import AdminGuard from "features/admin/routes/AdminGuard";
import AdminOrderDetailPage from "features/admin/pages/AdminOrderDetailPage";
import AdminOrdersPage from "features/admin/pages/AdminOrdersPage";
import AdminProductNew from "features/admin/pages/AdminProductNew";
import AdminProductsPage from "features/admin/pages/AdminProductsPage";

function WithLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function WithImageLayout() {
  return (
    <LayoutWithImage>
      <Outlet />
    </LayoutWithImage>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<WithLayout />}>
        <Route index element={<Homepage />} />
      </Route>

      <Route element={<WithImageLayout />}>
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="category/:categoryName" element={<CategoryPage />} />
        <Route path="look" element={<LookPage />} />

        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />

        <Route path="mypage" element={<MyPageLayout />} />

        <Route path="auth/signup" element={<SignupPage />} />
        <Route path="auth/password-reset" element={<PasswordResetRequestPage />} />

        <Route path="qna" element={<QnaTabs />} />
        <Route path="qna/ask" element={<AskListPage />} />
        <Route path="qna/ask/:id" element={<AskListPage />} />
        <Route path="qna/ask/write" element={<AskWritePage />} />
        <Route path="qna/notice" element={<NoticeListPage />} />
        <Route path="qna/notice/:id" element={<NoticeDetailPage />} />

        <Route
          path="admin"
          element={
            <AdminGuard>
              <Navigate to="/admin/orders" replace />
            </AdminGuard>
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
        <Route
          path="admin/orders/:id"
          element={
            <AdminGuard>
              <AdminOrderDetailPage />
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
      </Route>
      <Route
        path="admin/products"
        element={
          <AdminGuard>
            <AdminProductsPage />
          </AdminGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}