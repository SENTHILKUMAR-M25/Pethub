import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight, Loader2, Search, ImageIcon
} from 'lucide-react';
import { getBrands } from "../../api/brandService";
import { getImageUrl } from "../../api/imageUtils";

const brandGradients = [
  "from-[#FF80C7] to-pink-500",
  "from-[#38BDF8] to-blue-500",
  "from-[#F97316] to-orange-500",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-yellow-500",
  "from-rose-500 to-red-500",
  "from-cyan-500 to-teal-500",
  "from-emerald-500 to-green-500",
  "from-indigo-500 to-indigo-600",
];

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await getBrands();
        setBrands(res.data.filter((b) => b.status === "Active"));
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#FF80C7] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1F2937] font-medium">Brands</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-2">
                Shop by Brand
              </h1>
              <p className="text-gray-500">Discover products from top pet brands</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E5E7EB] focus:border-[#FF80C7] focus:outline-none transition-colors bg-white"
              />
            </div>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">No brands found</h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((brand, index) => {
              const gradient = brandGradients[index % brandGradients.length];
              return (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="group block bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-8 flex items-center justify-center relative`}>
                      <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
                        {brand.image ? (
                          <img
                            src={getImageUrl(brand.image)}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white">
                        {brand.productCount || 0} products
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#1F2937] mb-2 group-hover:text-[#FF80C7] transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {brand.description || `Browse our collection of ${brand.name} products and accessories.`}
                      </p>
                      <div className="flex items-center text-[#FF80C7] font-semibold text-sm group-hover:text-[#16A34A] transition-colors">
                        Shop Brand
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Brands;
