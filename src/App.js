import { Routes, Route } from "react-router-dom";
import InnerApp from "./InnerApp";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!username);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <InnerApp
            username={username}
            updateUsername={(name) => {
              setUsername(name);
              localStorage.setItem("username", name);
            }}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        }
      />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  );
}