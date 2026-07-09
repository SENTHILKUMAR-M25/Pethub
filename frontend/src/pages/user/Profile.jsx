import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, ChevronRight, AlertCircle,
  CheckCircle, Loader2, Save, ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/authService";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, setUser } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: { street: "", city: "", state: "", zip: "", country: "United States" },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: "/profile" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || "",
          country: user.address?.country || "United States",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleAddressChange = (e) => {
    setForm({ ...form, address: { ...form.address, [e.target.name]: e.target.value } });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      setUser(res.data.user);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF80C7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F2937] font-semibold">My Profile</span>
        </div>

        <h1 className="text-3xl font-bold text-[#1F2937] mb-8">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1F2937]">Personal Information</h2>
                <p className="text-sm text-gray-500">Update your name, email and phone number</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FF80C7]/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#FF80C7]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1F2937]">Default Address</h2>
                <p className="text-sm text-gray-500">Your primary shipping address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                <input
                  type="text" name="street" value={form.address.street} onChange={handleAddressChange}
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <input
                  type="text" name="city" value={form.address.city} onChange={handleAddressChange}
                  placeholder="New York"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <input
                  type="text" name="state" value={form.address.state} onChange={handleAddressChange}
                  placeholder="NY"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ZIP Code</label>
                <input
                  type="text" name="zip" value={form.address.zip} onChange={handleAddressChange}
                  placeholder="10001"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <input
                  type="text" name="country" value={form.address.country} onChange={handleAddressChange}
                  placeholder="United States"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-[#FF80C7]/25 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </button>
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 border-2 border-[#E5E7EB] text-[#1F2937] px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              My Orders
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
