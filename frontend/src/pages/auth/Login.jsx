// import { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import { PawPrint, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import { loginUser } from "../../api/authService";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { setUser, setToken } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const success = location.state?.registered;

//   useEffect(() => {
//     if (location.state?.registered) {
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state?.registered]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await loginUser(form);
//       setToken(res.data.token);
//       setUser(res.data.user);
//       const from = location.state?.from || "/";
//       navigate(from, { replace: true });
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
//           <div className="text-center mb-8">
//             <motion.div
//               animate={{ rotate: [0, 10, 0] }}
//               transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
//               className="w-16 h-16 bg-[#FF80C7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
//             >
//               <PawPrint className="w-8 h-8 text-[#FF80C7]" />
//             </motion.div>
//             <h1 className="text-2xl font-bold text-[#1F2937]">Welcome Back</h1>
//             <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
//           </div>

//           {success && (
//             <motion.p
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-green-600 text-sm text-center mb-4 bg-green-50 p-3 rounded-xl"
//             >
//               Account created successfully! Please sign in.
//             </motion.p>
//           )}

//           {error && (
//             <motion.p
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-xl"
//             >
//               {error}
//             </motion.p>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   name="email"
//                   type="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="you@example.com"
//                   required
//                   className="w-full pl-11 pr-4 py-3 border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   required
//                   className="w-full pl-11 pr-12 py-3 border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF80C7] transition-colors"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.01 }}
//               whileTap={{ scale: 0.99 }}
//               disabled={loading}
//               className="w-full bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-[#FF80C7]/25 transition-colors disabled:opacity-50"
//             >
//               {loading ? (
//                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
//               ) : (
//                 "Sign In"
//               )}
//             </motion.button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-500 text-sm">
//               Don't have an account?{" "}
//               <Link to="/register" className="text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors">
//                 Create one
//               </Link>
//             </p>
//           </div>

//           <div className="mt-4 text-center">
//             <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FF80C7] transition-colors">
//               <ArrowLeft className="w-4 h-4" />
//               Back to Home
//             </Link>
//           </div>

//           <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
//             <Link
//               to="/admin"
//               className="block text-center text-sm text-gray-400 hover:text-[#1F2937] transition-colors"
//             >
//               Admin Login →
//             </Link>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;





import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PawPrint, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/authService";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const success = location.state?.registered;

  useEffect(() => {
    if (location.state?.registered) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.registered]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await loginUser(form);
      setToken(res.data.token);
      setUser(res.data.user);
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / Brand */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 group">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center shadow-lg shadow-[#22C55E]/25"
            >
              <PawPrint className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-[#1F2937]">
              Jod<span className="text-[#22C55E]">Pet</span>Hub
            </span>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-[#E5E7EB] overflow-hidden"
        >
          {/* Card Header */}
          <div className="p-8 pb-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl font-bold text-[#1F2937] mb-1">Welcome Back! 👋</h1>
              <p className="text-gray-500 text-sm">Sign in to access your account and orders</p>
            </motion.div>
          </div>

          {/* Alerts */}
          <div className="px-8 space-y-3">
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-2.5 p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                  <p className="text-sm font-medium text-[#22C55E]">
                    Account created successfully! Please sign in.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="p-8 pt-5 space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                Email Address
              </label>
              <div className={`relative transition-all duration-200 ${
                focusedField === 'email' ? 'ring-2 ring-[#22C55E]/20 rounded-xl' : ''
              }`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'email' ? 'text-[#22C55E]' : 'text-gray-400'
                }`} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#22C55E] transition-colors"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#1F2937]">Password</label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#38BDF8] hover:text-[#22C55E] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={`relative transition-all duration-200 ${
                focusedField === 'password' ? 'ring-2 ring-[#22C55E]/20 rounded-xl' : ''
              }`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'password' ? 'text-[#22C55E]' : 'text-gray-400'
                }`} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F8FAFC] border-2 border-[#E5E7EB] rounded-xl text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#22C55E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1F2937] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me */}
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-[#E5E7EB] rounded-md peer-checked:bg-[#22C55E] peer-checked:border-[#22C55E] transition-all flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-[#1F2937] transition-colors">
                  Remember me for 30 days
                </span>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#22C55E]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Sign In
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="px-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>
          </div>


          {/* Footer Links */}
          <div className="px-8 pb-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-semibold text-[#22C55E] hover:text-[#16A34A] transition-colors"
                >
                  Create one free
                </Link>
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#22C55E] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
                <span className="text-[#E5E7EB]">|</span>
                <Link 
                  to="/admin" 
                  className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#F97316] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            256-bit SSL Secure
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            GDPR Compliant
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;