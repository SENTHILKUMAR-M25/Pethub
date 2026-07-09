import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  PawPrint, ShoppingCart, Star, Truck, Shield, Heart, 
  ArrowRight, ChevronRight, Bone, Fish, Bird, Rabbit,
  Dog, Cat, Loader2
} from 'lucide-react';
import home from "../../assets/home.png"
import { getCategories } from "../../api/categoryService";
import { getProducts } from "../../api/productService";
import { getImageUrl } from "../../api/imageUtils";

const useScrollReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return { ref, controls };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } 
  }
};

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
  dogs: "bg-[#FF80C7]/10 text-[#FF80C7]",
  cats: "bg-[#38BDF8]/10 text-[#38BDF8]",
  birds: "bg-[#F97316]/10 text-[#F97316]",
  "small pets": "bg-purple-500/10 text-purple-500",
  treats: "bg-amber-500/10 text-amber-500",
  accessories: "bg-rose-500/10 text-rose-500",
  fish: "bg-cyan-500/10 text-cyan-500",
  rabbit: "bg-purple-500/10 text-purple-500",
};

const getCategoryMeta = (name) => {
  const key = name?.toLowerCase() || "";
  const Icon = Object.entries(categoryIcons).find(([k]) => key.includes(k))?.[1] || PawPrint;
  const color = Object.entries(categoryColors).find(([k]) => key.includes(k))?.[1] || "bg-gray-100 text-gray-500";
  return { Icon, color };
};

const SectionHeader = ({ subtitle, title, align = 'center' }) => (
  <div className={`mb-10 sm:mb-12 ${align === 'left' ? 'text-left' : 'text-center'}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-[#FF80C7]/10 text-[#FF80C7] text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2937]"
    >
      {title}
    </motion.h2>
  </div>
);

const ProductCard = ({ product, imageUrl }) => {
  const { addItem } = useCart();

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
    >
      <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <PawPrint className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {product.tag && (
          <span className={`absolute top-3 left-3 bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {product.tag}
          </span>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-[#1F2937] hover:text-[#F97316]"
        >
          <Heart className="w-5 h-5" />
        </motion.button>

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addItem(product, 1)}
            className="w-full bg-[#FF80C7] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-[#1F2937]">{product.rating || 4.5}</span>
          <span className="text-sm text-gray-400">({product.reviews || 0})</span>
        </div>
        <h3 className="font-semibold text-[#1F2937] mb-2 group-hover:text-[#FF80C7] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#1F2937]">₹{product.price}</span>
        </div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => (
  <section className="relative pt-20 pb-14 sm:pb-16 md:pt-24 md:pb-24 overflow-hidden bg-[#F8FAFC]">
    <div className="absolute top-20 right-0 w-96 h-96 bg-[#FF80C7]/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#38BDF8]/5 rounded-full blur-3xl" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF80C7]/10 text-[#FF80C7] rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF80C7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF80C7]"></span>
            </span>
            New Summer Collection Available
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F2937] leading-[1.1] mb-5 sm:mb-6">
            Everything Your <br />
            <span className="text-[#FF80C7]">Furry Friend</span> <br />
            Deserves
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 mb-7 sm:mb-8 max-w-lg leading-relaxed">
            Premium pet food, toys, and accessories curated with love. 
            Because they are not just pets, they are family.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 bg-[#FF80C7] hover:bg-[#16A34A] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl shadow-[#FF80C7]/25 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/deals" 
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1F2937] px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg border-2 border-[#E5E7EB] transition-colors"
              >
                View Deals
              </Link>
            </motion.div>
          </div>

          <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl">
            <div>
              <p className="text-3xl font-bold text-[#1F2937]">50k+</p>
              <p className="text-sm text-gray-500">Happy Pets</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#E5E7EB]" />
            <div>
              <p className="text-3xl font-bold text-[#1F2937]">4.9</p>
              <p className="text-sm text-gray-500">Customer Rating</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#E5E7EB]" />
            <div>
              <p className="text-3xl font-bold text-[#1F2937]">24h</p>
              <p className="text-sm text-gray-500">Fast Delivery</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden md:block"
        >
          <div className="relative z-10 bg-linear-to-br from-[#FF80C7]/20 to-[#38BDF8]/20 rounded-[2.5rem]">
            <div className="h-110 bg-white rounded-3xl shadow-2xl overflow-hidden relative">
               <div className="absolute inset-0  bg-linear-to-br from-[#F8FAFC] to-gray-100 flex items-center justify-center">
                  <img src={home} alt="home-image" />
               </div>

               <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-12 right-8 bg-white p-4 rounded-2xl shadow-xl border border-[#E5E7EB]"
               >
                 <div className="flex items-center gap-3">
                   <div className="bg-[#F97316]/10 p-2 rounded-lg">
                     <Star className="w-5 h-5 text-[#F97316]" />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Quality</p>
                     <p className="font-bold text-[#1F2937]">Vet Approved</p>
                   </div>
                 </div>
               </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const CategoriesSection = ({ categories }) => {
  const { ref, controls } = useScrollReveal();
  
  return (
    <section className="py-14 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader subtitle="Browse by Pet" title="Shop for Your Companion" />
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="flex gap-4 justify-center items-center"
        >
          {categories.map((cat) => {
            const { Icon, color } = getCategoryMeta(cat.name);
            const hasImage = cat.image;
            return (
              <motion.div key={cat._id} variants={itemVariants}>
                <Link 
                   to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#FF80C7] hover:shadow-lg hover:shadow-[#FF80C7]/5 transition-all duration-300 bg-white"
                >
                  {hasImage ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                      <img
                        src={getImageUrl(cat.image)}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  )}
                  <h3 className="font-bold text-[#1F2937] mb-1 group-hover:text-[#FF80C7] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.productCount || 0} Products</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const FeaturedSection = ({ products }) => {
  const { ref, controls } = useScrollReveal();

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div className="text-left mb-6 md:mb-0">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-sm font-semibold tracking-wide uppercase mb-3"
            >
              Top Picks
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-[#1F2937]"
            >
              Featured Products
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 text-[#FF80C7] font-semibold hover:text-[#16A34A] transition-colors group"
            >
              View All Products
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} imageUrl={getImageUrl(product.images?.[0])} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const WhyChooseSection = () => {
  const { ref, controls } = useScrollReveal();

  const features = [
    { icon: Truck, title: 'Free Fast Shipping', desc: 'Free delivery on orders over ₹35. Same-day dispatch available.', color: 'text-[#FF80C7]' },
    { icon: Shield, title: 'Vet Approved Products', desc: 'Every product is reviewed by licensed veterinarians for safety.', color: 'text-[#38BDF8]' },
    { icon: Heart, title: 'Happiness Guarantee', desc: 'Not satisfied? We offer hassle-free returns within 30 days.', color: 'text-[#F97316]' },
  ];

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader subtitle="Why JodPetHub" title="The Pet Parent's Choice" />
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#FF80C7]/30 hover:shadow-xl hover:shadow-[#FF80C7]/5 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const { ref, controls } = useScrollReveal();

  const testimonials = [
    { name: 'Sarah M.', pet: 'Golden Retriever Owner', text: "The quality of food here is unmatched. My dog's coat has never looked better!", rating: 5 },
    { name: 'James K.', pet: 'Tabby Cat Dad', text: "Fast shipping and the toys keep my cat entertained for hours. Highly recommend!", rating: 5 },
    { name: 'Emily R.', pet: 'Parrot Parent', text: "Finally found a store that cares about bird nutrition. The organic seeds are amazing.", rating: 4 },
  ];

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader subtitle="Testimonials" title="Happy Tails, Happy Tales" />
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star 
                    key={j} 
                    className={`w-5 h-5 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-[#1F2937] mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF80C7] to-[#16A34A] flex items-center justify-center text-white font-bold text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-[#1F2937]">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};


const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategories(),
          getProducts({ featured: true }),
        ]);
        setCategories(catRes.data.filter((c) => c.status === "Active"));
        setFeaturedProducts(prodRes.data.filter((p) => p.status === "Active" && p.stock > 0));
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF80C7] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <HeroSection />
      {categories.length > 0 && <CategoriesSection categories={categories} />}
      {featuredProducts.length > 0 && <FeaturedSection products={featuredProducts} />}
      <WhyChooseSection />
      <TestimonialsSection />
    </main>
  );
};

export default Home;
