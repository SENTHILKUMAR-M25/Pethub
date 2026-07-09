import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, X, Check, Loader2, Star, MessageSquare, ChevronLeft, ChevronRight,
  Eye, User, Clock,
} from "lucide-react";
import { getAllReviews, deleteReview } from "../../api/reviewService";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setDeleteConfirmId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = deleteConfirmId ? "hidden" : "unset";
  }, [deleteConfirmId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews({ page, limit: 20 });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      setDeleteConfirmId(null);
      await fetchReviews();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#FF80C7]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Reviews</h1>
        </div>
        <p className="text-gray-500 ml-[52px]">Manage all product reviews • {total} total</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="w-20 h-20 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-[#FF80C7]" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">No reviews yet</h3>
          <p className="text-gray-500">No reviews have been submitted yet</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} initial="hidden" animate="visible"
            className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reviewer</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Comment</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {reviews.map((review) => (
                      <motion.tr key={review._id} variants={itemVariants} layout
                        className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#FF80C7]/10 flex items-center justify-center text-[#FF80C7] font-bold text-xs flex-shrink-0">
                              {(review.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#1F2937] truncate">{review.user?.name || "Deleted User"}</p>
                              <p className="text-xs text-gray-400 truncate">{review.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] flex-shrink-0">
                              {review.product?.images?.[0] ? (
                                <img src={review.product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Star className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#1F2937] truncate max-w-[150px]">
                              {review.product?.name || "Deleted Product"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm text-gray-500 truncate max-w-[250px]">{review.comment}</p>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(review.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirmId(review._id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete review">
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
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Delete Review?</h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The review will be permanently removed.
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
