import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Store, Mail, Phone, MapPin, Settings2, Truck, Megaphone,
  Share2, Loader2, Check, AlertCircle, Save,
} from "lucide-react";
import api from "../../api/axios";

const emptySettings = {
  storeName: "",
  storeTagline: "",
  supportEmail: "",
  supportPhone: "",
  address: "",
  currency: "INR",
  shippingCost: 0,
  freeShippingThreshold: 0,
  announcement: "",
  announcementEnabled: false,
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  },
};

export default function Settings() {
  const [form, setForm] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      const s = res.data;
      setForm({
        storeName: s.storeName || "",
        storeTagline: s.storeTagline || "",
        supportEmail: s.supportEmail || "",
        supportPhone: s.supportPhone || "",
        address: s.address || "",
        currency: s.currency || "INR",
        shippingCost: s.shippingCost || 0,
        freeShippingThreshold: s.freeShippingThreshold || 0,
        announcement: s.announcement || "",
        announcementEnabled: s.announcementEnabled || false,
        socialLinks: {
          facebook: s.socialLinks?.facebook || "",
          instagram: s.socialLinks?.instagram || "",
          twitter: s.socialLinks?.twitter || "",
          youtube: s.socialLinks?.youtube || "",
        },
      });
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : type === "checkbox" ? checked : value,
    }));
    setSaved(false);
    setSaveError("");
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
    setSaved(false);
    setSaveError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await api.put("/settings", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveError(err.response?.data?.message || "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#FF80C7] transition-colors";

  const labelClass = "block text-sm font-semibold text-[#1F2937] mb-2";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* ========== HEADER ========== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937]">Settings</h1>
            </div>
            <p className="text-gray-500">Configure your store details and preferences</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-colors w-full sm:w-auto justify-center ${
              saved
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-[#FF80C7] hover:bg-[#16A34A] text-white shadow-[#FF80C7]/20 disabled:opacity-70"
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-5 h-5" /> Saved
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {saveError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {saveError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* ========== STORE DETAILS ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-[#FF80C7]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Store Details</h2>
              <p className="text-sm text-gray-500">Basic information about your store</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Store Name</label>
              <input type="text" name="storeName" value={form.storeName} onChange={handleChange}
                placeholder="Jod PetHub" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tagline</label>
              <input type="text" name="storeTagline" value={form.storeTagline} onChange={handleChange}
                placeholder="Everything your pet needs" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Store Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="Street, City, State, PIN"
                  rows={2}
                  className={`${inputClass} pl-11 resize-none`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========== SUPPORT ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#38BDF8]/10 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Contact & Support</h2>
              <p className="text-sm text-gray-500">Customer support contact details</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Support Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" name="supportEmail" value={form.supportEmail} onChange={handleChange}
                  placeholder="support@pethub.com" className={`${inputClass} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Support Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" name="supportPhone" value={form.supportPhone} onChange={handleChange}
                  placeholder="+91 98765 43210" className={`${inputClass} pl-11`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========== SHIPPING ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Shipping</h2>
              <p className="text-sm text-gray-500">Shipping cost configuration</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Base Shipping Cost (₹)</label>
              <input type="number" name="shippingCost" value={form.shippingCost} onChange={handleChange}
                min="0" step="0.01" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Free Shipping Threshold (₹)</label>
              <input type="number" name="freeShippingThreshold" value={form.freeShippingThreshold} onChange={handleChange}
                min="0" step="0.01" placeholder="0 = disabled" className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* ========== ANNOUNCEMENT ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F97316]/10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Announcement Bar</h2>
              <p className="text-sm text-gray-500">Shown at the top of your store</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClass}>Announcement Text</label>
              <input type="text" name="announcement" value={form.announcement} onChange={handleChange}
                placeholder="Free shipping on orders above ₹999!"
                className={inputClass}
                disabled={!form.announcementEnabled} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="announcementEnabled"
                checked={form.announcementEnabled}
                onChange={handleChange}
                className="w-5 h-5 accent-[#FF80C7]"
              />
              <span className="text-sm font-semibold text-[#1F2937]">Enable announcement bar</span>
            </label>
          </div>
        </motion.div>

        {/* ========== SOCIAL LINKS ========== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E7EB] p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center">
              <Share2 className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">Social Links</h2>
              <p className="text-sm text-gray-500">Social media profiles for your store</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Facebook</label>
              <input type="url" name="facebook" value={form.socialLinks.facebook} onChange={handleSocialChange}
                placeholder="https://facebook.com/pethub" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input type="url" name="instagram" value={form.socialLinks.instagram} onChange={handleSocialChange}
                placeholder="https://instagram.com/pethub" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input type="url" name="twitter" value={form.socialLinks.twitter} onChange={handleSocialChange}
                placeholder="https://twitter.com/pethub" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>YouTube</label>
              <input type="url" name="youtube" value={form.socialLinks.youtube} onChange={handleSocialChange}
                placeholder="https://youtube.com/@pethub" className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* ========== SAVE BUTTON ========== */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="flex justify-end">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={saving}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-colors ${
              saved
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-[#FF80C7] hover:bg-[#16A34A] text-white shadow-[#FF80C7]/20 disabled:opacity-70"
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-5 h-5" /> Settings Saved
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save All Settings
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
