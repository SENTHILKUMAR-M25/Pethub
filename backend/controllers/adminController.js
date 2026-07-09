import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      revenueResult,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
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
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
