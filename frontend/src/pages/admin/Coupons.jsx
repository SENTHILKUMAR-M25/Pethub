import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Ticket, Filter, Check,
  ChevronDown, Loader2, AlertCircle, Percent, Banknote, Truck, Calendar, Copy,
} from "lucide-react";
import api from "../../api/axios";

const initialState = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  minOrder: 0,
  maxDiscount: 0,
  usageLimit: 0,
  startDate: "",
  endDate: "",
  status: "Active",
};

const TYPE_OPTIONS = [
  { value: "percent", label: "Percentage", icon: <Percent className="w-4 h-4" /> },
  { value: "flat", label: "Flat Amount", icon: <Banknote className="w-4 h-4" /> },
  { value: "freeship", label: "Free Shipping", icon: <Truck className="w-4 h-4" /> },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "bg-[#FF80C7]/10 text-[#FF80C7] border-[#FF80C7]/20" },
  { value: "Inactive", label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200" },
];

const getStatusStyle = (status) =>
  status === "Active"
    ? "bg-[#FF80C7]/10 text-[#FF80C7] border border-[#FF80C7]/20"
    : "bg-gray-100 text-gray-500 border border-gray-200";

const getTypeLabel = (type) =>
  type === "percent" ? "Percentage" : type === "flat" ? "Flat Amount" : "Free Shipping";

const formatValue = (coupon) => {
  if (coupon.type === "percent") return `${coupon.value}%`;
  if (coupon.type === "flat") return `₹${coupon.value}`;
  return "Free";
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isModalOpen || deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen, deleteConfirmId]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialState);
    setEditingId(null);
    setFormError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError("");
  };

  const openEditModal = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().slice(0, 10)
        : "",
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().slice(0, 10)
        : "",
      status: coupon.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.code.trim()) {
      setFormError("Coupon code is required");
      return;
    }
    if (Number.isNaN(Number(form.value))) {
      setFormError("Please enter a valid discount value");
      return;
    }
    if (form.type !== "freeship" && Number(form.value) <= 0) {
      setFormError("Discount value must be greater than zero");
      return;
    }
    if (Number.isNaN(Number(form.minOrder)) || Number.isNaN(Number(form.maxDiscount)) || Number.isNaN(Number(form.usageLimit))) {
      setFormError("Please enter valid numeric values for limits");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
    };

    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
      } else {
        await api.post("/coupons", payload);
      }
      await fetchCoupons();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/coupons/${id}`);
      setDeleteConfirmId(null);
      await fetchCoupons();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* ========== HEADER ========== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Coupons</h1>
            </div>
            <p className="text-gray-500">Manage promotional coupon codes • {coupons.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Coupon
          </motion.button>
        </div>
      </motion.div>

      {/* ========== TOOLBAR ========== */}
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
              placeholder="Search coupons..."
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
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] cursor-pointer min-w-[160px]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* ========== CONTENT ========== */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery || statusFilter !== "All" ? "No coupons found" : "No coupons yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first coupon code"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}
              className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Coupon
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Usage</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Valid Till</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCoupons.map((coupon) => (
                    <motion.tr
                      key={coupon._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1F2937] bg-[#FF80C7]/5 px-3 py-1 rounded-lg border border-[#FF80C7]/15">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#FF80C7] hover:bg-[#FF80C7]/10 transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-[240px] truncate">{coupon.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-[#16A34A]">{formatValue(coupon)}</span>
                        {coupon.maxDiscount > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">Max ₹{coupon.maxDiscount}</p>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          {coupon.type === "percent" ? <Percent className="w-4 h-4 text-[#FF80C7]" /> :
                           coupon.type === "flat" ? <Banknote className="w-4 h-4 text-[#FF80C7]" /> :
                           <Truck className="w-4 h-4 text-[#FF80C7]" />}
                          {getTypeLabel(coupon.type)}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {coupon.usedCount || 0}
                          {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                        </span>
                      </td>
                      <td className="p-4 hidden xl:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(coupon.endDate)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(coupon.status)}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(coupon)}
                            className="p-2 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirmId(coupon._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
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
      )}

      {/* ========== ADD/EDIT MODAL ========== */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2937]">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? "Update coupon details" : "Create a new promotional coupon"}
                  </p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="code" value={form.code} onChange={handleChange}
                      placeholder="e.g., PETLOVE15"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Type</label>
                    <div className="flex gap-2">
                      {TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, type: opt.value, value: opt.value === "freeship" ? 0 : form.value, maxDiscount: opt.value === "percent" ? form.maxDiscount : 0 })}
                          className={`flex-1 py-3 px-2 rounded-xl border-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            form.type === opt.value
                              ? "bg-[#FF80C7]/10 text-[#FF80C7] border-[#FF80C7]/30"
                              : "bg-[#F8FAFC] border-[#E5E7EB] text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                    {form.type === "percent"
                      ? "Discount Percentage"
                      : form.type === "flat"
                        ? "Discount Amount (₹)"
                        : "Value"}
                  </label>
                  <input
                    type="number" name="value" value={form.value} onChange={handleChange}
                    placeholder={form.type === "percent" ? "e.g., 15" : form.type === "flat" ? "e.g., 100" : "0"}
                    min="0"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    disabled={form.type === "freeship"}
                  />
                </div>

                {form.type === "percent" && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Maximum Discount (₹)</label>
                    <input
                      type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange}
                      placeholder="e.g., 200 (0 for no limit)"
                      min="0"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Minimum Order (₹)</label>
                    <input
                      type="number" name="minOrder" value={form.minOrder} onChange={handleChange}
                      placeholder="e.g., 500 (0 for none)"
                      min="0"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Usage Limit</label>
                    <input
                      type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange}
                      placeholder="e.g., 100 (0 for unlimited)"
                      min="0"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Start Date</label>
                    <input
                      type="date" name="startDate" value={form.startDate} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">End Date</label>
                    <input
                      type="date" name="endDate" value={form.endDate} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Description</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Short description shown to customers..."
                    rows={2}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Status</label>
                  <div className="flex gap-3">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm({ ...form, status: option.value })}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                          form.status === option.value
                            ? `${option.color} border-current`
                            : "bg-[#F8FAFC] border-[#E5E7EB] text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {form.status === option.value && <Check className="w-4 h-4" />}
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 px-4 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingId ? (
                      <><Check className="w-5 h-5" /> Update Coupon</>
                    ) : (
                      <><Plus className="w-5 h-5" /> Create Coupon</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Coupon?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. Customers will no longer be able to use this coupon code.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 px-4 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
