// import React from 'react'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'
// import Home from './pages/user/Home'
// import Shop from './pages/user/Shop'
// import Cart from './pages/user/Cart'

// const App = () => {
//   return (
//     <div>
//       <BrowserRouter>
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/shop" element={<Shop />} />
//           <Route path="/shop/:category" element={<Shop />} />
//           <Route path="/cart" element={<Cart />} />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   )
// }

// export default App






import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Layout

// Admin Layout
import AdminLayout from "./layouts/AdminLayout";

// User Pages
import Home from "./pages/user/Home";
import Shop from "./pages/user/Shop";
import Cart from "./pages/user/Cart";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/user/Categories";
import Category from "./pages/admin/Category";

// Admin Pages
// import Dashboard from "./pages/admin/Dashboard";
// import Products from "./pages/admin/Products";
// import Categories from "./pages/admin/Categories";
// import Orders from "./pages/admin/Orders";
// import Customers from "./pages/admin/Customers";
// import Reviews from "./pages/admin/Reviews";
// import Coupons from "./pages/admin/Coupons";
// import Banners from "./pages/admin/Banners";
// import Analytics from "./pages/admin/Analytics";
// import Settings from "./pages/admin/Settings";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= User Routes ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />

        {/* ================= Admin Routes ================= */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<Dashboard />} />
         <Route path="categories" element={<Category />} />
          {/* <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="banners" element={<Banners />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;