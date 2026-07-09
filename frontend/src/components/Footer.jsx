import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PawPrint, Mail, Phone, MapPin, ChevronRight,
   
} from "lucide-react";
import { FaFacebook as Facebook, FaInstagram as Instagram, FaYoutube as Youtube } from "react-icons/fa";
const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Categories", path: "/categories" },
  { name: "Deals", path: "/deals" },
  { name: "About Us", path: "/about" },
];

const customerLinks = [
  { name: "My Account", path: "/profile" },
  { name: "My Orders", path: "/orders" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Cart", path: "/cart" },
  { name: "Help Center", path: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-[#1F2937] text-white">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-[#FF80C7] p-2 rounded-xl"
              >
                <PawPrint className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold tracking-tight">
                Jod<span className="text-[#FF80C7]">Pet</span>Hub
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your one-stop shop for all your pet needs. Quality products,
              fast delivery, and happy pets guaranteed!
            </p>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#FF80C7] flex-shrink-0" />
                <span>123 Pet Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FF80C7] flex-shrink-0" />
                <a href="mailto:support@jodpethub.com" className="hover:text-[#FF80C7] transition-colors">
                  support@jodpethub.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FF80C7] flex-shrink-0" />
                <a href="tel:+15551234567" className="hover:text-[#FF80C7] transition-colors">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white/80">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF80C7] transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 text-[#FF80C7] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white/80">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF80C7] transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 text-[#FF80C7] opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white/80">
              Stay Connected
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for exclusive deals, new arrivals, and pet care tips.
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF80C7] transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 bg-[#FF80C7] hover:bg-[#16A34A] text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
              >
                Subscribe
              </motion.button>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "Youtube" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 hover:bg-[#FF80C7] hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} JodPetHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#FF80C7] transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-[#FF80C7] transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-2">
              <span className="text-xs">We accept</span>
              <div className="flex items-center gap-1.5">
                <span className="w-8 h-5 rounded bg-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">Visa</span>
                <span className="w-8 h-5 rounded bg-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">MC</span>
                <span className="w-8 h-5 rounded bg-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">PP</span>
                <span className="w-8 h-5 rounded bg-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">Amex</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
