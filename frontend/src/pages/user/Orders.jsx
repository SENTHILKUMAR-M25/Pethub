import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Package, ChevronRight, ChevronDown, ChevronUp,
  Clock, Truck, MapPin, CreditCard, Calendar, AlertCircle, X,
  Loader2, ArrowLeft, Star, RotateCcw,
} from "lucide-react";
import { getMyOrders } from "../../api/orderService";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: Package,
  cancelled: X,
};

const REFUND_STYLES = {
  refund_pending: "bg-orange-50 text-orange-700 border-orange-200",
  refund_processing: "bg-purple-50 text-purple-700 border-purple-200",
  refund_completed: "bg-green-50 text-green-700 border-green-200",
  refund_failed: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
  if (currentIdx === -1) return null;

  return (
    <div className="flex items-center gap-1.5">
      {STATUS_STEPS.map((step, idx) => {
        const completed = idx <= currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
              completed
                ? "bg-[#FF80C7] border-[#FF80C7] text-white"
                : "bg-white border-[#E5E7EB] text-gray-300"
            }`}>
              {idx + 1}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 transition-colors ${
                completed && idx < currentIdx
                  ? "bg-[#FF80C7]"
                  : idx === currentIdx
                    ? "bg-gradient-to-r from-[#FF80C7] to-[#E5E7EB]"
                    : "bg-[#E5E7EB]"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = STATUS_ICONS[order.orderStatus] || Package;
  const statusLabel = (order.orderStatus || "pending").charAt(0).toUpperCase() + (order.orderStatus || "pending").slice(1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#FF80C7]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-mono">
                Order #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                STATUS_STYLES[order.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200"
              }`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusLabel}
              </span>
              {order.refundStatus && order.refundStatus !== "none" && (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  REFUND_STYLES[order.refundStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                }`}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  {order.refundStatus.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-[#1F2937]">₹{(order.total || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {order.items?.slice(0, 4).map((item, idx) => (
            <div key={idx} className="w-14 h-14 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {(order.items?.length || 0) > 4 && (
            <div className="w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-500">+{order.items.length - 4}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <StatusTimeline currentStatus={order.orderStatus} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
            {order.paymentMethod && (
              <span className="ml-3 inline-flex items-center gap-1 text-xs uppercase text-gray-400">
                <CreditCard className="w-3 h-3" />
                {order.paymentMethod}
              </span>
            )}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-semibold text-[#FF80C7] hover:text-[#16A34A] transition-colors"
          >
            {expanded ? "Less Details" : "View Details"}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-[#E5E7EB] overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Order Items</p>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1F2937] truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                        {order.orderStatus === "delivered" && item.product && (
                          <Link
                            to={`/product/${item.product}`}
                            className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-amber-500 hover:text-[#FF80C7] transition-colors"
                          >
                            <Star className="w-3 h-3" />
                            Write a Review
                          </Link>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#1F2937]">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Shipping Address
                  </p>
                  <p className="text-sm text-[#1F2937]">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                  </p>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment
                  </p>
                  <p className="text-sm font-medium text-[#1F2937] uppercase">
                    {order.paymentMethod || "cod"}
                  </p>
                  <p className={`text-xs font-semibold ${
                    order.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"
                  }`}>
                    {(order.paymentStatus || "pending").charAt(0).toUpperCase() + (order.paymentStatus || "pending").slice(1)}
                  </p>
                </div>
              </div>

              {order.cancellationReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Cancellation Reason</p>
                  <p className="text-sm font-medium text-red-600">{order.cancellationReason}</p>
                </div>
              )}

              {order.refundHistory && order.refundHistory.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Refund History</p>
                  <div className="space-y-2">
                    {order.refundHistory.map((entry, idx) => (
                      <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl flex items-center justify-between">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            REFUND_STYLES[entry.status] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}>
                            {entry.status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                          </span>
                          {entry.transactionId && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">ID: {entry.transactionId}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {entry.amount && <p className="text-xs font-bold text-[#1F2937]">₹{entry.amount.toFixed(2)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#E5E7EB] pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1F2937]">₹{(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#1F2937]">₹{(order.shippingCost || 0).toFixed(2)}</span>
                </div>
                {(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#1F2937] border-t border-[#E5E7EB] pt-3 mt-2">
                  <span>Total</span>
                  <span>₹{(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-5"
        >
          <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1F2937] font-semibold">My Orders</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF80C7]/10 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF80C7]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#1F2937]">My Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {orders.length > 0
                ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
                : "No orders yet"}
            </p>
          </div>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 md:py-24 px-4"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#FF80C7]/20 to-pink-100 flex items-center justify-center"
            >
              <ShoppingBag className="w-14 h-14 md:w-20 md:h-20 text-[#FF80C7]" />
            </motion.div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#1F2937] mb-3">
              No orders yet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Looks like you haven&apos;t placed any orders yet. Start shopping and your orders will appear here!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#FF80C7]/25 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
