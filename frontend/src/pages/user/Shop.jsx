import { useState, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Grid3X3, List, SlidersHorizontal, X, ChevronDown, Star, 
  ShoppingCart, Heart, Eye, Check, PawPrint, ArrowUpDown,
  Filter, Search, Minus, Plus, Trash2
} from 'lucide-react';

// --- Mock Data ---
const PRODUCTS = [
  { id: 1, name: 'Premium Grain-Free Dog Food', price: 49.99, originalPrice: 64.99, rating: 4.8, reviews: 128, category: 'Dogs', subcategory: 'Food', brand: 'Royal Canin', tag: 'Best Seller', image: 'dog-food', inStock: true },
  { id: 2, name: 'Interactive Cat Toy Set', price: 24.99, originalPrice: null, rating: 4.9, reviews: 89, category: 'Cats', subcategory: 'Toys', brand: 'PetSafe', tag: 'New', image: 'cat-toy', inStock: true },
  { id: 3, name: 'Orthopedic Pet Bed - Large', price: 79.99, originalPrice: 99.99, rating: 4.7, reviews: 256, category: 'Dogs', subcategory: 'Beds', brand: 'Furhaven', tag: null, image: 'pet-bed', inStock: true },
  { id: 4, name: 'Organic Salmon Oil Supplement', price: 34.99, originalPrice: null, rating: 4.9, reviews: 412, category: 'Dogs', subcategory: 'Health', brand: 'Zesty Paws', tag: 'Popular', image: 'salmon-oil', inStock: true },
  { id: 5, name: 'Automatic Pet Feeder', price: 89.99, originalPrice: 119.99, rating: 4.6, reviews: 78, category: 'Cats', subcategory: 'Accessories', brand: 'Petlibro', tag: 'Sale', image: 'feeder', inStock: true },
  { id: 6, name: 'Bird Cage Starter Kit', price: 129.99, originalPrice: null, rating: 4.5, reviews: 45, category: 'Birds', subcategory: 'Cages', brand: 'Prevue', tag: null, image: 'bird-cage', inStock: false },
  { id: 7, name: 'Rabbit Timothy Hay Bundle', price: 18.99, originalPrice: 24.99, rating: 4.8, reviews: 203, category: 'Small Pets', subcategory: 'Food', brand: 'Oxbow', tag: 'Best Seller', image: 'hay', inStock: true },
  { id: 8, name: 'Dog Chew Bone Variety Pack', price: 29.99, originalPrice: null, rating: 4.7, reviews: 567, category: 'Dogs', subcategory: 'Treats', brand: 'Milk-Bone', tag: null, image: 'chew-bone', inStock: true },
  { id: 9, name: 'Cat Scratching Post Deluxe', price: 54.99, originalPrice: 69.99, rating: 4.6, reviews: 134, category: 'Cats', subcategory: 'Furniture', brand: 'SmartCat', tag: 'Sale', image: 'scratch-post', inStock: true },
  { id: 10, name: 'Aquarium Filter System', price: 45.99, originalPrice: null, rating: 4.4, reviews: 89, category: 'Fish', subcategory: 'Equipment', brand: 'Fluval', tag: null, image: 'filter', inStock: true },
  { id: 11, name: 'Dog Training Clicker Set', price: 12.99, originalPrice: null, rating: 4.5, reviews: 312, category: 'Dogs', subcategory: 'Training', brand: 'PetCo', tag: 'New', image: 'clicker', inStock: true },
  { id: 12, name: 'Premium Cat Litter - 40lb', price: 32.99, originalPrice: 39.99, rating: 4.8, reviews: 890, category: 'Cats', subcategory: 'Supplies', brand: 'Dr. Elsey\'s', tag: 'Popular', image: 'litter', inStock: true },
];

const CATEGORIES = ['All', 'Dogs', 'Cats', 'Birds', 'Small Pets', 'Fish'];
const BRANDS = ['Royal Canin', 'PetSafe', 'Furhaven', 'Zesty Paws', 'Petlibro', 'Prevue', 'Oxbow', 'Milk-Bone', 'SmartCat', 'Fluval'];
const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: Infinity },
];

// --- Components ---

const ImagePlaceholder = ({ icon: Icon, className = "" }) => (
  <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
    <Icon className="w-16 h-16 text-gray-300" />
  </div>
);

const StarRating = ({ rating, reviews, size = "sm" }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
        />
      ))}
    </div>
    <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500`}>({reviews})</span>
  </div>
);

const TagBadge = ({ tag }) => {
  const colors = {
    'Best Seller': 'bg-[#F97316] text-white',
    'New': 'bg-[#38BDF8] text-white',
    'Popular': 'bg-[#22C55E] text-white',
    'Sale': 'bg-red-500 text-white',
  };
  return tag ? (
    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${colors[tag] || 'bg-gray-800 text-white'}`}>
      {tag}
    </span>
  ) : null;
};

// --- Quick View Modal ---
const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-square bg-[#F8FAFC]">
            <ImagePlaceholder icon={PawPrint} className="w-full h-full" />
            <TagBadge tag={product.tag} />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Side */}
          <div className="p-8 md:p-10 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-[#22C55E] font-semibold mb-1">{product.category} • {product.brand}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{product.name}</h2>
              </div>
              <button 
                onClick={onClose}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={product.rating} reviews={product.reviews} size="md" />
              <span className="text-sm text-[#22C55E] font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> In Stock
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-3xl font-bold text-[#1F2937]">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-bold text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded-lg">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              Give your pet the best with this premium quality product. Specially formulated 
              and vet-approved for optimal health and happiness. Made with natural ingredients 
              and designed for maximum comfort.
            </p>

            <div className="space-y-4 mt-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-[#1F2937]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onAddToCart(product, quantity); onClose(); }}
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#22C55E]/25 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3.5 rounded-xl border-2 transition-all ${isWishlisted ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]' : 'border-[#E5E7EB] hover:border-[#F97316] text-gray-400 hover:text-[#F97316]'}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Product Card (Grid) ---
const ProductCardGrid = ({ product, onQuickView, onAddToCart }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -6 }}
    className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#22C55E]/5 transition-all duration-300"
  >
    <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
      <ImagePlaceholder icon={PawPrint} className="w-full h-full" />
      <TagBadge tag={product.tag} />
      
      {!product.inStock && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold">Out of Stock</span>
        </div>
      )}

      {/* Hover Actions */}
      <div className="absolute inset-x-0 top-4 flex justify-end px-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuickView(product)}
          className="p-2.5 bg-white rounded-full shadow-lg text-[#1F2937] hover:text-[#22C55E] transition-colors"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2.5 bg-white rounded-full shadow-lg text-[#1F2937] hover:text-[#F97316] transition-colors"
        >
          <Heart className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Add to Cart Overlay */}
      {product.inStock && (
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product, 1)}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      )}
    </div>

    <div className="p-5">
      <p className="text-xs text-[#22C55E] font-semibold mb-1">{product.category}</p>
      <h3 className="font-semibold text-[#1F2937] mb-2 group-hover:text-[#22C55E] transition-colors line-clamp-2">
        {product.name}
      </h3>
      <StarRating rating={product.rating} reviews={product.reviews} />
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xl font-bold text-[#1F2937]">${product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Product Card (List) ---
const ProductCardList = ({ product, onQuickView, onAddToCart }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    whileHover={{ x: 4 }}
    className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:shadow-lg hover:shadow-[#22C55E]/5 transition-all duration-300 flex gap-6"
  >
    <div className="relative w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-[#F8FAFC]">
      <ImagePlaceholder icon={PawPrint} className="w-full h-full" />
      <TagBadge tag={product.tag} />
      {!product.inStock && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span>
        </div>
      )}
    </div>

    <div className="flex-1 flex flex-col justify-between py-2">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm text-[#22C55E] font-semibold mb-1">{product.category} • {product.brand}</p>
            <h3 className="text-xl font-bold text-[#1F2937] group-hover:text-[#22C55E] transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onQuickView(product)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Eye className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        <StarRating rating={product.rating} reviews={product.reviews} size="md" />
        <p className="text-gray-600 mt-3 line-clamp-2">
          Premium quality product for your beloved pet. Vet-approved and made with the finest ingredients.
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#1F2937]">${product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
          )}
        </div>
        
        {product.inStock ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart(product, 1)}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-[#22C55E]/20"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        ) : (
          <span className="text-gray-400 font-medium px-6 py-2.5">Out of Stock</span>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Filter Sidebar ---
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E5E7EB] last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-bold text-[#1F2937]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Shop Page ---
const Shop = () => {
  const { category: urlCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        return selectedPriceRanges.some(range => 
          p.price >= range.min && p.price < range.max
        );
      });
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'reviews': result.sort((a, b) => b.reviews - a.reviews); break;
      default: break; // featured - keep original order
    }

    return result;
  }, [selectedCategory, selectedBrands, selectedPriceRanges, searchQuery, sortBy]);

  const activeFiltersCount = selectedBrands.length + selectedPriceRanges.length + (selectedCategory !== 'All' ? 1 : 0);

  const handleAddToCart = (product, quantity) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      {/* Cart Notification */}
      <AnimatePresence>
        {showCartNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-[#1F2937] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-[#22C55E]" />
            <span className="font-medium">Added to cart! ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal 
            product={quickViewProduct} 
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#22C55E] transition-colors">Home</Link>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className="text-[#1F2937] font-medium">Shop</span>
            {selectedCategory !== 'All' && (
              <>
                <ChevronDown className="w-3 h-3 -rotate-90" />
                <span className="text-[#22C55E] font-medium">{selectedCategory}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-2">
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
              </h1>
              <p className="text-gray-500">Showing {filteredProducts.length} premium products for your pets</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E5E7EB] focus:border-[#22C55E] focus:outline-none transition-colors bg-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#1F2937] flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-[#F97316] hover:text-[#16A34A] font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <FilterSection title="Categories">
                <div className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedCategory === cat ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB] group-hover:border-[#22C55E]'}`}>
                        {selectedCategory === cat && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input 
                        type="radio" 
                        name="category" 
                        className="hidden"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span className={`text-sm ${selectedCategory === cat ? 'font-semibold text-[#22C55E]' : 'text-gray-600'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="space-y-2">
                  {PRICE_RANGES.map(range => (
                    <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedPriceRanges.includes(range) ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB] group-hover:border-[#22C55E]'}`}>
                        {selectedPriceRanges.includes(range) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedPriceRanges.includes(range)}
                        onChange={() => togglePriceRange(range)}
                      />
                      <span className={`text-sm ${selectedPriceRanges.includes(range) ? 'font-semibold text-[#22C55E]' : 'text-gray-600'}`}>{range.label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Brands */}
              <FilterSection title="Brands">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {BRANDS.map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB] group-hover:border-[#22C55E]'}`}>
                        {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                      />
                      <span className={`text-sm ${selectedBrands.includes(brand) ? 'font-semibold text-[#22C55E]' : 'text-gray-600'}`}>{brand}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1" ref={ref}>
            {/* Toolbar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] font-medium hover:border-[#22C55E] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-[#22C55E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <span className="text-sm text-gray-500 hidden sm:block">
                  {filteredProducts.length} results
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-[#1F2937] focus:outline-none focus:border-[#22C55E] cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex border-2 border-[#E5E7EB] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#22C55E] text-white' : 'bg-white text-gray-400 hover:text-[#22C55E]'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#22C55E] text-white' : 'bg-white text-gray-400 hover:text-[#22C55E]'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-sm font-medium">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="hover:bg-[#22C55E]/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full text-sm font-medium">
                    {brand}
                    <button onClick={() => toggleBrand(brand)} className="hover:bg-[#38BDF8]/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedPriceRanges.map(range => (
                  <span key={range.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F97316]/10 text-[#F97316] rounded-full text-sm font-medium">
                    {range.label}
                    <button onClick={() => togglePriceRange(range)} className="hover:bg-[#F97316]/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </motion.div>
            )}

            {/* Products Grid/List */}
            <motion.div
              layout
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCardGrid 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <ProductCardList 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                    />
                  )
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button 
                  onClick={clearFilters}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}

            {/* Load More */}
            {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white border-2 border-[#E5E7EB] hover:border-[#22C55E] text-[#1F2937] hover:text-[#22C55E] px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Load More Products
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[320px] bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#1F2937]">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Mobile Categories */}
                <div>
                  <h4 className="font-bold text-[#1F2937] mb-3">Categories</h4>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedCategory === cat ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB]'}`}>
                          {selectedCategory === cat && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input type="radio" name="mobile-category" className="hidden" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
                        <span className="text-sm text-gray-600">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div>
                  <h4 className="font-bold text-[#1F2937] mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {PRICE_RANGES.map(range => (
                      <label key={range.label} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedPriceRanges.includes(range) ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB]'}`}>
                          {selectedPriceRanges.includes(range) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedPriceRanges.includes(range)} onChange={() => togglePriceRange(range)} />
                        <span className="text-sm text-gray-600">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Brands */}
                <div>
                  <h4 className="font-bold text-[#1F2937] mb-3">Brands</h4>
                  <div className="space-y-2">
                    {BRANDS.map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedBrands.includes(brand) ? 'bg-[#22C55E] border-[#22C55E]' : 'border-[#E5E7EB]'}`}>
                          {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                        <span className="text-sm text-gray-600">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#E5E7EB] space-y-3 sticky bottom-0 bg-white">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-[#22C55E] text-white py-3 rounded-xl font-bold"
                >
                  Show {filteredProducts.length} Results
                </button>
                <button 
                  onClick={clearFilters}
                  className="w-full border-2 border-[#E5E7EB] text-gray-600 py-3 rounded-xl font-semibold"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;