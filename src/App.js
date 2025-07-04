import { Routes, Route } from "react-router-dom";
import InnerApp from "./InnerApp";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!username);
  const [darkMode, setDarkMode] = useState(false);

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
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        }
      />
      <Route path="/product/:id" element={<ProductPage darkMode={darkMode} />} />
      <Route path="/cart" element={<CartPage darkMode={darkMode} />} />
      <Route path="/checkout" element={<CheckoutPage darkMode={darkMode} />} />
    </Routes>
  );
}