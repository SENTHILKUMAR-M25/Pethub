import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Search, PawPrint, Loader2 } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../api/imageUtils";

const ImagePlaceholder = ({ className = "" }) => (
  <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
    <PawPrint className="w-12 h-12 text-gray-300" />
  </div>
);

const EmptyWishlist = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Heart className="w-10 h-10 text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-[#1F2937] mb-2">Your wishlist is empty</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Save items you love by clicking the heart icon on any product.
    </p>
    <Link
      to="/shop"
      className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-bold transition-colors"
    >
      Start Shopping
    </Link>
  </motion.div>
);

const WishlistItem = ({ product, onRemove }) => {
  const imageUrl = getImageUrl(product.images?.[0]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
    >
      <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ImagePlaceholder className="w-full h-full" />
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold">Out of Stock</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onRemove(product._id)}
            className="p-2.5 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Link
              to={`/product/${product._id}`}
              className="w-full bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              View Product
            </Link>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs text-[#FF80C7] font-semibold mb-1">{product.category?.name || ""}</p>
        <h3 className="font-semibold text-[#1F2937] mb-2 group-hover:text-[#FF80C7] transition-colors line-clamp-2">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-[#1F2937]">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Wishlist = () => {
  const { items, removeItem, loading: wishlistLoading } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((product) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.category?.name?.toLowerCase().includes(q) ||
      product.brand?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 sm:pt-24 pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <span className="text-[#1F2937] font-medium">Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F2937] mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-500">
                {items.length > 0
                  ? `You have ${items.length} item${items.length !== 1 ? "s" : ""} in your wishlist`
                  : "Save items you love for later"}
              </p>
            </div>

            {items.length > 0 && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E5E7EB] focus:border-[#FF80C7] focus:outline-none transition-colors bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <span className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {wishlistLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          items.length === 0 ? <EmptyWishlist /> : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">No items found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search query</p>
              <button
                onClick={() => setSearchQuery("")}
                className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((product) => (
                <WishlistItem
                  key={product._id}
                  product={product}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
