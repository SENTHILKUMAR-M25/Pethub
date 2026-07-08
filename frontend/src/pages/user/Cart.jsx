import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft, 
  Truck, Shield, Heart, Package, Gift, Tag, AlertCircle,
  PawPrint, MapPin, CreditCard, ChevronRight, X, Check
} from 'lucide-react';

// --- Mock Cart Data (In real app, this comes from global state/context) ---
const INITIAL_CART = [
  { id: 1, name: 'Premium Grain-Free Dog Food', price: 49.99, originalPrice: 64.99, quantity: 2, image: 'dog-food', category: 'Dogs', weight: '25 lbs', inStock: true },
  { id: 2, name: 'Interactive Cat Toy Set', price: 24.99, quantity: 1, image: 'cat-toy', category: 'Cats', weight: '1.2 lbs', inStock: true },
  { id: 4, name: 'Organic Salmon Oil Supplement', price: 34.99, quantity: 1, image: 'salmon-oil', category: 'Dogs', weight: '16 oz', inStock: true },
  { id: 7, name: 'Rabbit Timothy Hay Bundle', price: 18.99, originalPrice: 24.99, quantity: 3, image: 'hay', category: 'Small Pets', weight: '5 lbs', inStock: true },
];

const SAVED_ITEMS = [
  { id: 3, name: 'Orthopedic Pet Bed - Large', price: 79.99, originalPrice: 99.99, image: 'pet-bed', category: 'Dogs' },
  { id: 9, name: 'Cat Scratching Post Deluxe', price: 54.99, originalPrice: 69.99, image: 'scratch-post', category: 'Cats' },
];

const COUPONS = [
  { code: 'PETLOVE15', discount: 0.15, type: 'percent', minOrder: 50, description: '15% off orders over $50' },
  { code: 'FREESHIP', discount: 0, type: 'shipping', minOrder: 35, description: 'Free shipping on orders over $35' },
  { code: 'SAVE10', discount: 10, type: 'fixed', minOrder: 0, description: '$10 off any order' },
];

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, time: '5-7 business days', icon: Truck },
  { id: 'express', name: 'Express Shipping', price: 12.99, time: '2-3 business days', icon: Package },
  { id: 'priority', name: 'Priority Shipping', price: 19.99, time: '1-2 business days', icon: Gift },
];

// --- Components ---

const ImagePlaceholder = ({ icon: Icon, className = "" }) => (
  <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
    <Icon className="w-8 h-8 text-gray-300" />
  </div>
);

const EmptyCart = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="w-32 h-32 bg-[#FF80C7]/10 rounded-full flex items-center justify-center mx-auto mb-8"
    >
      <ShoppingCart className="w-16 h-16 text-[#FF80C7]" />
    </motion.div>
    <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Your cart is empty</h2>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">
      Looks like you haven't added anything to your cart yet. Explore our products and find something your pet will love!
    </p>
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link 
        to="/shop" 
        className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[#FF80C7]/25 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Continue Shopping
      </Link>
    </motion.div>
  </motion.div>
);

const CartItem = ({ item, onUpdateQuantity, onRemove, onMoveToSaved }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.id), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? 100 : 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-shadow"
    >
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#F8FAFC]">
        <ImagePlaceholder icon={PawPrint} className="w-full h-full" />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#FF80C7] font-semibold mb-1">{item.category}</p>
            <h3 className="font-bold text-[#1F2937] mb-1 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.weight}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg text-[#1F2937]">${(item.price * item.quantity).toFixed(2)}</p>
            {item.originalPrice && (
              <p className="text-sm text-gray-400 line-through">
                ${(item.originalPrice * item.quantity).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4 text-[#1F2937]" />
              </motion.button>
              <span className="w-10 text-center font-bold text-[#1F2937]">{item.quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="p-2 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#1F2937]" />
              </motion.button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onMoveToSaved(item)}
                className="p-2 text-gray-400 hover:text-[#F97316] transition-colors"
                title="Save for later"
              >
                <Heart className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Unit Price */}
          <p className="text-sm text-gray-500">
            ${item.price} each
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const SavedItem = ({ item, onMoveToCart, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-[#E5E7EB]/50"
  >
    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
      <ImagePlaceholder icon={PawPrint} className="w-full h-full" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[#1F2937] text-sm truncate">{item.name}</h4>
      <p className="text-[#FF80C7] font-bold text-sm">${item.price}</p>
    </div>
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onMoveToCart(item)}
        className="px-4 py-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-lg text-sm font-semibold transition-colors"
      >
        Move to Cart
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(item.id)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </div>
  </motion.div>
);

// --- Main Cart Page ---
const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [savedItems, setSavedItems] = useState(SAVED_ITEMS);
  const [shippingOption, setShippingOption] = useState('standard');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 35 && appliedCoupon?.type === 'shipping' ? 0 : SHIPPING_OPTIONS.find(s => s.id === shippingOption).price;
  const discountAmount = appliedCoupon 
    ? appliedCoupon.type === 'percent' 
      ? subtotal * appliedCoupon.discount 
      : appliedCoupon.type === 'fixed' 
        ? appliedCoupon.discount 
        : 0
    : 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);
  const totalSavings = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0
  ) + discountAmount;

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const moveToSaved = (item) => {
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    setSavedItems(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const moveToCart = (item) => {
    setSavedItems(prev => prev.filter(i => i.id !== item.id));
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      setCartItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCartItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const removeSaved = (id) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    const coupon = COUPONS.find(c => c.code === couponCode.toUpperCase());
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (subtotal < coupon.minOrder) {
      setCouponError(`Minimum order of $${coupon.minOrder} required`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError('');
    setCouponCode('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      navigate('/checkout');
    }, 1500);
  };

  if (cartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-[#FF80C7] transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1F2937] font-medium">Cart</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-[#1F2937] flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-[#FF80C7]" />
              Shopping Cart
              <span className="text-2xl text-gray-400 font-normal">({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
            </h1>
            <Link 
              to="/shop" 
              className="hidden sm:flex items-center gap-2 text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <AnimatePresence mode="popLayout">
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <CartItem 
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      onMoveToSaved={moveToSaved}
                    />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center"
                >
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link 
                    to="/shop" 
                    className="text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-6"
              >
                <h2 className="text-xl font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#F97316]" />
                  Saved for Later ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {savedItems.map(item => (
                      <SavedItem 
                        key={item.id}
                        item={item}
                        onMoveToCart={moveToCart}
                        onRemove={removeSaved}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'Over $35' },
                { icon: Shield, title: 'Secure Payment', desc: '256-bit SSL' },
                { icon: Package, title: 'Easy Returns', desc: '30 days' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center"
                >
                  <badge.icon className="w-6 h-6 text-[#FF80C7] mx-auto mb-2" />
                  <p className="font-semibold text-sm text-[#1F2937]">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-[#1F2937] mb-6">Order Summary</h2>

                {/* Shipping Options */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FF80C7]" />
                    Shipping Method
                  </p>
                  {SHIPPING_OPTIONS.map(option => (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShippingOption(option.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        shippingOption === option.id 
                          ? 'border-[#FF80C7] bg-[#FF80C7]/5' 
                          : 'border-[#E5E7EB] hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        shippingOption === option.id ? 'border-[#FF80C7]' : 'border-gray-300'
                      }`}>
                        {shippingOption === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FF80C7]" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm text-[#1F2937]">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.time}</p>
                      </div>
                      <span className="font-bold text-sm text-[#1F2937]">
                        {subtotal >= 35 && appliedCoupon?.type === 'shipping' && option.id === 'standard' 
                          ? 'FREE' 
                          : `$${option.price}`
                        }
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#F97316]" />
                    Promo Code
                  </p>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#FF80C7] uppercase"
                        onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={applyCoupon}
                        className="px-4 py-2.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#1F2937] hover:border-[#FF80C7] hover:text-[#FF80C7] transition-colors"
                      >
                        Apply
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-[#FF80C7]/10 rounded-xl border border-[#FF80C7]/20">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#FF80C7]" />
                        <span className="font-semibold text-[#FF80C7] text-sm">{appliedCoupon.code}</span>
                        <span className="text-xs text-[#FF80C7]/70">
                          {appliedCoupon.type === 'percent' ? `-${(appliedCoupon.discount * 100).toFixed(0)}%` : `-$${appliedCoupon.discount}`}
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </motion.p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-[#1F2937]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-[#1F2937]">
                      {shippingCost === 0 ? <span className="text-[#FF80C7]">FREE</span> : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#FF80C7]">Discount</span>
                      <span className="font-medium text-[#FF80C7]">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#F97316]">You Save</span>
                      <span className="font-medium text-[#F97316]">${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-[#1F2937]">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#1F2937]">${total.toFixed(2)}</span>
                    <p className="text-xs text-gray-500">Including tax</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                  className="w-full bg-[#FF80C7] hover:bg-[#16A34A] disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#FF80C7]/25 transition-colors disabled:shadow-none"
                >
                  {isCheckingOut ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </motion.div>

              {/* Free Shipping Progress */}
              {subtotal < 35 && cartItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-[#FF80C7]/10 to-[#38BDF8]/10 rounded-2xl border border-[#FF80C7]/20 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-[#FF80C7]" />
                    <span className="font-bold text-[#1F2937]">Free Shipping Available!</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Add <span className="font-bold text-[#FF80C7]">${(35 - subtotal).toFixed(2)}</span> more for free standard shipping
                  </p>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 35) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#FF80C7] to-[#38BDF8] rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{((subtotal / 35) * 100).toFixed(0)}% progress</p>
                </motion.div>
              )}

              {/* Need Help */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h3 className="font-bold text-[#1F2937] mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#38BDF8]" />
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your order? Our pet experts are here to help!
                </p>
                <Link 
                  to="/contact" 
                  className="text-sm font-semibold text-[#FF80C7] hover:text-[#16A34A] transition-colors"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;