import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, Search, Heart, PawPrint } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Brands', path: '/brands' },
  { name: 'Deals', path: '/deals' },
  { name: 'About', path: '/about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  // Scroll detection for sticky hide/show and background blur
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add background blur after 50px
      setScrolled(currentScrollY > 50);

      // Hide on scroll down, show on scroll up
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

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
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-[#FF80C7] p-2 rounded-xl"
              >
                <PawPrint className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-[#1F2937] tracking-tight">
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
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full text-[#1F2937] hover:bg-[#FF80C7]/10 hover:text-[#FF80C7] transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full text-[#1F2937] hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors shadow-lg shadow-[#FF80C7]/25"
              >
                <Link to="/cart" className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span></Link>
                <span className="absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  3
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              {/* Drawer Header */}
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

              {/* Drawer Links */}
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
              </nav>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-[#E5E7EB] space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-[#FF80C7]/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>View Cart (3)</span>
                </motion.button>
                
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50 font-medium transition-colors">
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E7EB] text-[#1F2937] hover:bg-gray-50 font-medium transition-colors">
                    <Heart className="w-4 h-4 text-[#F97316]" />
                    Wishlist
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;