import { useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaLayerGroup,
  FaFolder,
  FaShoppingCart,
  FaUsers,
  FaStar,
  FaTicketAlt,
  FaImage,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaPaw,
  FaTimes,
  FaChevronLeft,
  FaBars,
} from "react-icons/fa";

const menuItems = [
  { title: "Dashboard", icon: <FaTachometerAlt />, path: "/admin" },
  { title: "Products", icon: <FaBoxOpen />, path: "/admin/products" },
  { title: "Categories", icon: <FaTags />, path: "/admin/categories" },
  { title: "Subcategories", icon: <FaFolder />, path: "/admin/subcategories" },
  { title: "Brands", icon: <FaLayerGroup />, path: "/admin/brands" },
  { title: "Orders", icon: <FaShoppingCart />, path: "/admin/orders" },
  { title: "Customers", icon: <FaUsers />, path: "/admin/customers" },
  { title: "Reviews", icon: <FaStar />, path: "/admin/reviews" },
  { title: "Coupons", icon: <FaTicketAlt />, path: "/admin/coupons" },
  { title: "Banners", icon: <FaImage />, path: "/admin/banners" },
  { title: "Analytics", icon: <FaChartBar />, path: "/admin/analytics" },
  { title: "Settings", icon: <FaCog />, path: "/admin/settings" },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const isMobile = useCallback(() => window.innerWidth < 1024, []);

  useEffect(() => {
    if (sidebarOpen && isMobile()) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen, isMobile]);

  const closeMobile = () => {
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay - mobile only */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out will-change-opacity lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Hamburger - mobile only */}
      <button
        className={`fixed z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg transition-all duration-300 ease-in-out will-change-transform lg:hidden ${
          sidebarOpen
            ? "pointer-events-none opacity-0 scale-95"
            : "left-4 top-4 opacity-100 scale-100"
        }`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="text-slate-700" size={18} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-white shadow-xl transition-all duration-300 ease-in-out will-change-transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 w-[80vw] max-w-[320px] lg:max-w-none ${
          sidebarOpen ? "lg:w-72" : "lg:w-20"
        }`}
      >
        {/* Logo */}
        <div className={`flex h-20 shrink-0 items-center border-b transition-all duration-300 ${
          sidebarOpen ? "justify-between px-6" : "justify-center px-0"
        }`}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500 p-2 text-white">
              <FaPaw size={22} />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold text-slate-800">Jod PetHub</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes className="text-slate-500" size={16} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/admin"}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-green-100 hover:text-green-600"
                  }
                  ${
                    sidebarOpen
                      ? "gap-4 px-4 justify-start"
                      : "justify-center px-0"
                  }`
                }
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t px-3 py-4">
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`mb-3 hidden w-full items-center rounded-xl py-2 text-sm text-gray-500 transition hover:bg-gray-100 lg:flex ${
              sidebarOpen ? "gap-2 justify-start px-4" : "justify-center px-0"
            }`}
          >
            <FaChevronLeft
              className={`shrink-0 transition-transform duration-300 ${
                !sidebarOpen ? "rotate-180" : ""
              }`}
              size={14}
            />
            {sidebarOpen && <span>Collapse</span>}
          </button>

          <button
            className={`flex w-full items-center rounded-xl bg-red-500 py-3 text-white transition hover:bg-red-600 ${
              sidebarOpen ? "gap-4 justify-start px-4" : "justify-center px-0"
            }`}
          >
            <FaSignOutAlt className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
