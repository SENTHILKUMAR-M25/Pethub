import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Check,
  Loader2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../api/axios";

const initialState = {
  name: "",
  email: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  },
};

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        setDeleteConfirmId(null);
        setIsViewModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isModalOpen || deleteConfirmId || isViewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen, deleteConfirmId, isViewModalOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?search=${searchQuery}&page=${page}&limit=20`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm({ ...form, address: { ...form.address, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
    setFormError("");
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

  const openEditModal = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zip: user.address?.zip || "",
        country: user.address?.country || "",
      },
    });
    setIsModalOpen(true);
  };

  const openViewModal = (user) => {
    setViewUser(user);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/users/${editingId}`, form);
      await fetchUsers();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setDeleteConfirmId(null);
      await fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* ========== HEADER ========== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Customers</h1>
            </div>
            <p className="text-gray-500">Manage registered customers • {total} total</p>
          </div>
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
              placeholder="Search customers by name, email or phone..."
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
        </div>
      </motion.div>

      {/* ========== CONTENT ========== */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery ? "No customers found" : "No customers yet"}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search" : "No customers have registered yet"}
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
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                    <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr key={user._id} variants={itemVariants} layout
                        className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF80C7]/10 flex items-center justify-center text-[#FF80C7] font-bold text-sm flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1F2937] group-hover:text-[#FF80C7] transition-colors cursor-pointer"
                                onClick={() => openViewModal(user)}>
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400">{user.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5" />
                            {user.phone || "—"}
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {user.address?.city || user.address?.state
                              ? [user.address.city, user.address.state].filter(Boolean).join(", ")
                              : "—"}
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirmId(user._id)}
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

          {/* ========== PAGINATION ========== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

      {/* ========== VIEW CUSTOMER MODAL ========== */}
      <AnimatePresence>
        {isViewModalOpen && viewUser && (
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
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2937]">Customer Details</h2>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF80C7]/10 flex items-center justify-center text-[#FF80C7] font-bold text-2xl">
                    {viewUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937]">{viewUser.name}</h3>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#FF80C7]/10 text-[#FF80C7] border border-[#FF80C7]/20">
                      {viewUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Email</p>
                    <p className="text-sm font-medium text-[#1F2937]">{viewUser.email}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Phone</p>
                    <p className="text-sm font-medium text-[#1F2937]">{viewUser.phone || "—"}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Joined</p>
                    <p className="text-sm font-medium text-[#1F2937]">{formatDate(viewUser.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">User ID</p>
                    <p className="text-sm font-medium text-[#1F2937] font-mono">{viewUser._id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Address</p>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl">
                    {viewUser.address?.street || viewUser.address?.city ? (
                      <div className="space-y-1 text-sm text-[#1F2937]">
                        <p>{viewUser.address.street}</p>
                        <p>{[viewUser.address.city, viewUser.address.state, viewUser.address.zip].filter(Boolean).join(", ")}</p>
                        <p>{viewUser.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No address provided</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setIsViewModalOpen(false); openEditModal(viewUser); }}
                    className="flex-1 py-3 px-4 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl font-semibold transition-colors">
                    Edit Customer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== EDIT MODAL ========== */}
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
                  <h2 className="text-2xl font-bold text-[#1F2937]">Edit Customer</h2>
                  <p className="text-sm text-gray-500 mt-1">Update customer information</p>
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

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Phone</label>
                  <input
                    type="text" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Address</label>
                  <div className="space-y-3">
                    <input
                      type="text" name="address.street" value={form.address.street} onChange={handleChange}
                      placeholder="Street address"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text" name="address.city" value={form.address.city} onChange={handleChange}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                      <input
                        type="text" name="address.state" value={form.address.state} onChange={handleChange}
                        placeholder="State"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text" name="address.zip" value={form.address.zip} onChange={handleChange}
                        placeholder="ZIP code"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                      <input
                        type="text" name="address.country" value={form.address.country} onChange={handleChange}
                        placeholder="Country"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
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
                    ) : (
                      <><Check className="w-5 h-5" /> Update Customer</>
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Customer?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. All data associated with this customer will be permanently removed.
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
