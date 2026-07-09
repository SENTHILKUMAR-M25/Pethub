import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "productId, rating, and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const hasDelivered = await Order.findOne({
      user: req.user._id,
      orderStatus: "delivered",
      "items.product": productId,
    });
    if (!hasDelivered) {
      return res.status(403).json({ message: "You can only review products you have purchased and received" });
    }

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRating(productId);

    const populated = await Review.findById(review._id).populate("user", "name avatar");

    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      { $match: { product: req.params.productId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);

    res.json({
      reviews,
      avgRating: stats[0]?.avgRating || 0,
      total: stats[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const canReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ canReview: false, reason: "not_logged_in" });
    }

    const hasDelivered = await Order.findOne({
      user: req.user._id,
      orderStatus: "delivered",
      "items.product": req.params.productId,
    });

    if (!hasDelivered) {
      return res.json({ canReview: false, reason: "not_purchased" });
    }

    const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });

    res.json({
      canReview: !existing,
      reason: existing ? "already_reviewed" : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRating(productId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats[0]?.avgRating || 0,
    reviewsCount: stats[0]?.count || 0,
  });
}
