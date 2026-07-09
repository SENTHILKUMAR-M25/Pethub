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
  LayoutList,
  DollarSign,
  Package,
  Tag,
} from "lucide-react";
import api from "../../api/axios";

const initialState = {
  name: "",
  category: "",
  subcategory: "",
  brand: "",
  price: "",
  originalPrice: "",
  description: "",
  stock: "",
  tag: "",
  status: "Active",
  featured: false,
};

const STATUS_OPTIONS = [
  { value: "Active", label: "Active", color: "bg-[#FF80C7]/10 text-[#FF80C7] border-[#FF80C7]/20" },
  { value: "Inactive", label: "Inactive", color: "bg-gray-100 text-gray-500 border-gray-200" },
];

const TAG_OPTIONS = ["", "Best Seller", "New", "Sale", "Popular"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAll();
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

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, subRes, brandRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/subcategories"),
        api.get("/brands"),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSubcategories(subRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(
    (s) => s.category?._id === form.category || s.category === form.category
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "category") {
      setForm((prev) => ({ ...prev, category: e.target.value, subcategory: "" }));
    }
    setFormError("");
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length !== files.length) {
      setFormError("Some files were skipped. Only images under 5MB are allowed.");
    }

    setImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setFormError("");
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setForm(initialState);
    setImages([]);
    setPreviews([]);
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

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category?._id || "",
      subcategory: product.subcategory?._id || "",
      brand: product.brand?._id || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      description: product.description || "",
      stock: product.stock ?? "",
      tag: product.tag || "",
      status: product.status,
      featured: product.featured || false,
    });
    if (product.images && product.images.length > 0) {
      setPreviews(product.images.map((img) => `${import.meta.env.VITE_IMAGE_URL}${img}`));
    } else {
      setPreviews([]);
    }
    setImages([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (!form.category) {
      setFormError("Category is required");
      return;
    }
    if (!form.price) {
      setFormError("Price is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("category", form.category);
    formData.append("subcategory", form.subcategory);
    formData.append("brand", form.brand);
    formData.append("price", form.price);
    formData.append("originalPrice", form.originalPrice);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    formData.append("tag", form.tag);
    formData.append("status", form.status);
    formData.append("featured", form.featured);
    images.forEach((img) => formData.append("images", img));

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post("/products", formData);
      }
      await fetchAll();
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
      await api.delete(`/products/${id}`);
      setDeleteConfirmId(null);
      await fetchAll();
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

  const getTagStyle = (tag) => {
    const styles = {
      "Best Seller": "bg-amber-100 text-amber-700 border-amber-200",
      New: "bg-blue-100 text-blue-700 border-blue-200",
      Sale: "bg-red-100 text-red-700 border-red-200",
      Popular: "bg-green-100 text-green-700 border-green-200",
    };
    return styles[tag] || "";
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
                <Package className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Products</h1>
            </div>
            <p className="text-gray-500">Manage your product inventory • {products.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Product
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
              placeholder="Search products..."
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
      ) : filteredProducts.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">
            {searchQuery || statusFilter !== "All" ? "No products found" : "No products yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== "All" ? "Try adjusting your search or filters" : "Get started by adding your first product"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddModal}
              className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Product
            </motion.button>
          )}
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((item) => (
              <motion.div key={item._id} variants={itemVariants} layout whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img src={`${import.meta.env.VITE_IMAGE_URL}${item.images[0]}`} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {item.tag && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTagStyle(item.tag)}`}>
                        {item.tag}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.originalPrice && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-[#1F2937] text-lg mb-1 group-hover:text-[#FF80C7] transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {item.brand?.name && `${item.brand.name}`}
                    {item.category?.name && ` • ${item.category.name}`}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-[#FF80C7]">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                    </span>
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
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Brand</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((item) => (
                    <motion.tr key={item._id} variants={itemVariants} layout
                      className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group">
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <img src={`${import.meta.env.VITE_IMAGE_URL}${item.images[0]}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-[#1F2937] group-hover:text-[#FF80C7] transition-colors">{item.name}</p>
                        {item.tag && (
                          <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium border ${getTagStyle(item.tag)}`}>
                            {item.tag}
                          </span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{item.category?.name || "—"}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{item.brand?.name || "—"}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-semibold text-[#1F2937]">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`text-sm font-medium ${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                          {item.stock ?? 0}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
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
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F2937]">{editingId ? "Edit Product" : "Add Product"}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? "Update product details" : "Create a new product"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder="e.g., Premium Grain-Free Dog Food"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category" value={form.category} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                      required
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter((c) => c.status === "Active")
                        .map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Subcategory</label>
                    <select
                      name="subcategory" value={form.subcategory} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    >
                      <option value="">Select subcategory</option>
                      {filteredSubcategories
                        .filter((s) => s.status === "Active")
                        .map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Brand</label>
                    <select
                      name="brand" value={form.brand} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    >
                      <option value="">Select brand</option>
                      {brands
                        .filter((b) => b.status === "Active")
                        .map((b) => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Tag</label>
                    <select
                      name="tag" value={form.tag} onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] focus:outline-none focus:border-[#FF80C7] transition-colors"
                    >
                      {TAG_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t || "None"}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number" name="price" value={form.price} onChange={handleChange}
                        placeholder="0.00" step="0.01" min="0"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Original Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange}
                        placeholder="0.00" step="0.01" min="0"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">Stock</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number" name="stock" value={form.stock} onChange={handleChange}
                        placeholder="0" min="0"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
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
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FFF7ED] rounded-xl border-2 border-amber-200">
                  <div>
                    <label className="text-sm font-semibold text-[#1F2937]">Featured Product</label>
                    <p className="text-xs text-gray-500 mt-0.5">Show on homepage Featured Products section</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      form.featured ? "bg-[#FF80C7]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        form.featured ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Description</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange}
                    placeholder="Product description..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">Product Images</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors text-center border-[#E5E7EB] hover:border-[#FF80C7] hover:bg-[#FF80C7]/5 bg-[#F8FAFC]"
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each (max 5)</p>
                  </div>
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-[#E5E7EB]" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                      <><Check className="w-5 h-5" /> Update Product</>
                    ) : (
                      <><Plus className="w-5 h-5" /> Create Product</>
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Product?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The product will be permanently removed.
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
