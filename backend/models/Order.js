import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: "United States" },
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "card"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refund_pending", "refunded"],
    default: "pending",
  },
  refundStatus: {
    type: String,
    enum: ["none", "refund_pending", "refund_processing", "refund_completed", "refund_failed"],
    default: "none",
  },
  refundHistory: [{
    transactionId: String,
    amount: Number,
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
  }],
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  cancellationReason: String,
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
