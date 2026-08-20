import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pencil, Trash2, X, Image, Filter, Check,
  ChevronDown, Loader2, AlertCircle, Upload, Link2, GripVertical, Eye,
} from "lucide-react";
import api from "../../api/axios";
import { getImageUrl } from "../../api/imageUtils";

const initialState = {
  title: "",
  subtitle: "",
  link: "",
  position: "home_top",
  order: 0,
  status: "Active",
};

const POSITION_OPTIONS = [
  { value: "home_top", label: "Home Top" },
  { value: "home_middle", label: "Home Middle" },
  { value: "home_bottom", label: "Home Bottom" },
  { value: "shop_top", label: "Shop Top" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "bg-[#FF80C7]/10 text-[#FF80C7] border-[#FF80C7]/20" },
  { value: "Inactive", label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200" },
];

const getStatusStyle = (status) =>
  status === "Active"
    ? "bg-[#FF80C7]/10 text-[#FF80C7] border border-[#FF80C7]/20"
    : "bg-gray-100 text-gray-500 border border-gray-200";

const getPositionLabel = (position) => {
  const found = POSITION_OPTIONS.find((p) => p.value === position);
  return found ? found.label : position;
};

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
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

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialState);
    setImage(null);
    setPreview("");
    setEditingId(null);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === "All" || b.position === positionFilter;
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const openEditModal = (banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      position: banner.position,
      order: banner.order || 0,
      status: banner.status,
    });
    setPreview(banner.image ? getImageUrl(banner.image) : "");
    setImage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Banner title is required");
      return;
    }

    const linkTrimmed = form.link.trim();
    if (linkTrimmed && (linkTrimmed.includes("localhost") || linkTrimmed.includes("127.0.0.1"))) {
      setFormError("Banner link cannot contain localhost or 127.0.0.1. Use a production URL or relative path.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("subtitle", form.subtitle.trim());
    formData.append("link", form.link.trim());
    formData.append("position", form.position);
    formData.append("order", Number(form.order) || 0);
    formData.append("status", form.status);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, formData);
      } else {
        await api.post("/banners", formData);
      }
      await fetchBanners();
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
      await api.delete(`/banners/${id}`);
      setDeleteConfirmId(null);
      await fetchBanners();
    } catch (err) {
      console.error("Delete error:", err);
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
                <Image className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Banners</h1>
            </div>
            <p className="text-gray-500">Manage homepage & shop promotional banners • {banners.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Banner
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
              placeholder="Search banners..."
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
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] cursor-pointer min-w-[170px]"
            >
              <option value="All">All Positions</option>
              {POSITION_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] cursor-pointer min-w-[150px]"
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
      ) : filteredBanners.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery || positionFilter !== "All" || statusFilter !== "All" ? "No banners found" : "No banners yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || positionFilter !== "All" || statusFilter !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first banner"}
          </p>
          {!searchQuery && positionFilter === "All" && statusFilter === "All" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}
              className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Banner
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredBanners.map((banner) => (
              <motion.div
                key={banner._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
              >
                <div className="relative aspect-[16/7] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {banner.image ? (
                    <img src={getImageUrl(banner.image)} alt={banner.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(banner.status)}`}>
                      <Eye className="w-3 h-3" />
                      {banner.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <h3 className="font-bold text-[#1F2937] text-lg group-hover:text-[#FF80C7] transition-colors">
                      {banner.title}
                    </h3>
                  </div>
                  {banner.subtitle && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 min-h-[20px]">
                      {banner.subtitle}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8]">
                        {getPositionLabel(banner.position)}
                      </span>
                      {banner.order > 0 && (
                        <span className="text-xs text-gray-400">Order {banner.order}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(banner)}
                        className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirmId(banner._id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  {banner.link && (
                    <a href={banner.link} target="_blank" rel="noreferrer"
                      className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FF80C7] transition-colors truncate">
                      <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{banner.link}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
                  <h2 className="text-2xl font-bold text-[#1F2937]">{editingId ? "Edit Banner" : "Add Banner"}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? "Update banner details" : "Create a new promotional banner"}
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

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g., Summer Sale on Dog Food"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Subtitle</label>
                  <input
                    type="text" name="subtitle" value={form.subtitle} onChange={handleChange}
                    placeholder="e.g., Up to 30% off selected items"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Link</label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" name="link" value={form.link} onChange={handleChange}
                      placeholder="/shop or https://..."
                      className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Position</label>
                    <select
                      name="position" value={form.position} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors cursor-pointer"
                    >
                      {POSITION_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Display Order</label>
                    <input
                      type="number" name="order" value={form.order} onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Banner Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors text-center ${
                      preview
                        ? "border-[#FF80C7] bg-[#FF80C7]/5"
                        : "border-[#E5E7EB] hover:border-[#FF80C7] hover:bg-[#FF80C7]/5 bg-[#F8FAFC]"
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    {preview ? (
                      <div className="relative inline-block">
                        <img src={preview} alt="Preview" className="w-full max-h-40 object-cover rounded-xl mx-auto" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview("");
                            setImage(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
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
                      <><Check className="w-5 h-5" /> Update Banner</>
                    ) : (
                      <><Plus className="w-5 h-5" /> Create Banner</>
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Banner?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The banner will be removed from the storefront.
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
