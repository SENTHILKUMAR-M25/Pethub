import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, MapPin, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { getOrderById } from "../../api/orderService";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data);
      } catch {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF80C7]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Order Not Found</h1>
          <p className="text-gray-500 mb-6">{error || "We couldn't find that order."}</p>
          <Link to="/shop" className="inline-block bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-[#FF80C7]/25">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Order Placed!</h1>
          <p className="text-gray-500">Thank you for your order. We'll start processing it right away.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1F2937]">Order Details</h2>
            <span className="text-sm font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={`${import.meta.env.VITE_IMAGE_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1F2937] truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-[#1F2937]">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5E7EB] pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${order.shippingCost.toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-[#1F2937] border-t border-[#E5E7EB] pt-3">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#FF80C7]" />
            <h2 className="text-lg font-bold text-[#1F2937]">Shipping Address</h2>
          </div>
          <p className="text-[#1F2937]">{order.shippingAddress.street}</p>
          <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
          <p className="text-gray-400 text-xs">{order.shippingAddress.country}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-[#FF80C7]" />
            <h2 className="text-lg font-bold text-[#1F2937]">Payment</h2>
          </div>
          <p className="text-[#1F2937] capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}</p>
          <p className="text-sm text-gray-500">
            Status: <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>{order.paymentStatus}</span>
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-[#FF80C7]/25 text-center">
            View My Orders
          </Link>
          <Link to="/shop" className="border-2 border-[#E5E7EB] text-[#1F2937] px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
