import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Ticket, ChevronRight, Loader2, Copy, Percent, Banknote, Truck,
  Calendar, Check, Tag, ShoppingCart,
} from "lucide-react";
import { getAvailableCoupons } from "../../api/couponService";

const TYPE_ICONS = {
  percent: Percent,
  flat: Banknote,
  freeship: Truck,
};

const TYPE_LABELS = {
  percent: "Percentage Off",
  flat: "Flat Amount Off",
  freeship: "Free Shipping",
};

const formatValue = (coupon) => {
  if (coupon.type === "percent") return `${coupon.value}%`;
  if (coupon.type === "flat") return `₹${coupon.value}`;
  return "Free Ship";
};

const formatDate = (date) => {
  if (!date) return "No expiry";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const res = await getAvailableCoupons();
        setCoupons(res.data);
      } catch {
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-5"
        >
          <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1F2937] font-semibold">My Coupons</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF80C7]/10 rounded-2xl flex items-center justify-center">
            <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF80C7]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#1F2937]">My Coupons</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {coupons.length > 0
                ? `${coupons.length} active coupon${coupons.length !== 1 ? "s" : ""} available`
                : "No active coupons right now"}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 md:py-24 px-4"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#FF80C7]/20 to-pink-100 flex items-center justify-center"
            >
              <Ticket className="w-14 h-14 md:w-20 md:h-20 text-[#FF80C7]" />
            </motion.div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#1F2937] mb-3">
              No coupons available
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
              There are no active coupons right now. Check back soon or start shopping
              to grab a deal!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-[#FF80C7]/25 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((coupon, index) => {
              const TypeIcon = TYPE_ICONS[coupon.type] || Tag;
              return (
                <motion.div
                  key={coupon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-[#FF80C7]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono font-bold text-lg text-[#1F2937] bg-[#FF80C7]/5 px-3 py-1.5 rounded-lg border border-[#FF80C7]/15 tracking-wide">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#FF80C7] hover:text-[#16A34A] transition-colors"
                        >
                          {copied === coupon.code ? (
                            <><Check className="w-3.5 h-3.5" /> Copied</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy</>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#16A34A] bg-[#22C55E]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                        <TypeIcon className="w-4 h-4" />
                        {formatValue(coupon)}
                      </div>
                    </div>

                    {coupon.description && (
                      <p className="text-sm text-gray-500 mt-3">{coupon.description}</p>
                    )}

                    <div className="mt-4 space-y-1.5 text-xs text-gray-500 border-t border-dashed border-[#E5E7EB] pt-3">
                      <p className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#FF80C7]" />
                        {TYPE_LABELS[coupon.type] || coupon.type}
                        {coupon.minOrder > 0 && ` • Min order ₹${coupon.minOrder}`}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF80C7]" />
                        Valid till {formatDate(coupon.endDate)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-xs sm:text-sm text-gray-400"
        >
          Apply your coupon code at checkout to unlock the discount.
        </motion.p>
      </div>
    </div>
  );
}
