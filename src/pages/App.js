import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Layout from "../components/Layout";
import LayoutWithImage from "../components/LayoutWithImage";

import Homepage from "./Homepage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import SecretPage from "./SecretPage";
import CategoryPage from "./CategoryPage";
import LookPage from "./LookPage";

// 마이페이지 + Q&A
import MyPageLayout from "./mypage/MyPageLayout";
import QnaPage from "./qna/QnaPage";


export default function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!username);

  const updateUsername = (name) => {
    setUsername(name);
    localStorage.setItem("username", name);
    setIsLoggedIn(!!name); //name 있으면 true, 없으면 false
  };

  return (
    <Routes>
      {/* 메인 + 시크릿 */}
      <Route
        path="/"
        element={
          <Layout
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <Homepage />
          </Layout>
        }
      />
      <Route
        path="/secret"
        element={
          <Layout
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <SecretPage />
          </Layout>
        }
      />

      {/* 나머지 */}
      <Route
        path="/product/:id"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <ProductPage />
          </LayoutWithImage>
        }
      />
      <Route
        path="/cart"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <CartPage />
          </LayoutWithImage>
        }
      />
      <Route
        path="/checkout"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <CheckoutPage />
          </LayoutWithImage>
        }
      />
      <Route
        path="/category/:categoryName"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <CategoryPage />
          </LayoutWithImage>
        }
      />
      <Route
        path="/look"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <LookPage />
          </LayoutWithImage>
        }
      />

      {/* 마이페이지: 단일 컴포넌트 */}
      <Route
        path="/mypage"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <MyPageLayout
              isLoggedIn={isLoggedIn}
              username={username}
              onLogout={() => updateUsername("")}
            />
          </LayoutWithImage>
        }
      />

      {/* Q&A: 단일 컴포넌트 */}
      <Route
        path="/q&a"
        element={
          <LayoutWithImage
            username={username}
            setUsername={updateUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          >
            <QnaPage isLoggedIn={isLoggedIn} username={username} />
          </LayoutWithImage>
        }
      />
    </Routes>
  );
}
