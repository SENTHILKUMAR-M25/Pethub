import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-2"
        }`}
      >
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        <footer className="border-t bg-white px-6 py-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jod PetHub Admin Panel
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
