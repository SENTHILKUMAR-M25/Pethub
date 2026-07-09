import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Star, ShoppingCart, Heart, Minus, Plus,
  Check, Truck, Shield, RefreshCw, Package, Loader2,
  ChevronLeft, ChevronRight as ChevronRightIcon, Trash2,
  ThumbsUp, MessageSquare, Send, Clock, User, AlertCircle,
  ZoomIn, ArrowUp, ShoppingBag, BarChart3,
} from 'lucide-react';
import { getProduct, getProducts } from "../../api/productService";
import { getProductReviews, canReview, createReview, deleteReview } from "../../api/reviewService";
import { getImageUrl } from "../../api/imageUtils";

const TABS = ["Product Info", "Reviews", "Shipping & Returns"];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Rated", value: "highest" },
  { label: "Lowest Rated", value: "lowest" },
];

function StarRating({ rating, size = "w-5 h-5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${size} ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function RatingBreakdown({ reviews }) {
  const dist = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++; });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      pct: (counts[star] / total) * 100,
    }));
  }, [reviews]);

  return (
    <div className="space-y-1.5">
      {dist.map((d) => (
        <div key={d.star} className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 w-3 text-right">{d.star}</span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${d.pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-amber-400 rounded-full"
            />
          </div>
          <span className="text-gray-400 w-6 text-xs text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("Product Info");
  const { addItem } = useCart();
  const { user } = useAuth();
  const reviewsRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [canUserReview, setCanUserReview] = useState(false);
  const [reviewReason, setReviewReason] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewFilterRating, setReviewFilterRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProduct(id);
        setProduct(res.data);
        setSelectedImage(0);

        const [reviewRes, canReviewRes] = await Promise.all([
          getProductReviews(id),
          canReview(id).catch(() => ({ data: { canReview: false } })),
        ]);
        setReviews(reviewRes.data.reviews || []);
        setReviewAvg(reviewRes.data.avgRating || 0);
        setReviewTotal(reviewRes.data.total || 0);
        setCanUserReview(canReviewRes.data.canReview);
        setReviewReason(canReviewRes.data.reason || null);

        const relatedRes = await getProducts();
        const sameCategory = relatedRes.data.filter(
          (p) => p.category?._id === res.data.category?._id && p._id !== id
        );
        setRelatedProducts(sameCategory.slice(0, 4));
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
        setReviewLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const sortedReviews = useMemo(() => {
    let filtered = [...reviews];
    if (reviewFilterRating > 0) {
      filtered = filtered.filter((r) => r.rating === reviewFilterRating);
    }
    switch (reviewSort) {
      case "oldest": return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "highest": return filtered.sort((a, b) => b.rating - a.rating);
      case "lowest": return filtered.sort((a, b) => a.rating - b.rating);
      default: return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [reviews, reviewSort, reviewFilterRating]);

  const scrollToReviews = () => {
    setActiveTab("Reviews");
    setTimeout(() => reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Product not found</h2>
          <Link to="/shop" className="text-[#FF80C7] hover:underline font-medium">Back to shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [null];
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const stockLevel = product.stock > 20 ? "high" : product.stock > 5 ? "medium" : product.stock > 0 ? "low" : "out";

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      setReviewError("Please provide a rating and comment");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    try {
      const res = await createReview({
        productId: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewForm({ rating: 0, comment: "" });
      setReviewSuccess(true);
      setCanUserReview(false);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const navImage = (dir) => {
    setSelectedImage((prev) => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 sm:pt-24 pb-24 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 overflow-x-auto">
          <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[#FF80C7] transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category?.name && (
            <>
              <Link to={`/shop?category=${product.category.name.toLowerCase()}`} className="hover:text-[#FF80C7] transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-[#1F2937] font-medium truncate">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-4 group">
              {images[selectedImage] ? (
                <img
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-24 h-24 text-gray-300" />
                </div>
              )}

              {images.length > 1 && images[0] && (
                <>
                  <button onClick={() => navImage(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:text-[#FF80C7] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => navImage(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-600 hover:text-[#FF80C7] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedImage + 1} / {images.length}
                  </div>
                </>
              )}

              {product.tag && (
                <span className="absolute top-4 left-4 bg-[#F97316] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {product.tag}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && images[0] && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-colors ${
                      selectedImage === i ? "border-[#FF80C7]" : "border-[#E5E7EB] hover:border-gray-300"
                    }`}
                  >
                    {img ? (
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-[#FF80C7] font-semibold mb-2">
                <span>{product.brand?.name || "General"}</span>
                {product.category?.name && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{product.category.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                <button onClick={scrollToReviews} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                  <StarRating rating={Math.round(reviewAvg || product.rating || 0)} size="w-4 h-4" />
                  <span className="text-sm text-gray-500 ml-1">
                    {reviewTotal > 0 ? `${reviewAvg.toFixed(1)} (${reviewTotal})` : "0 reviews"}
                  </span>
                </button>
                <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                  stockLevel === "out"
                    ? "bg-red-50 text-red-600"
                    : stockLevel === "low"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-green-50 text-green-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    stockLevel === "out" ? "bg-red-500" : stockLevel === "low" ? "bg-amber-500" : "bg-green-500"
                  }`} />
                  {stockLevel === "out" ? "Out of Stock" : stockLevel === "low" ? "Low Stock" : "In Stock"}
                </span>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl sm:text-4xl font-bold text-[#1F2937]">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl sm:text-2xl text-gray-400 line-through">₹{product.originalPrice}</span>
                    <span className="text-sm font-bold text-white bg-red-500 px-3 py-1 rounded-lg">
                      Save ₹{(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: Check, text: "Vet Approved", color: "text-green-600" },
                { icon: Shield, text: "Premium Quality", color: "text-[#38BDF8]" },
                { icon: Truck, text: "Free Shipping over ₹35", color: "text-[#FF80C7]" },
              ].map((feat, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${feat.color} bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full`}>
                  <feat.icon className="w-3.5 h-3.5" />
                  {feat.text}
                </span>
              ))}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description || "Premium quality product for your beloved pet. Vet-approved and made with the finest ingredients."}
            </p>

            {stockLevel !== "out" && stockLevel === "low" && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-amber-700">Only {product.stock} left in stock</span>
                  <span className="text-amber-600 text-xs">{product.stock} / 20</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(product.stock / 20) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="space-y-6 mb-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-bold text-xl text-[#1F2937]">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={product.stock <= 0}
                  onClick={() => addItem(product, quantity)}
                  className="flex-1 bg-[#FF80C7] hover:bg-[#16A34A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#FF80C7]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all sm:self-auto self-end ${
                    isWishlisted
                      ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]'
                      : 'border-[#E5E7EB] hover:border-[#F97316] text-gray-400 hover:text-[#F97316]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                {product.stock > 0 && (
                  <span className="font-medium text-green-600">{product.stock} units available</span>
                )}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-6 space-y-3">
              {[
                { icon: Truck, text: "Free shipping on orders over ₹35", color: "text-[#FF80C7]" },
                { icon: Shield, text: "Vet approved and quality tested", color: "text-[#38BDF8]" },
                { icon: RefreshCw, text: "30-day hassle-free returns", color: "text-[#F97316]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabbed Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-16"
          ref={reviewsRef}
        >
          <div className="flex border-b border-[#E5E7EB] mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#FF80C7] text-[#FF80C7]"
                    : "border-transparent text-gray-500 hover:text-[#1F2937]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "Product Info" && (
              <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                <h3 className="text-lg font-bold text-[#1F2937] mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {product.description || "Premium quality product for your beloved pet. Vet-approved and made with the finest ingredients."}
                </p>
                <h3 className="text-lg font-bold text-[#1F2937] mb-4">Product Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Premium quality ingredients",
                    "Vet approved and recommended",
                    "Suitable for all breeds",
                    "Made with love and care",
                    "Satisfaction guaranteed",
                    "Cruelty-free production",
                  ].map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF80C7] flex-shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left: Reviews list */}
                  <div className="lg:col-span-3 space-y-4">
                    {reviewLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-[#FF80C7] animate-spin" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E7EB]">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Be the first to review this product!</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-sm text-gray-500">
                            {reviewFilterRating > 0
                              ? `${sortedReviews.length} of ${reviews.length} reviews`
                              : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                            }
                          </p>
                          <div className="flex items-center gap-2">
                            {reviewFilterRating > 0 && (
                              <button onClick={() => setReviewFilterRating(0)}
                                className="text-xs text-[#FF80C7] hover:underline">
                                Clear filter
                              </button>
                            )}
                            <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}
                              className="text-sm bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:border-[#FF80C7]">
                              {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <AnimatePresence>
                          {sortedReviews.map((review) => (
                            <motion.div key={review._id} layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#FF80C7]/10 flex items-center justify-center text-[#FF80C7] font-bold text-sm flex-shrink-0">
                                    {(review.user?.name || "A").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-[#1F2937]">{review.user?.name || "Anonymous"}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(review.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                              {(user?._id === review.user?._id || user?.role === "admin") && (
                                <div className="flex justify-end mt-3">
                                  <button onClick={() => handleDeleteReview(review._id)}
                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {/* Right: Sidebar */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                      <h3 className="font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#FF80C7]" />
                        Rating Breakdown
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl font-bold text-[#1F2937]">{reviewAvg > 0 ? reviewAvg.toFixed(1) : "0.0"}</span>
                        <div>
                          <StarRating rating={Math.round(reviewAvg)} size="w-4 h-4" />
                          <p className="text-xs text-gray-400 mt-0.5">{reviewTotal} review{reviewTotal !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <RatingBreakdown reviews={reviews} />
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {[0, 5, 4, 3, 2, 1].map((star) => (
                          <button key={star} onClick={() => setReviewFilterRating(star)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              reviewFilterRating === star
                                ? "bg-[#FF80C7] text-white border-[#FF80C7]"
                                : "bg-white text-gray-500 border-[#E5E7EB] hover:border-[#FF80C7]"
                            }`}>
                            {star === 0 ? "All" : `${star} Star`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Form */}
                    {user ? (
                      canUserReview ? (
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sticky top-28">
                          <h3 className="font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-[#FF80C7]" />
                            Write a Review
                          </h3>
                          {reviewSuccess && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-4">
                              <Check className="w-4 h-4 flex-shrink-0" />
                              Review submitted successfully!
                            </motion.div>
                          )}
                          {reviewError && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              {reviewError}
                            </motion.div>
                          )}
                          <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Rating</label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button key={star} type="button"
                                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                    <Star className={`w-7 h-7 transition-colors ${
                                      star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 hover:text-amber-200"
                                    }`} />
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Comment</label>
                              <textarea value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                placeholder="Share your experience with this product..."
                                rows={4}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors resize-none"
                              />
                            </div>
                            <motion.button type="submit"
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              disabled={submittingReview}
                              className="w-full py-3 px-4 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF80C7]/20 transition-colors disabled:opacity-70"
                            >
                              {submittingReview ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <><Send className="w-4 h-4" /> Submit Review</>
                              )}
                            </motion.button>
                          </form>
                        </div>
                      ) : reviewReason === "not_purchased" ? (
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
                          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Purchase and receive this product to write a review.</p>
                        </div>
                      ) : reviewReason === "already_reviewed" ? (
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
                          <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">You have already reviewed this product.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
                          <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">Purchase and receive this product to write a review.</p>
                        </div>
                      )
                    ) : (
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
                        <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-3">Sign in to write a review</p>
                        <Link to={`/login?redirect=/product/${product._id}`}
                          className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Shipping & Returns" && (
              <motion.div key="shipping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: Truck, title: "Free Shipping", desc: "Free standard shipping on all orders over ₹35. Delivery within 5-7 business days.", color: "text-[#FF80C7]" },
                    { icon: RefreshCw, title: "Easy Returns", desc: "Not satisfied? Return within 30 days for a full refund. Products must be unopened and in original packaging.", color: "text-[#F97316]" },
                    { icon: Shield, title: "Quality Guarantee", desc: "All our products are vet-approved and tested for quality. If you find any defect, we'll replace it free of charge.", color: "text-[#38BDF8]" },
                    { icon: Clock, title: "Customer Support", desc: "Our pet experts are available 24/7 to answer your questions. Contact us via chat, email, or phone.", color: "text-[#16A34A]" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                      <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mb-4">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h4 className="font-bold text-[#1F2937] mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#1F2937]">Related Products</h2>
              <Link to="/shop" className="text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors text-sm">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp._id} to={`/product/${rp._id}`}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative aspect-square bg-[#F8FAFC]">
                      {rp.images?.[0] ? (
                        <img src={getImageUrl(rp.images[0])} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#FF80C7] font-semibold mb-1">{rp.category?.name || ""}</p>
                      <h3 className="font-semibold text-[#1F2937] text-sm line-clamp-1 group-hover:text-[#FF80C7] transition-colors">{rp.name}</h3>
                      <span className="font-bold text-[#1F2937]">₹{rp.price}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden z-40"
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1F2937] text-lg">₹{product.price}</p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
            )}
          </div>
          <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-50 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-[#1F2937]">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={product.stock <= 0}
            onClick={() => addItem(product, quantity)}
            className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            Add
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;
