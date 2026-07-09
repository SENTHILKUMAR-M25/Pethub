import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const getDashboardStats = async (req, res) => {
  try {
    const [
      revenueResult,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      monthlySales,
      ordersByStatus,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const monthlyData = monthNames.map((name, i) => {
      const month = i + 1;
      const found = monthlySales.find((m) => m._id === month);
      return {
        name,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    const statusDistribution = ordersByStatus.map((s) => ({
      name: s._id,
      value: s.count,
    }));

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      monthlyData,
      statusDistribution,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
