import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Contact from "../models/Contact.js";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const getAnalytics = async (req, res) => {
  try {
    const { range = "all" } = req.query;

    const now = new Date();
    let startDate = null;

    if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    const [
      orderStats,
      productCount,
      customerCount,
      reviewCount,
      enquiryCount,
      topProducts,
      categorySales,
      paymentStats,
      recentActivity,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { ...dateFilter, orderStatus: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            totalDiscount: { $sum: "$discount" },
            avgOrderValue: { $avg: "$total" },
          },
        },
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Review.countDocuments(),
      Contact.countDocuments(),
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            image: { $first: "$items.image" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: { $toString: "$items.product" },
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      ]),
      Order.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("user", "name")
        .lean(),
    ]);

    const dailySales = await Order.aggregate([
      {
        $match: startDate
          ? { createdAt: { $gte: startDate } }
          : { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const productIds = categorySales.map((c) => c._id);
    const products =
      productIds.length > 0
        ? await Product.find({ _id: { $in: productIds } })
            .select("name category")
            .populate("category", "name")
            .lean()
        : [];

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const categoryMap = {};
    categorySales.forEach((c) => {
      const product = productMap[c._id];
      const catName = product?.category?.name || "Uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = { category: catName, revenue: 0, totalSold: 0 };
      }
      categoryMap[catName].revenue += c.revenue;
      categoryMap[catName].totalSold += c.totalSold;
    });

    const categoryData = Object.values(categoryMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const salesData = dailySales.map((d) => ({
      date: `${monthNames[d._id.month - 1]} ${d._id.day}`,
      revenue: d.revenue,
      orders: d.orders,
    }));

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      avgOrderValue: 0,
    };

    res.json({
      stats: {
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        totalDiscount: stats.totalDiscount,
        avgOrderValue: stats.avgOrderValue,
        totalProducts: productCount,
        totalCustomers: customerCount,
        totalReviews: reviewCount,
        totalEnquiries: enquiryCount,
      },
      salesData,
      topProducts,
      categoryData,
      paymentStats,
      recentActivity,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};
