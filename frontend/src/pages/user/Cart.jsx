// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft,
//   Truck, Shield, Heart, Package, Tag, AlertCircle, X, Check,
//   ChevronRight, CreditCard, MapPin, Percent, Clock, Star,
// } from "lucide-react";
// import { useCart } from "../../context/CartContext";
// import { useAuth } from "../../context/AuthContext";

// const SHIPPING_OPTIONS = [
//   { id: "standard", name: "Standard Shipping", price: 5.99, time: "5-7 business days" },
//   { id: "express", name: "Express Shipping", price: 12.99, time: "2-3 business days" },
//   { id: "priority", name: "Priority Shipping", price: 19.99, time: "1-2 business days" },
// ];

// const COUPONS = [
//   { code: "PETLOVE15", discount: 0.15, type: "percent", minOrder: 50, desc: "15% off orders over ₹50" },
//   { code: "FREESHIP", discount: 0, type: "shipping", minOrder: 35, desc: "Free shipping over ₹35" },
//   { code: "SAVE10", discount: 10, type: "fixed", minOrder: 0, desc: "₹10 off any order" },
// ];

// function getImageUrl(item) {
//   const img = item.images?.[0];
//   if (!img) return null;
//   if (img.startsWith("http")) return img;
//   return `${import.meta.env.VITE_IMAGE_URL}${img}`;
// }

// function getCategoryName(item) {
//   if (!item.category) return "";
//   return typeof item.category === "object" ? item.category.name : item.category;
// }

// function EmptyCart({ onStartShopping }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="text-center py-16 md:py-24 px-4"
//     >
//       <motion.div
//         animate={{ y: [0, -12, 0] }}
//         transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
//         className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#FF80C7]/20 to-pink-100 flex items-center justify-center"
//       >
//         <ShoppingCart className="w-14 h-14 md:w-20 md:h-20 text-[#FF80C7]" />
//       </motion.div>
//       <h2 className="text-2xl md:text-4xl font-bold text-[#1F2937] mb-3">
//         Your cart is empty
//       </h2>
//       <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
//         Looks like you haven&apos;t added anything yet. Explore our
//         pet products and find something your furry friend will love!
//       </p>
//       <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
//         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//           <Link
//             to="/shop"
//             className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#FF80C7]/25 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Start Shopping
//           </Link>
//         </motion.div>
//         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//           <Link
//             to="/"
//             className="inline-flex items-center gap-2 border-2 border-[#E5E7EB] text-[#1F2937] px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors"
//           >
//             Go Home
//           </Link>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }

// function CartItem({ item, onUpdateQuantity, onRemove }) {
//   const [isRemoving, setIsRemoving] = useState(false);
//   const imgUrl = getImageUrl(item);
//   const catName = getCategoryName(item);

//   const handleRemove = () => {
//     setIsRemoving(true);
//     setTimeout(() => onRemove(item._id), 300);
//   };

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? 80 : 0 }}
//       exit={{ opacity: 0, x: 80 }}
//       transition={{ duration: 0.3 }}
//       className="flex gap-3 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-shadow"
//     >
//       {/* Image */}
//       <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#F8FAFC] flex-shrink-0">
//         {imgUrl ? (
//           <img
//             src={imgUrl}
//             alt={item.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
//             <Package className="w-8 h-8 text-gray-300" />
//           </div>
//         )}
//       </div>

//       {/* Details */}
//       <div className="flex-1 min-w-0 flex flex-col justify-between">
//         <div>
//           {catName && (
//             <p className="text-[10px] sm:text-xs font-semibold text-[#FF80C7] uppercase tracking-wider mb-0.5">
//               {catName}
//             </p>
//           )}
//           <h3 className="text-sm sm:text-base font-bold text-[#1F2937] truncate pr-2">
//             {item.name}
//           </h3>
//           <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
//             ${item.price.toFixed(2)} each
//           </p>
//         </div>

//         <div className="flex items-center justify-between mt-3 sm:mt-4">
//           {/* Qty selector */}
//           <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl bg-white">
//             <motion.button
//               whileTap={{ scale: 0.9 }}
//               onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
//               disabled={item.quantity <= 1}
//               className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors disabled:opacity-30"
//             >
//               <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1F2937]" />
//             </motion.button>
//             <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-bold text-[#1F2937] select-none">
//               {item.quantity}
//             </span>
//             <motion.button
//               whileTap={{ scale: 0.9 }}
//               onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
//               className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
//             >
//               <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1F2937]" />
//             </motion.button>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-1">
//             {item.originalPrice && item.originalPrice > item.price && (
//               <span className="hidden sm:inline text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
//                 {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
//               </span>
//             )}
//             <motion.button
//               whileHover={{ scale: 1.15 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={handleRemove}
//               className="p-1.5 sm:p-2 text-gray-300 hover:text-red-500 transition-colors"
//               title="Remove item"
//             >
//               <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
//             </motion.button>
//           </div>
//         </div>
//       </div>

//       {/* Desktop price column */}
//       <div className="hidden sm:flex flex-col items-end justify-between flex-shrink-0 min-w-[90px]">
//         <p className="text-lg font-bold text-[#1F2937]">
//           ${(item.price * item.quantity).toFixed(2)}
//         </p>
//         {item.originalPrice && item.originalPrice > item.price && (
//           <p className="text-xs text-gray-400 line-through">
//             ${(item.originalPrice * item.quantity).toFixed(2)}
//           </p>
//         )}
//       </div>

//       {/* Mobile price at bottom */}
//       <div className="sm:hidden absolute bottom-4 right-4">
//         <p className="text-sm font-bold text-[#1F2937]">
//           ${(item.price * item.quantity).toFixed(2)}
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// export default function Cart() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { items: cartItems, itemCount, updateQuantity, removeItem, clearCart, loading } = useCart();
//   const [shippingOption, setShippingOption] = useState("standard");
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [couponMsg, setCouponMsg] = useState("");
//   const [isCheckingOut, setIsCheckingOut] = useState(false);

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === shippingOption);
//   const shippingCost =
//     subtotal >= 35 && appliedCoupon?.type === "shipping"
//       ? 0
//       : selectedShipping?.price || 0;
//   const discountAmount = appliedCoupon
//     ? appliedCoupon.type === "percent"
//       ? subtotal * appliedCoupon.discount
//       : appliedCoupon.type === "fixed"
//         ? appliedCoupon.discount
//         : 0
//     : 0;
//   const tax = (subtotal - discountAmount) * 0.08;
//   const total = Math.max(0, subtotal + shippingCost - discountAmount + tax);
//   const totalSavings = cartItems.reduce(
//     (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
//     0
//   ) + discountAmount;

//   const applyCoupon = () => {
//     const coupon = COUPONS.find((c) => c.code === couponCode.toUpperCase());
//     if (!coupon) {
//       setCouponMsg("Invalid coupon code");
//       setAppliedCoupon(null);
//       return;
//     }
//     if (subtotal < coupon.minOrder) {
//       setCouponMsg(`Minimum order of $${coupon.minOrder} required`);
//       setAppliedCoupon(null);
//       return;
//     }
//     setAppliedCoupon(coupon);
//     setCouponMsg(`Coupon "${coupon.code}" applied!`);
//     setCouponCode("");
//   };

//   const removeCoupon = () => {
//     setAppliedCoupon(null);
//     setCouponMsg("");
//   };

//   const handleCheckout = () => {
//     setIsCheckingOut(true);
//     setTimeout(() => navigate("/checkout"), 1200);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
//         <div className="w-10 h-10 border-4 border-[#FF80C7] border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <EmptyCart />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Breadcrumb */}
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-5"
//         >
//           <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
//           <ChevronRight className="w-3 h-3" />
//           <Link to="/shop" className="hover:text-[#FF80C7] transition-colors">Shop</Link>
//           <ChevronRight className="w-3 h-3" />
//           <span className="text-[#1F2937] font-semibold">Cart</span>
//         </motion.div>

//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
//         >
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#FF80C7]/10 rounded-2xl flex items-center justify-center">
//               <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-[#FF80C7]" />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-4xl font-bold text-[#1F2937]">
//                 Shopping Cart
//               </h1>
//               <p className="text-xs sm:text-sm text-gray-500">
//                 {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {cartItems.length > 0 && (
//               <button
//                 onClick={clearCart}
//                 className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl border border-[#E5E7EB] hover:border-red-200"
//               >
//                 <Trash2 className="w-3.5 h-3.5" />
//                 Clear All
//               </button>
//             )}
//             <Link
//               to="/shop"
//               className="hidden sm:inline-flex items-center gap-2 text-sm text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Continue Shopping
//             </Link>
//           </div>
//         </motion.div>

//         {/* Cart indicator for non-logged-in users */}
//         {!user && (
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm text-amber-700"
//           >
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             Your cart is saved on this device.{" "}
//             <Link to="/login" className="font-semibold underline hover:text-amber-800">
//               Sign in
//             </Link>{" "}
//             to sync across devices.
//           </motion.div>
//         )}

//         <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
//           {/* ---- Cart Items ---- */}
//           <div className="lg:col-span-2 space-y-5">
//             <AnimatePresence mode="popLayout">
//               {cartItems.map((item) => (
//                 <CartItem
//                   key={item._id}
//                   item={item}
//                   onUpdateQuantity={updateQuantity}
//                   onRemove={removeItem}
//                 />
//               ))}
//             </AnimatePresence>

//             {/* Mobile Continue Shopping */}
//             <div className="lg:hidden">
//               <Link
//                 to="/shop"
//                 className="inline-flex items-center gap-2 text-sm text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Continue Shopping
//               </Link>
//             </div>

//             {/* Trust badges */}
//             <div className="grid grid-cols-3 gap-3 sm:gap-4">
//               {[
//                 { icon: Truck, title: "Free Shipping", desc: "Over ₹35" },
//                 { icon: Shield, title: "Secure", desc: "256-bit SSL" },
//                 { icon: Package, title: "Easy Returns", desc: "30 days" },
//               ].map((badge, i) => (
//                 <motion.div
//                   key={i}
//                   whileHover={{ y: -3 }}
//                   className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4 text-center"
//                 >
//                   <badge.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF80C7] mx-auto mb-1.5" />
//                   <p className="font-semibold text-[10px] sm:text-sm text-[#1F2937]">{badge.title}</p>
//                   <p className="text-[10px] sm:text-xs text-gray-500">{badge.desc}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>

//           {/* ---- Summary Sidebar ---- */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-28 space-y-5">
//               {/* Summary Card */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.15 }}
//                 className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm"
//               >
//                 <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] mb-5">
//                   Order Summary
//                 </h2>

//                 {/* Shipping selector */}
//                 <div className="mb-5">
//                   <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
//                     <Truck className="w-4 h-4 text-[#FF80C7]" />
//                     Shipping
//                   </p>
//                   <div className="space-y-2">
//                     {SHIPPING_OPTIONS.map((opt) => (
//                       <label
//                         key={opt.id}
//                         className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all ${
//                           shippingOption === opt.id
//                             ? "border-[#FF80C7] bg-[#FF80C7]/5"
//                             : "border-[#E5E7EB] hover:border-gray-300"
//                         }`}
//                       >
//                         <input
//                           type="radio"
//                           name="shipping"
//                           value={opt.id}
//                           checked={shippingOption === opt.id}
//                           onChange={() => setShippingOption(opt.id)}
//                           className="accent-[#FF80C7]"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs sm:text-sm font-semibold text-[#1F2937] truncate">
//                             {opt.name}
//                           </p>
//                           <p className="text-[10px] sm:text-xs text-gray-500">{opt.time}</p>
//                         </div>
//                         <span className="text-xs sm:text-sm font-bold text-[#1F2937] flex-shrink-0">
//                           {shippingCost === 0 && opt.id === "standard"
//                             ? "FREE"
//                             : `₹${opt.price.toFixed(2)}`}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Coupon */}
//                 <div className="mb-5">
//                   <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//                     <Tag className="w-4 h-4 text-[#F97316]" />
//                     Promo Code
//                   </p>
//                   {!appliedCoupon ? (
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={couponCode}
//                         onChange={(e) => { setCouponCode(e.target.value); setCouponMsg(""); }}
//                         placeholder="Enter code"
//                         className="flex-1 px-3 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FF80C7] uppercase transition-colors"
//                         onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
//                       />
//                       <button
//                         onClick={applyCoupon}
//                         className="px-3 sm:px-4 py-2.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#1F2937] hover:border-[#FF80C7] hover:text-[#FF80C7] transition-colors"
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="flex items-center justify-between p-2.5 sm:p-3 bg-[#FF80C7]/10 rounded-xl border border-[#FF80C7]/20">
//                       <div className="flex items-center gap-2 min-w-0">
//                         <Check className="w-4 h-4 text-[#FF80C7] flex-shrink-0" />
//                         <span className="font-semibold text-[#FF80C7] text-xs sm:text-sm truncate">
//                           {appliedCoupon.code}
//                         </span>
//                         <span className="text-[10px] sm:text-xs text-[#FF80C7]/70 flex-shrink-0">
//                           {appliedCoupon.type === "percent"
//                             ? `-${(appliedCoupon.discount * 100).toFixed(0)}%`
//                             : appliedCoupon.type === "fixed"
//                               ? `-$${appliedCoupon.discount}`
//                               : "Free Ship"}
//                         </span>
//                       </div>
//                       <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 flex-shrink-0">
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                   {couponMsg && (
//                     <p
//                       className={`text-[10px] sm:text-xs mt-1.5 ${
//                         appliedCoupon ? "text-green-600" : "text-red-500"
//                       }`}
//                     >
//                       {couponMsg}
//                     </p>
//                   )}
//                 </div>

//                 {/* Price breakdown */}
//                 <div className="space-y-2.5 text-xs sm:text-sm border-t border-[#E5E7EB] pt-4">
//                   <div className="flex justify-between text-gray-600">
//                     <span>Subtotal</span>
//                     <span className="font-medium text-[#1F2937]">${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-gray-600">
//                     <span>Shipping</span>
//                     <span className="font-medium text-[#1F2937]">
//                       {shippingCost === 0 ? (
//                         <span className="text-green-600 font-semibold">FREE</span>
//                       ) : (
//                         `$${shippingCost.toFixed(2)}`
//                       )}
//                     </span>
//                   </div>
//                   {discountAmount > 0 && (
//                     <div className="flex justify-between text-green-600">
//                       <span>Discount</span>
//                       <span>-${discountAmount.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between text-gray-600">
//                     <span>Estimated Tax (8%)</span>
//                     <span className="font-medium text-[#1F2937]">${tax.toFixed(2)}</span>
//                   </div>
//                   {totalSavings > 0 && (
//                     <div className="flex justify-between text-[#F97316] border-t border-dashed border-[#E5E7EB] pt-2.5">
//                       <span className="flex items-center gap-1 text-xs">
//                         <Tag className="w-3 h-3" />
//                         You Save
//                       </span>
//                       <span className="font-semibold">${totalSavings.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB] mt-2">
//                     <span className="text-base sm:text-lg font-bold text-[#1F2937]">Total</span>
//                     <div className="text-right">
//                       <span className="text-xl sm:text-2xl font-bold text-[#1F2937]">
//                         ${total.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Checkout button */}
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleCheckout}
//                   disabled={cartItems.length === 0 || isCheckingOut}
//                   className="w-full mt-5 bg-[#FF80C7] hover:bg-[#16A34A] disabled:bg-gray-300 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#FF80C7]/25 transition-colors disabled:shadow-none"
//                 >
//                   {isCheckingOut ? (
//                     <motion.div
//                       animate={{ rotate: 360 }}
//                       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//                       className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
//                     />
//                   ) : (
//                     <>
//                       Proceed to Checkout
//                       <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                     </>
//                   )}
//                 </motion.button>

//                 <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
//                   <CreditCard className="w-3.5 h-3.5" />
//                   <span>Secure checkout</span>
//                 </div>
//               </motion.div>

//               {/* Free shipping progress */}
//               {subtotal < 35 && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="bg-gradient-to-r from-[#FF80C7]/10 to-blue-50 rounded-2xl border border-[#FF80C7]/20 p-5"
//                 >
//                   <div className="flex items-center gap-2 mb-2">
//                     <Truck className="w-5 h-5 text-[#FF80C7]" />
//                     <span className="font-bold text-sm text-[#1F2937]">Free Shipping</span>
//                   </div>
//                   <p className="text-xs text-gray-600 mb-3">
//                     Add <span className="font-bold text-[#FF80C7]">${(35 - subtotal).toFixed(2)}</span> more for free standard shipping
//                   </p>
//                   <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: `${Math.min((subtotal / 35) * 100, 100)}%` }}
//                       transition={{ duration: 0.8, ease: "easeOut" }}
//                       className="h-full bg-gradient-to-r from-[#FF80C7] to-[#38BDF8] rounded-full"
//                     />
//                   </div>
//                   <p className="text-[10px] text-gray-400 mt-1.5">
//                     {Math.min(((subtotal / 35) * 100).toFixed(0), 100)}% of goal reached
//                   </p>
//                 </motion.div>
//               )}

//               {/* Need help */}
//               <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
//                 <h3 className="font-bold text-sm text-[#1F2937] mb-2 flex items-center gap-2">
//                   <MapPin className="w-4 h-4 text-[#38BDF8]" />
//                   Need Help?
//                 </h3>
//                 <p className="text-xs text-gray-600 mb-3">
//                   Our pet experts are here for you.
//                 </p>
//                 <button className="text-xs font-semibold text-[#FF80C7] hover:text-[#16A34A] transition-colors">
//                   Contact Support &rarr;
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft,
  Truck, Shield, Heart, Package, Tag, AlertCircle, X, Check,
  ChevronRight, CreditCard, MapPin, Percent, Clock, Star,
  PawPrint, Sparkles, Loader2
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Shipping", price: 5.99, time: "5-7 business days" },
  { id: "express", name: "Express Shipping", price: 12.99, time: "2-3 business days" },
  { id: "priority", name: "Priority Shipping", price: 19.99, time: "1-2 business days" },
];

const COUPONS = [
  { code: "PETLOVE15", discount: 0.15, type: "percent", minOrder: 50, desc: "15% off orders over ₹50" },
  { code: "FREESHIP", discount: 0, type: "shipping", minOrder: 35, desc: "Free shipping over ₹35" },
  { code: "SAVE10", discount: 10, type: "fixed", minOrder: 0, desc: "₹10 off any order" },
];

function getImageUrl(item) {
  const img = item.images?.[0];
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${import.meta.env.VITE_IMAGE_URL}${img}`;
}

function getCategoryName(item) {
  if (!item.category) return "";
  return typeof item.category === "object" ? item.category.name : item.category;
}

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 md:py-24 px-4"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center"
      >
        <ShoppingCart className="w-14 h-14 md:w-20 md:h-20 text-[#22C55E]" />
      </motion.div>
      <h2 className="text-2xl md:text-4xl font-bold text-[#1F2937] mb-3">
        Your cart is empty
      </h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
        Looks like you haven't added anything yet. Explore our
        pet products and find something your furry friend will love!
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#22C55E]/25 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Start Shopping
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border-2 border-[#E5E7EB] text-[#1F2937] px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const imgUrl = getImageUrl(item);
  const catName = getCategoryName(item);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item._id), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isRemoving ? 0 : 1, x: isRemoving ? 80 : 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-5 bg-white rounded-2xl border border-[#E5E7EB] hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="w-full h-44 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#F8FAFC] flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {catName && (
            <p className="text-[10px] sm:text-xs font-semibold text-[#22C55E] uppercase tracking-wider mb-0.5">
              {catName}
            </p>
          )}
          <h3 className="text-sm sm:text-base font-bold text-[#1F2937] pr-2 hover:text-[#22C55E] transition-colors line-clamp-2">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            ₹{item.price.toFixed(2)} each
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-4 gap-3">
          {/* Qty selector */}
          <div className="flex items-center border-2 border-[#E5E7EB] rounded-xl bg-white">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1F2937]" />
            </motion.button>
            <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-bold text-[#1F2937] select-none">
              {item.quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="p-1.5 sm:p-2 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1F2937]" />
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="hidden sm:inline text-[10px] font-bold text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full">
                {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-1.5 sm:p-2 text-gray-300 hover:text-red-500 transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Desktop price column */}
      <div className="sm:flex flex-col items-end justify-between flex-shrink-0 min-w-[90px] hidden">
        <p className="text-lg font-bold text-[#1F2937]">
          ₹{(item.price * item.quantity).toFixed(2)}
        </p>
        {item.originalPrice && item.originalPrice > item.price && (
          <p className="text-xs text-gray-400 line-through">
            ₹{(item.originalPrice * item.quantity).toFixed(2)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, itemCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const [shippingOption, setShippingOption] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === shippingOption);
  const shippingCost =
    subtotal >= 35 && appliedCoupon?.type === "shipping"
      ? 0
      : selectedShipping?.price || 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotal * appliedCoupon.discount
      : appliedCoupon.type === "fixed"
        ? appliedCoupon.discount
        : 0
    : 0;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = Math.max(0, subtotal + shippingCost - discountAmount + tax);
  const totalSavings = cartItems.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity,
    0
  ) + discountAmount;

  const applyCoupon = () => {
    const coupon = COUPONS.find((c) => c.code === couponCode.toUpperCase());
    if (!coupon) {
      setCouponMsg("Invalid coupon code");
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < coupon.minOrder) {
      setCouponMsg(`Minimum order of ₹${coupon.minOrder} required`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponMsg(`Coupon "${coupon.code}" applied!`);
    setCouponCode("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMsg("");
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => navigate("/checkout"), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#22C55E] animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 sm:pt-24 pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-5"
        >
          <Link to="/" className="hover:text-[#22C55E] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[#22C55E] transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1F2937] font-semibold">Cart</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-[#22C55E]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#1F2937]">
                Shopping Cart
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cartItems.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl border border-[#E5E7EB] hover:border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </motion.button>
            )}
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-[#22C55E] font-semibold hover:text-[#16A34A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>

        {/* Cart indicator for non-logged-in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm text-amber-700"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Your cart is saved on this device.{" "}
            <Link to="/login" className="font-semibold underline hover:text-amber-800">
              Sign in
            </Link>{" "}
            to sync across devices.
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ---- Cart Items ---- */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>

            {/* Mobile Continue Shopping */}
            <div className="lg:hidden">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm text-[#22C55E] font-semibold hover:text-[#16A34A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Over ₹35" },
                { icon: Shield, title: "Secure", desc: "256-bit SSL" },
                { icon: Package, title: "Easy Returns", desc: "30 days" },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-4 text-center"
                >
                  <badge.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#22C55E] mx-auto mb-1.5" />
                  <p className="font-semibold text-[10px] sm:text-sm text-[#1F2937]">{badge.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{badge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ---- Summary Sidebar ---- */}
          <div className="lg:col-span-1">
            <div className="space-y-5 lg:sticky lg:top-28">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm"
              >
                <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F97316]" />
                  Order Summary
                </h2>

                {/* Shipping selector */}
                <div className="mb-5">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#22C55E]" />
                    Shipping Method
                  </p>
                  <div className="space-y-2">
                    {SHIPPING_OPTIONS.map((opt) => (
                      <motion.label
                        key={opt.id}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          shippingOption === opt.id
                            ? "border-[#22C55E] bg-[#22C55E]/5"
                            : "border-[#E5E7EB] hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          shippingOption === opt.id ? "border-[#22C55E]" : "border-gray-300"
                        }`}>
                          {shippingOption === opt.id && <div className="w-2 h-2 rounded-full bg-[#22C55E]" />}
                        </div>
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={shippingOption === opt.id}
                          onChange={() => setShippingOption(opt.id)}
                          className="hidden"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#1F2937] truncate">
                            {opt.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{opt.time}</p>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#1F2937] flex-shrink-0">
                          {shippingCost === 0 && opt.id === "standard"
                            ? "FREE"
                            : `₹${opt.price.toFixed(2)}`}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="mb-5">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#F97316]" />
                    Promo Code
                  </p>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponMsg(""); }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2.5 border-2 border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#22C55E] uppercase transition-colors bg-[#F8FAFC]"
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={applyCoupon}
                        className="px-3 sm:px-4 py-2.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#1F2937] hover:border-[#22C55E] hover:text-[#22C55E] transition-colors"
                      >
                        Apply
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-[#22C55E]/10 rounded-xl border border-[#22C55E]/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                        <span className="font-semibold text-[#22C55E] text-xs sm:text-sm truncate">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[#22C55E]/70 flex-shrink-0">
                          {appliedCoupon.type === "percent"
                            ? `-${(appliedCoupon.discount * 100).toFixed(0)}%`
                            : appliedCoupon.type === "fixed"
                              ? `-₹${appliedCoupon.discount}`
                              : "Free Ship"}
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {couponMsg && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-[10px] sm:text-xs mt-1.5 ${
                        appliedCoupon ? "text-[#22C55E]" : "text-red-500"
                      }`}
                    >
                      {couponMsg}
                    </motion.p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 text-xs sm:text-sm border-t border-[#E5E7EB] pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1F2937]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-[#1F2937]">
                      {shippingCost === 0 ? (
                        <span className="text-[#22C55E] font-semibold">FREE</span>
                      ) : (
                        `₹${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#22C55E]">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-medium text-[#1F2937]">₹{tax.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-[#F97316] border-t border-dashed border-[#E5E7EB] pt-2.5">
                      <span className="flex items-center gap-1 text-xs">
                        <Tag className="w-3 h-3" />
                        You Save
                      </span>
                      <span className="font-semibold">₹{totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB] mt-2">
                    <span className="text-base sm:text-lg font-bold text-[#1F2937]">Total</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-bold text-[#1F2937]">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                  className="w-full mt-5 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-300 text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#22C55E]/25 transition-colors disabled:shadow-none"
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
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </motion.div>

              {/* Free shipping progress */}
              {subtotal < 35 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-[#22C55E]/10 to-[#38BDF8]/10 rounded-2xl border border-[#22C55E]/20 p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-[#22C55E]" />
                    <span className="font-bold text-sm text-[#1F2937]">Free Shipping Available!</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Add <span className="font-bold text-[#22C55E]">₹{(35 - subtotal).toFixed(2)}</span> more for free standard shipping
                  </p>
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 35) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#22C55E] to-[#38BDF8] rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {Math.min(((subtotal / 35) * 100).toFixed(0), 100)}% of goal reached
                  </p>
                </motion.div>
              )}

              {/* Need help */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <h3 className="font-bold text-sm text-[#1F2937] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#38BDF8]" />
                  Need Help?
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Our pet experts are here for you.
                </p>
                <Link to="/contact" className="text-xs font-semibold text-[#22C55E] hover:text-[#16A34A] transition-colors">
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}