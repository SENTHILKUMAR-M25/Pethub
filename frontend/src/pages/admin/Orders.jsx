import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, X, Check, Loader2, ShoppingCart, ChevronLeft, ChevronRight,
  Eye, DollarSign, Package, CreditCard, MapPin, Calendar, Clock, RotateCcw,
} from "lucide-react";
import { getAllOrders, updateOrderStatus, deleteOrder } from "../../api/orderService";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refund_pending", "refunded"];
const REFUND_OPTIONS = ["refund_pending", "refund_processing", "refund_completed", "refund_failed"];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refund_pending: "bg-orange-50 text-orange-700 border-orange-200",
  refunded: "bg-blue-50 text-blue-700 border-blue-200",
};

const REFUND_STYLES = {
  refund_pending: "bg-orange-50 text-orange-700 border-orange-200",
  refund_processing: "bg-purple-50 text-purple-700 border-purple-200",
  refund_completed: "bg-green-50 text-green-700 border-green-200",
  refund_failed: "bg-red-50 text-red-700 border-red-200",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewOrder, setViewOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [statusEditOrder, setStatusEditOrder] = useState(null);
  const [statusForm, setStatusForm] = useState({ orderStatus: "", paymentStatus: "", cancellationReason: "", refundStatus: "", refundTransactionId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsViewModalOpen(false);
        setStatusEditOrder(null);
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isViewModalOpen || statusEditOrder || deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isViewModalOpen, statusEditOrder, deleteConfirmId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search: searchQuery };
      if (statusFilter) params.status = statusFilter;
      const res = await getAllOrders(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusForm.orderStatus) return;
    setIsSubmitting(true);
    try {
      const payload = {
        orderStatus: statusForm.orderStatus,
        paymentStatus: statusForm.paymentStatus,
      };
      if (statusForm.cancellationReason) payload.cancellationReason = statusForm.cancellationReason;
      if (statusForm.refundStatus && statusForm.refundStatus !== "none") payload.refundStatus = statusForm.refundStatus;
      if (statusForm.refundTransactionId) payload.refundTransactionId = statusForm.refundTransactionId;
      await updateOrderStatus(statusEditOrder._id, payload);
      setStatusEditOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      setDeleteConfirmId(null);
      await fetchOrders();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openViewModal = (order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  const openStatusEdit = (order) => {
    setStatusEditOrder(order);
    setStatusForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      cancellationReason: order.cancellationReason || "",
      refundStatus: order.refundStatus || "none",
      refundTransactionId: "",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Orders</h1>
            </div>
            <p className="text-gray-500">Manage all orders • {total} total</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                  statusFilter === s
                    ? "bg-[#FF80C7] text-white border-[#FF80C7]"
                    : "bg-white text-gray-500 border-[#E5E7EB] hover:border-[#FF80C7] hover:text-[#FF80C7]"
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery || statusFilter ? "No orders found" : "No orders yet"}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter ? "Try adjusting your search or filter" : "No orders have been placed yet"}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} initial="hidden" animate="visible"
            className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {orders.map((order) => (
                      <motion.tr key={order._id} variants={itemVariants} layout
                        className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group">
                        <td className="p-4">
                          <p className="font-mono text-xs sm:text-sm font-semibold text-[#1F2937]">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#FF80C7]/10 flex items-center justify-center text-[#FF80C7] font-bold text-xs flex-shrink-0">
                              {(order.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#1F2937] truncate">
                                {order.user?.name || "Deleted User"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{order.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm text-gray-500">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-sm text-[#1F2937]">₹{(order.total || 0).toFixed(2)}</p>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            PAYMENT_STYLES[order.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            {(order.paymentStatus || "pending").charAt(0).toUpperCase() + (order.paymentStatus || "pending").slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_STYLES[order.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                            }`}>
                              <Package className="w-3 h-3" />
                              {(order.orderStatus || "pending").charAt(0).toUpperCase() + (order.orderStatus || "pending").slice(1)}
                            </span>
                            {order.refundStatus && order.refundStatus !== "none" && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                REFUND_STYLES[order.refundStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                              }`}>
                                <RotateCcw className="w-3 h-3" />
                                {order.refundStatus.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openViewModal(order)}
                              className="p-2 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors"
                              title="View order">
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openStatusEdit(order)}
                              className="p-2 rounded-lg text-[#FF80C7] hover:bg-[#FF80C7]/10 transition-colors"
                              title="Update status">
                              <Package className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirmId(order._id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete order">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:text-[#FF80C7] hover:border-[#FF80C7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                          page === p
                            ? "bg-[#FF80C7] text-white"
                            : "bg-white border border-[#E5E7EB] text-gray-500 hover:text-[#FF80C7] hover:border-[#FF80C7]"
                        }`}
                      >
                        {p}
                      </motion.button>
                    </span>
                  ))}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:text-[#FF80C7] hover:border-[#FF80C7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {isViewModalOpen && viewOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2937]">Order Details</h2>
                  <p className="text-sm text-gray-500 mt-1">#{viewOrder._id}</p>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    STATUS_STYLES[viewOrder.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                  }`}>
                    <Package className="w-3.5 h-3.5" />
                    {(viewOrder.orderStatus || "pending").charAt(0).toUpperCase() + (viewOrder.orderStatus || "pending").slice(1)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    PAYMENT_STYLES[viewOrder.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                  }`}>
                    <CreditCard className="w-3.5 h-3.5" />
                    {(viewOrder.paymentStatus || "pending").charAt(0).toUpperCase() + (viewOrder.paymentStatus || "pending").slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Customer</p>
                    <p className="text-sm font-medium text-[#1F2937]">{viewOrder.user?.name || "Deleted User"}</p>
                    <p className="text-xs text-gray-500">{viewOrder.user?.email}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-[#1F2937] uppercase">
                      {viewOrder.paymentMethod || "cod"}
                    </p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Order Date
                    </p>
                    <p className="text-sm font-medium text-[#1F2937]">{formatDate(viewOrder.createdAt)}</p>
                    <p className="text-xs text-gray-500">{formatTime(viewOrder.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Coupon</p>
                    <p className="text-sm font-medium text-[#1F2937]">{viewOrder.couponCode || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Shipping Address
                  </p>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl text-sm text-[#1F2937] space-y-1">
                    <p>{viewOrder.shippingAddress?.street}</p>
                    <p>{[viewOrder.shippingAddress?.city, viewOrder.shippingAddress?.state, viewOrder.shippingAddress?.zip].filter(Boolean).join(", ")}</p>
                    <p>{viewOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Order Items</p>
                  <div className="space-y-3">
                    {viewOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-[#E5E7EB] flex-shrink-0">
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
                        </div>
                        <p className="text-sm font-bold text-[#1F2937]">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1F2937]">₹{(viewOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-[#1F2937]">₹{(viewOrder.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  {(viewOrder.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{viewOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[#1F2937] border-t border-[#E5E7EB] pt-3">
                    <span>Total</span>
                    <span>₹{(viewOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setIsViewModalOpen(false); openStatusEdit(viewOrder); }}
                    className="flex-1 py-3 px-4 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl font-semibold transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusEditOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setStatusEditOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-[#E5E7EB] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Update Order Status</h2>
                  <p className="text-sm text-gray-500 mt-1">#{statusEditOrder._id}</p>
                </div>
                <button onClick={() => setStatusEditOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Order Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusForm({ ...statusForm, orderStatus: s })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          statusForm.orderStatus === s
                            ? (STATUS_STYLES[s] + " border-current")
                            : "bg-white border-[#E5E7EB] text-gray-500 hover:border-[#FF80C7]"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Payment Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusForm({ ...statusForm, paymentStatus: s })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                          statusForm.paymentStatus === s
                            ? (PAYMENT_STYLES[s] + " border-current")
                            : "bg-white border-[#E5E7EB] text-gray-500 hover:border-[#FF80C7]"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {statusForm.orderStatus === "cancelled" && (
                  <div className="border-t border-[#E5E7EB] pt-4">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Cancellation Reason</label>
                    <textarea value={statusForm.cancellationReason}
                      onChange={(e) => setStatusForm({ ...statusForm, cancellationReason: e.target.value })}
                      placeholder="Enter reason for cancellation..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors text-sm resize-none"
                    />
                  </div>
                )}

                {statusForm.orderStatus === "cancelled" && statusEditOrder?.paymentMethod !== "cod" && statusForm.refundStatus !== "none" && (
                  <div className="border-t border-[#E5E7EB] pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#1F2937] mb-2">Refund Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {REFUND_OPTIONS.map((s) => (
                          <button key={s} onClick={() => setStatusForm({ ...statusForm, refundStatus: s })}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                              statusForm.refundStatus === s
                                ? (REFUND_STYLES[s] + " border-current")
                                : "bg-white border-[#E5E7EB] text-gray-500 hover:border-[#FF80C7]"
                            }`}
                          >
                            {s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>
                    {statusForm.refundStatus === "refund_completed" && (
                      <div>
                        <label className="block text-sm font-semibold text-[#1F2937] mb-2">Transaction ID</label>
                        <input type="text" value={statusForm.refundTransactionId}
                          onChange={(e) => setStatusForm({ ...statusForm, refundTransactionId: e.target.value })}
                          placeholder="Enter payment gateway transaction ID..."
                          className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStatusEditOrder(null)}
                    className="flex-1 py-3 px-4 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || !statusForm.orderStatus}
                    onClick={handleStatusUpdate}
                    className="flex-1 py-3 px-4 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <><Check className="w-5 h-5" /> Update</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Order?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The order and all its data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 px-4 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
