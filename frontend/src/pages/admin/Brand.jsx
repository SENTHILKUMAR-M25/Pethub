import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  ImageIcon,
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Filter,
  Grid3X3,
  LayoutList
} from "lucide-react";
import api from "../../api/axios";
import { getImageUrl } from "../../api/imageUtils";

const initialState = {
  name: "",
  description: "",
  status: "Active",
};

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "bg-[#FF80C7]/10 text-[#FF80C7] border-[#FF80C7]/20" },
  { value: "Inactive", label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200" },
];

export default function Brand() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");

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
    fetchBrands();
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

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const openEditModal = (brand) => {
    setEditingId(brand._id);
    setForm({
      name: brand.name,
      description: brand.description || "",
      status: brand.status,
    });
    setPreview(
      brand.image
        ? getImageUrl(brand.image)
        : ""
    );
    setImage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Brand name is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("status", form.status);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, formData);
      } else {
        await api.post("/brands", formData);
      }
      await fetchBrands();
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
      await api.delete(`/brands/${id}`);
      setDeleteConfirmId(null);
      await fetchBrands();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const getStatusStyle = (status) => {
    return status === "Active"
      ? "bg-[#FF80C7]/10 text-[#FF80C7] border border-[#FF80C7]/20"
      : "bg-gray-100 text-gray-500 border border-gray-200";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
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
                <svg className="w-5 h-5 text-[#FF80C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Brands</h1>
            </div>
            <p className="text-gray-500">Manage pet product brands • {brands.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Brand
          </motion.button>
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
              placeholder="Search brands..."
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
          <div className="flex border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors ${viewMode === "grid" ? "bg-[#FF80C7] text-white" : "bg-white text-gray-400 hover:text-[#FF80C7]"}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${viewMode === "list" ? "bg-[#FF80C7] text-white" : "bg-white text-gray-400 hover:text-[#FF80C7]"}`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery || statusFilter !== "All" ? "No brands found" : "No brands yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== "All" ? "Try adjusting your search or filters" : "Get started by adding your first brand"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}
              className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Brand
            </motion.button>
          )}
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredBrands.map((item) => (
              <motion.div key={item._id} variants={itemVariants} layout whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#1F2937] text-lg mb-1 group-hover:text-[#FF80C7] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 min-h-[40px]">
                    {item.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.productCount || 0} products</span>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDelete(item._id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Products</th>
                  <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredBrands.map((item) => (
                    <motion.tr key={item._id} variants={itemVariants} layout
                      className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group">
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-[#1F2937] group-hover:text-[#FF80C7] transition-colors">{item.name}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">{item.description || "—"}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-500 font-medium">{item.productCount || 0}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => confirmDelete(item._id)}
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
                  <h2 className="text-2xl font-bold text-[#1F2937]">{editingId ? "Edit Brand" : "Add Brand"}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? "Update brand details" : "Create a new product brand"}
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
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g., Acme Pets, Happy Tails..."
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Description</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Brief description of this brand..."
                    rows={3}
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

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Brand Image</label>
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
                        <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto" />
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
                      <><Check className="w-5 h-5" /> Update Brand</>
                    ) : (
                      <><Plus className="w-5 h-5" /> Create Brand</>
                    )}
                  </motion.button>
                </div>
              </form>
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Brand?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The brand and all associated products may be affected.
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
