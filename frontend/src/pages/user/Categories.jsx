import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PawPrint, Dog, Cat, Bird, Rabbit, Fish, Bone, Heart, 
  ChevronRight, Loader2, Search
} from 'lucide-react';
import { getCategories } from "../../api/categoryService";

const categoryIcons = {
  dogs: Dog,
  cats: Cat,
  birds: Bird,
  "small pets": Rabbit,
  treats: Bone,
  accessories: Heart,
  fish: Fish,
  rabbit: Rabbit,
};

const categoryColors = {
  dogs: "from-[#FF80C7] to-pink-500",
  cats: "from-[#38BDF8] to-blue-500",
  birds: "from-[#F97316] to-orange-500",
  "small pets": "from-purple-500 to-purple-600",
  treats: "from-amber-500 to-yellow-500",
  accessories: "from-rose-500 to-red-500",
  fish: "from-cyan-500 to-teal-500",
  rabbit: "from-purple-500 to-indigo-500",
};

const getCategoryMeta = (name) => {
  const key = name?.toLowerCase() || "";
  const Icon = Object.entries(categoryIcons).find(([k]) => key.includes(k))?.[1] || PawPrint;
  const gradient = Object.entries(categoryColors).find(([k]) => key.includes(k))?.[1] || "from-gray-500 to-gray-600";
  return { Icon, gradient };
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.filter((c) => c.status === "Active"));
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <span className="text-[#1F2937] font-medium">Categories</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-2">
                Shop by Category
              </h1>
              <p className="text-gray-500">Find exactly what your pet needs</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
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
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">No categories found</h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((cat, index) => {
              const { Icon, gradient } = getCategoryMeta(cat.name);
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    to={`/shop?category=${cat.name.toLowerCase()}`}
                    className="group block bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-8 flex items-center justify-center relative`}>
                      <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white">
                        {cat.productCount || 0} products
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#1F2937] mb-2 group-hover:text-[#FF80C7] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {cat.description || `Browse our collection of ${cat.name?.toLowerCase()} products and accessories.`}
                      </p>
                      <div className="flex items-center text-[#FF80C7] font-semibold text-sm group-hover:text-[#16A34A] transition-colors">
                        Shop Now
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

export default Categories;
