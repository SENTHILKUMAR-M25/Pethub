import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Wallet, BadgePercent, Package, Users,
  Star, Mail, Loader2, Activity, ArrowUpRight,
} from "lucide-react";
import api from "../../api/axios";

const PIE_COLORS = ["#FF80C7", "#38BDF8", "#F97316", "#16A34A", "#EF4444", "#8B5CF6"];

const formatCurrency = (amount) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const formatCurrencyFull = (amount) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

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

export default function Analytics() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const fetchAnalytics = async (r) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/analytics", { params: { range: r } });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const salesData = data?.salesData || [];
  const topProducts = data?.topProducts || [];
  const categoryData = data?.categoryData || [];
  const paymentStats = data?.paymentStats || [];
  const recentActivity = data?.recentActivity || [];

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-green-500",
      change: null,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "bg-blue-500",
      change: null,
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(stats.avgOrderValue),
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-purple-500",
      change: null,
    },
    {
      title: "Discount Given",
      value: formatCurrency(stats.totalDiscount),
      icon: <BadgePercent className="w-5 h-5" />,
      color: "bg-pink-500",
      change: null,
    },
    {
      title: "Products",
      value: stats.totalProducts || 0,
      icon: <Package className="w-5 h-5" />,
      color: "bg-orange-500",
      change: null,
    },
    {
      title: "Customers",
      value: stats.totalCustomers || 0,
      icon: <Users className="w-5 h-5" />,
      color: "bg-cyan-500",
      change: null,
    },
    {
      title: "Reviews",
      value: stats.totalReviews || 0,
      icon: <Star className="w-5 h-5" />,
      color: "bg-amber-500",
      change: null,
    },
    {
      title: "Enquiries",
      value: stats.totalEnquiries || 0,
      icon: <Mail className="w-5 h-5" />,
      color: "bg-red-500",
      change: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* ========== HEADER ========== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Analytics</h1>
            </div>
            <p className="text-gray-500">Track store performance, sales and customer behaviour</p>
          </div>
          <div className="flex border-2 border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                  range === r.value
                    ? "bg-[#FF80C7] text-white"
                    : "text-gray-500 hover:text-[#FF80C7]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ========== STAT CARDS ========== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {statCards.map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <h2 className="mt-1.5 text-2xl font-bold text-[#1F2937]">{card.value}</h2>
              </div>
              <div className={`${card.color} rounded-xl p-3.5 text-white`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">Couldn't load analytics</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => fetchAnalytics(range)}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </motion.div>
      ) : (
        <>
          {/* ========== SALES CHARTS ========== */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1F2937]">Revenue Trend</h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-600">
                  Total: {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="revenue" name="revenue" stroke="#16A34A"
                      strokeWidth={3} dot={{ fill: "#16A34A", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-gray-400">
                  No sales data for this period
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1F2937]">Orders</h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                  Total: {stats.totalOrders || 0}
                </span>
              </div>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders" fill="#FF80C7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-gray-400">
                  No orders for this period
                </div>
              )}
            </motion.div>
          </div>

          {/* ========== TOP PRODUCTS + CATEGORIES ========== */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Top Products</h2>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={p._id || idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-[#FF80C7]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#FF80C7]">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F2937] text-sm truncate">{p.name || "Product"}</p>
                        <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600 flex items-center gap-1 flex-shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-400">
                  No product sales for this period
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Sales by Category</h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#6B7280" }} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="revenue" fill="#38BDF8" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-gray-400">
                  No category sales for this period
                </div>
              )}
            </motion.div>
          </div>

          {/* ========== PAYMENT + RECENT ACTIVITY ========== */}
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Payment Methods</h2>
              {paymentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={paymentStats}
                      cx="50%" cy="50%"
                      outerRadius={85} innerRadius={50}
                      dataKey="count" nameKey="_id"
                      paddingAngle={4}
                    >
                      {paymentStats.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
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
                <div className="flex h-[250px] items-center justify-center text-gray-400">
                  No payment data for this period
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Recent Orders</h2>
              {recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left p-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((order) => (
                        <tr key={order._id} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-3 font-mono text-sm text-[#1F2937]">#{order._id.slice(-6)}</td>
                          <td className="p-3 text-sm text-gray-600">{order.user?.name || "Guest"}</td>
                          <td className="p-3 text-sm text-gray-600 uppercase">{order.paymentMethod}</td>
                          <td className="p-3 text-sm font-semibold text-[#1F2937]">{formatCurrencyFull(order.total)}</td>
                          <td className="p-3 text-sm text-gray-500 hidden sm:table-cell">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-gray-400">
                  No orders for this period
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
