import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ArrowLeft, MapPin, CreditCard, Package, Minus, Plus,
  Trash2, Truck, ShieldCheck, Loader2, CheckCircle, AlertCircle,
  Home, Mail, Phone, User, Pencil, Plus as PlusIcon, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../api/orderService";
import { createPaymentOrder, verifyPayment } from "../../api/paymentService";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "../../api/addressService";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", desc: "5-7 business days", cost: 5.99 },
  { id: "express", label: "Express Delivery", desc: "2-3 business days", cost: 12.99 },
  { id: "priority", label: "Priority Delivery", desc: "1 business day", cost: 19.99 },
];

const COUPONS = {
  PETLOVE15: { type: "percent", value: 15, label: "15% off" },
  FREESHIP: { type: "freeship", value: 0, label: "Free shipping" },
  SAVE10: { type: "flat", value: 10, label: "₹10 off" },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingId, setShippingId] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const orderPlaced = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [modalAddress, setModalAddress] = useState({
    label: "Home", street: "", city: "", state: "", zip: "", country: "United States",
  });
  const [modalError, setModalError] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);

  useEffect(() => {
    if (user) {
      setAddress({
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zip: user.address?.zip || "",
        country: user.address?.country || "",
      });
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) {
      navigate("/cart");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await getAddresses();
      setSavedAddresses(res.data);
    } catch {
      // silently fail
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setError("");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingOpt = SHIPPING_OPTIONS.find((s) => s.id === shippingId);
  const shippingCost = appliedCoupon?.type === "freeship" ? 0 : (shippingOpt?.cost || 0);
  let discount = 0;
  if (appliedCoupon?.type === "percent") {
    discount = subtotal * (appliedCoupon.value / 100);
  } else if (appliedCoupon?.type === "flat") {
    discount = appliedCoupon.value;
  }
  const total = Math.max(0, subtotal + shippingCost - discount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = COUPONS[code];
    if (coupon) {
      setAppliedCoupon({ ...coupon, code });
      setCouponMsg(`Coupon "${code}" applied: ${coupon.label}`);
    } else {
      setAppliedCoupon(null);
      setCouponMsg("Invalid coupon code");
    }
  };

  const handleApplyAddress = (addr) => {
    setAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || "United States",
    });
    setError("");
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setModalAddress({ label: "Home", street: "", city: "", state: "", zip: "", country: "United States" });
    setModalError("");
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setModalAddress({
      label: addr.label || "Home",
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || "United States",
    });
    setModalError("");
    setShowAddressModal(true);
  };

  const handleModalChange = (e) => {
    setModalAddress({ ...modalAddress, [e.target.name]: e.target.value });
    setModalError("");
  };

  const handleSaveModalAddress = async () => {
    const { label, street, city, state, zip, country } = modalAddress;
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setModalError("Please fill in all required fields");
      return;
    }
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, modalAddress);
      } else {
        await createAddress(modalAddress);
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setSavedAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address");
    }
  };

  const isAddressEqual = (a, b) =>
    a.street === b.street && a.city === b.city && a.state === b.state && a.zip === b.zip;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setError("");
    if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zip.trim()) {
      setError("Please fill in all shipping address fields");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        shippingCost,
        discount,
        couponCode: appliedCoupon?.code || "",
      };

      const saveAddressIfNeeded = async () => {
        if (saveAddress && !savedAddresses.some((a) => isAddressEqual(a, address))) {
          try { await createAddress({ label: "Home", ...address }); } catch { /* ignore */ }
        }
      };

      if (paymentMethod === "cod") {
        const res = await createOrder({ ...orderData, paymentMethod: "cod" });
        await saveAddressIfNeeded();
        clearCart();
        orderPlaced.current = true;
        navigate(`/order-success/${res.data._id}`);
      } else {
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          setError("Failed to load payment gateway. Please try again.");
          setSubmitting(false);
          return;
        }

        const payRes = await createPaymentOrder(total);
        const razorpayOrder = payRes.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "JodPetHub",
          description: "Pet Products Purchase",
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              const verifyRes = await verifyPayment({
                ...orderData,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              await saveAddressIfNeeded();
              clearCart();
              orderPlaced.current = true;
              navigate(`/order-success/${verifyRes.data._id}`);
            } catch (err) {
              setError(err.response?.data?.message || "Payment verification failed. Please contact support.");
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: phone || "",
          },
          theme: {
            color: "#FF80C7",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setError(response.error?.description || "Payment failed. Please try again.");
          setSubmitting(false);
        });
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#F8FAFC] pt-20 sm:pt-24 pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/cart" className="hover:text-[#FF80C7] transition-colors">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2937] font-semibold">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-6 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#FF80C7]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[#1F2937]">Shipping Address</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                </div>
                <button
                  onClick={handleOpenAddAddress}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#FF80C7]/10 text-[#FF80C7] rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#FF80C7]/20 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Address
                </button>
              </div>

              {addressesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF80C7]" />
                </div>
              ) : savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="relative border-2 border-[#E5E7EB] rounded-xl p-4 hover:border-[#FF80C7]/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-[#FF80C7] bg-[#FF80C7]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {addr.label || "Home"}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#FF80C7] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#1F2937] font-medium leading-snug">
                        {addr.street}
                      </p>
                      <p className="text-sm text-gray-500">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{addr.country}</p>
                      <button
                        onClick={() => handleApplyAddress(addr)}
                        className="mt-3 w-full py-2 rounded-lg border-2 border-[#FF80C7] text-[#FF80C7] font-semibold text-sm hover:bg-[#FF80C7]/5 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-[#E5E7EB] pt-4">
                <p className="text-sm font-semibold text-gray-500 mb-4">
                  {savedAddresses.length > 0 ? "Or enter a new address:" : "Enter your shipping address:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                    <input
                      type="text" name="street" value={address.street} onChange={handleAddressChange}
                      placeholder="12 Main Street, Apt 4B"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <input
                      type="text" name="city" value={address.city} onChange={handleAddressChange}
                      placeholder="Madurai"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <input
                      type="text" name="state" value={address.state} onChange={handleAddressChange}
                      placeholder="TamilNadu"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ZIP Code</label>
                    <input
                      type="text" name="zip" value={address.zip} onChange={handleAddressChange}
                      placeholder="625701"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                    <input
                      type="text" name="country" value={address.country} onChange={handleAddressChange}
                      placeholder="India"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="accent-[#FF80C7] w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-600">Save this address for future orders</span>
                </label>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#FF80C7]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1F2937]">Payment Method</h2>
                  <p className="text-sm text-gray-500">Choose how to pay</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#FF80C7] bg-[#FF80C7]/5" : "border-[#E5E7EB] hover:border-gray-300"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-[#FF80C7]" />
                  <div>
                    <p className="font-semibold text-[#1F2937]">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-[#FF80C7] bg-[#FF80C7]/5" : "border-[#E5E7EB] hover:border-gray-300"}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="accent-[#FF80C7]" />
                  <div>
                    <p className="font-semibold text-[#1F2937]">Credit / Debit Card</p>
                    <p className="text-sm text-gray-500">Pay securely with your card</p>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#FF80C7]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1F2937]">Order Items</h2>
                  <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="divide-y divide-[#E5E7EB]">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={`${import.meta.env.VITE_IMAGE_URL}${item.images[0]}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F2937] truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#1F2937]">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm lg:sticky lg:top-28"
            >
              <h2 className="text-lg font-bold text-[#1F2937] mb-6">Order Summary</h2>

              {/* Shipping */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Shipping Method</label>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${shippingId === opt.id ? "border-[#FF80C7] bg-[#FF80C7]/5" : "border-[#E5E7EB] hover:border-gray-300"}`}>
                      <input type="radio" name="shipping" value={opt.id} checked={shippingId === opt.id} onChange={() => setShippingId(opt.id)} className="accent-[#FF80C7]" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1F2937]">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-[#1F2937]">₹{opt.cost.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#FF80C7] transition-colors uppercase"
                  />
                  <button onClick={handleApplyCoupon}
                    className="px-4 py-2.5 bg-[#FF80C7] text-white rounded-xl font-semibold text-sm hover:bg-[#16A34A] transition-colors">
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs mt-1.5 ${appliedCoupon ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-t border-[#E5E7EB] pt-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-[#1F2937] border-t border-[#E5E7EB] pt-3">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mt-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3.5 rounded-xl font-bold text-lg mt-4 shadow-lg shadow-[#FF80C7]/25 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Place Order</>
                )}
              </motion.button>

              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-center">
                <ShieldCheck className="w-4 h-4" />
                Secure checkout. Your information is protected.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>

      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937]">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </h3>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Label</label>
                    <select
                      name="label"
                      value={modalAddress.label}
                      onChange={handleModalChange}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors text-sm"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                    <input
                      type="text" name="street" value={modalAddress.street} onChange={handleModalChange}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                      <input
                        type="text" name="city" value={modalAddress.city} onChange={handleModalChange}
                        placeholder="New York"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                      <input
                        type="text" name="state" value={modalAddress.state} onChange={handleModalChange}
                        placeholder="NY"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">ZIP Code</label>
                      <input
                        type="text" name="zip" value={modalAddress.zip} onChange={handleModalChange}
                        placeholder="10001"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                      <input
                        type="text" name="country" value={modalAddress.country} onChange={handleModalChange}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                      />
                    </div>
                  </div>

                  {modalError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {modalError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddressModal(false)}
                      className="flex-1 py-3 rounded-xl border-2 border-[#E5E7EB] text-[#1F2937] font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveModalAddress}
                      className="flex-1 py-3 rounded-xl bg-[#FF80C7] text-white font-semibold hover:bg-[#16A34A] transition-colors"
                    >
                      {editingAddressId ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
