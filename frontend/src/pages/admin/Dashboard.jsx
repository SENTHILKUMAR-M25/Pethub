import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaRupeeSign,
  FaSpinner,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../../api/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PIE_COLORS = ["#FF80C7", "#38BDF8", "#F97316", "#16A34A", "#EF4444"];

const formatCurrency = (amount) =>
  "₹" + Number(amount).toLocaleString("en-IN");

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-[#1F2937]">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => {
        setStats(res.data);
        setRecentOrders(res.data.recentOrders || []);
      })
      .catch((err) => console.error("Failed to load dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : "₹0",
      icon: <FaRupeeSign />,
      color: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: stats ? String(stats.totalOrders) : "0",
      icon: <FaShoppingCart />,
      color: "bg-blue-500",
    },
    {
      title: "Products",
      value: stats ? String(stats.totalProducts) : "0",
      icon: <FaBoxOpen />,
      color: "bg-orange-500",
    },
    {
      title: "Customers",
      value: stats ? String(stats.totalCustomers) : "0",
      icon: <FaUsers />,
      color: "bg-purple-500",
    },
  ];

  const monthlyData = stats?.monthlyData || [];
  const statusData = stats?.statusDistribution || [];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back to Jod PetHub Admin Panel
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">{card.title}</p>
                <h2 className="mt-2 text-3xl font-bold">{card.value}</h2>
              </div>
              <div className={`${card.color} rounded-xl p-4 text-white text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Sales Overview</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#FF80C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">
              No sales data yet
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Revenue Trend</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#16A34A" strokeWidth={3} dot={{ fill: "#16A34A", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">
              No revenue data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-md lg:col-span-1">
          <h2 className="mb-4 text-xl font-semibold">Order Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-[#1F2937] capitalize">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-gray-400">
              No order data yet
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3">Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4">#{order._id.slice(-6)}</td>
                      <td>{order.user?.name || "N/A"}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${
                            statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
