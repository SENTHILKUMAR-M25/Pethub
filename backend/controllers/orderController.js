import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderStatusEmail, sendRefundEmail } from "../config/email.js";
import {
  findValidCoupon,
  computeCouponDiscount,
  markCouponUsed,
  decrementCouponUsed,
} from "./couponController.js";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingCost, discount, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });

      subtotal += product.price * item.quantity;
    }

    let finalDiscount = discount || 0;
    let validatedCoupon = null;
    if (couponCode) {
      const result = await findValidCoupon(couponCode, subtotal);
      if (!result.valid) {
        return res.status(400).json({ message: result.message });
      }
      validatedCoupon = result.coupon;
      finalDiscount = computeCouponDiscount(validatedCoupon, subtotal, shippingCost || 0);
    }

    const total = subtotal + (shippingCost || 0) - finalDiscount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      shippingCost: shippingCost || 0,
      discount: finalDiscount,
      couponCode,
      subtotal,
      total,
    });

    if (validatedCoupon) {
      await markCouponUsed(validatedCoupon._id);
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) {
      query.$or = [
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, cancellationReason, refundStatus, refundTransactionId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const prevStatus = order.orderStatus;

    if (orderStatus) order.orderStatus = orderStatus;
    if (cancellationReason !== undefined) order.cancellationReason = cancellationReason;

    // Auto-initiate refund when cancelling a paid card order
    if (orderStatus === "cancelled" && prevStatus !== "cancelled" && order.paymentStatus === "paid" && order.paymentMethod !== "cod") {
      order.paymentStatus = "refund_pending";
      order.refundStatus = "refund_pending";
      order.refundHistory.push({
        status: "refund_pending",
        amount: order.total,
        note: cancellationReason || "Order cancelled by admin",
        updatedAt: new Date(),
      });
    }

    // Restore coupon usage count on cancellation
    if (orderStatus === "cancelled" && prevStatus !== "cancelled" && order.couponCode) {
      const Coupon = (await import("../models/Coupon.js")).default;
      const coupon = await Coupon.findOne({ code: String(order.couponCode).toUpperCase() });
      if (coupon) {
        await decrementCouponUsed(coupon._id);
      }
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Admin updating refund status
    if (refundStatus) {
      order.refundStatus = refundStatus;
      order.refundHistory.push({
        transactionId: refundTransactionId || "",
        status: refundStatus,
        amount: order.total,
        note: "",
        updatedAt: new Date(),
      });
      if (refundStatus === "refund_completed") {
        order.paymentStatus = "refunded";
      }
    }

    await order.save();

    if (orderStatus && orderStatus !== prevStatus) {
      User.findById(order.user).select("name email").lean().then((user) => {
        if (user) {
          sendOrderStatusEmail({ name: user.name, email: user.email, order, newStatus: orderStatus });
        }
      }).catch((err) => console.error("Failed to send order email:", err.message));
    }

    if (refundStatus) {
      User.findById(order.user).select("name email").lean().then((user) => {
        if (user) {
          sendRefundEmail({ name: user.name, email: user.email, order, newRefundStatus: refundStatus });
        }
      }).catch((err) => console.error("Failed to send refund email:", err.message));
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
