import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingCart,  Heart, PawPrint, User, Package,
  LogOut, ChevronDown, CheckCircle, LogIn
} from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Brands', path: '/brands' },
  { name: 'Contact', path: '/contact' },
  { name: 'About', path: '/about' },
];

function ProfileDropdown({ user, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) close();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, close]);

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="relative">
      <motion.button
        ref={btnRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-9 h-9 rounded-full bg-[#FF80C7] flex items-center justify-center text-white text-sm font-bold">
          {initial}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl shadow-gray-200/50 overflow-hidden z-50"
          >
            <>
              <div className="p-5 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FF80C7]/5 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF80C7] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1F2937] text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownItem icon={User} label="My Profile" onClick={() => { close(); onNavigate('/profile'); }} />
                <DropdownItem icon={Package} label="My Orders" onClick={() => { close(); onNavigate('/orders'); }} />
                <div className="border-t border-[#E5E7EB] my-1" />
                <DropdownItem icon={LogOut} label="Logout" onClick={() => { close(); onLogout(); }} danger />
              </div>
            </>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[#1F2937] hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-4 h-4 ${danger ? '' : 'text-gray-400'}`} />
      {label}
    </motion.button>
  );
}

function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[100] flex items-center gap-3 bg-[#1F2937] text-white px-6 py-3.5 rounded-2xl shadow-2xl"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [toast, setToast] = useState({ message: '', visible: false });
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
    showToast('Logged out successfully.');
  }, [logout, navigate, showToast]);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-[#E5E7EB]'
            : 'bg-[#F8FAFC]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group min-w-0">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-[#FF80C7] p-2 rounded-xl"
              >
                <PawPrint className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-lg sm:text-2xl font-bold text-[#1F2937] tracking-tight truncate">
                Jod<span className="text-[#FF80C7]">Pet</span>Hub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 group"
                  >
                    <span className={isActive ? 'text-[#FF80C7]' : 'text-[#1F2937] group-hover:text-[#FF80C7]'}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#FF80C7] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
             

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full text-[#1F2937] hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {user ? (
                <ProfileDropdown user={user} onLogout={handleLogout} onNavigate={navigate} />
              ) : (
                <Link
                  to="/login"
                  className="bg-[#FF80C7] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-lg shadow-[#FF80C7]/25"
                >
                  Login
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-lg shadow-[#FF80C7]/25"
              >
                <Link to="/cart" className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                </Link>
                <span className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {itemCount}
                </span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-[#1F2937] hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF80C7] p-1.5 rounded-lg">
                    <PawPrint className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-[#1F2937]">
                    Jod<span className="text-[#FF80C7]">Pet</span>Hub
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-[#1F2937]"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mobile User Info */}
              {user && (
                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FF80C7]/5 to-pink-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF80C7] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1F2937] text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 p-6">
                <ul className="space-y-2">
                  {navLinks.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            isActive
                              ? 'bg-[#FF80C7]/10 text-[#FF80C7]'
                              : 'text-[#1F2937] hover:bg-gray-50 hover:text-[#FF80C7]'
                          }`}
                        >
                          {link.name}
                          {isActive && (
                            <motion.div
                              layoutId="mobile-active"
                              className="ml-auto w-2 h-2 rounded-full bg-[#FF80C7]"
                            />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Mobile Profile Links */}
                {user && (
                  <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Account</p>
                    <div className="space-y-1">
                      <MobileProfileLink icon={User} label="My Profile" to="/profile" onClick={() => setIsOpen(false)} />
                      <MobileProfileLink icon={Package} label="My Orders" to="/orders" onClick={() => setIsOpen(false)} />
                    </div>
                  </div>
                )}
              </nav>

              <div className="p-6 border-t border-[#E5E7EB] space-y-3">
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-[#FF80C7]/20 w-full"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>View Cart ({itemCount})</span>
                </Link>

                <div className="flex gap-3">
                 
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50 font-medium transition-colors">
                    <Heart className="w-4 h-4 text-[#F97316]" />
                    Wishlist
                  </button>
                </div>

                {user ? (
                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF80C7] text-white font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast message={toast.message} visible={toast.visible} onClose={closeToast} />
    </>
  );
};

function MobileProfileLink({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1F2937] hover:bg-gray-50 hover:text-[#FF80C7] transition-colors"
    >
      <Icon className="w-4 h-4 text-gray-400" />
      {label}
    </Link>
  );
}

export default Navbar;
