import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./CartContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
const username = localStorage.getItem("username") || null;

root.render(
  <CartProvider username={username}>
    <Router>
      <App />
    </Router>
  </CartProvider>
);