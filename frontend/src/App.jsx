import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import Navbar from "./components/Navbar";

import Home from "./pages/user/Home";
import Shop from "./pages/user/Shop";
import Categories from "./pages/user/Categories";
import Cart from "./pages/user/Cart";

import Dashboard from "./pages/admin/Dashboard";
import Category from "./pages/admin/Category";

function AppContent() {
  const location = useLocation();

  // Hide Navbar on admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ================= User Routes ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />

        {/* ================= Admin Routes ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Category />} />
        </Route>
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;