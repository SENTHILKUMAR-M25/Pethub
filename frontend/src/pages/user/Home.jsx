import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  PawPrint, ShoppingCart, Star, Truck, Shield, Heart, 
  ArrowRight, ChevronRight, Bone, Fish, Bird, Rabbit 
} from 'lucide-react';
import home from "../../assets/home.png"
// --- Reusable Animation Hook ---
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

// --- Data ---
const categories = [
  { name: 'Dogs', icon: PawPrint, color: 'bg-[#22C55E]/10 text-[#22C55E]', count: '240+ Products' },
  { name: 'Cats', icon: Fish, color: 'bg-[#38BDF8]/10 text-[#38BDF8]', count: '180+ Products' },
  { name: 'Birds', icon: Bird, color: 'bg-[#F97316]/10 text-[#F97316]', count: '95+ Products' },
  { name: 'Small Pets', icon: Rabbit, color: 'bg-purple-500/10 text-purple-500', count: '120+ Products' },
  { name: 'Treats', icon: Bone, color: 'bg-amber-500/10 text-amber-500', count: '350+ Products' },
  { name: 'Accessories', icon: Heart, color: 'bg-rose-500/10 text-rose-500', count: '200+ Products' },
];

const products = [
  { id: 1, name: 'Premium Grain-Free Dog Food', price: 49.99, rating: 4.8, reviews: 128, tag: 'Best Seller', tagColor: 'bg-[#F97316]' },
  { id: 2, name: 'Interactive Cat Toy Set', price: 24.99, rating: 4.9, reviews: 89, tag: 'New', tagColor: 'bg-[#38BDF8]' },
  { id: 3, name: 'Orthopedic Pet Bed - Large', price: 79.99, rating: 4.7, reviews: 256, tag: null, tagColor: '' },
  { id: 4, name: 'Organic Salmon Oil Supplement', price: 34.99, rating: 4.9, reviews: 412, tag: 'Popular', tagColor: 'bg-[#22C55E]' },
];

const features = [
  { icon: Truck, title: 'Free Fast Shipping', desc: 'Free delivery on orders over $35. Same-day dispatch available.', color: 'text-[#22C55E]' },
  { icon: Shield, title: 'Vet Approved Products', desc: 'Every product is reviewed by licensed veterinarians for safety.', color: 'text-[#38BDF8]' },
  { icon: Heart, title: 'Happiness Guarantee', desc: 'Not satisfied? We offer hassle-free returns within 30 days.', color: 'text-[#F97316]' },
];

const testimonials = [
  { name: 'Sarah M.', pet: 'Golden Retriever Owner', text: "The quality of food here is unmatched. My dog's coat has never looked better!", rating: 5 },
  { name: 'James K.', pet: 'Tabby Cat Dad', text: "Fast shipping and the toys keep my cat entertained for hours. Highly recommend!", rating: 5 },
  { name: 'Emily R.', pet: 'Parrot Parent', text: "Finally found a store that cares about bird nutrition. The organic seeds are amazing.", rating: 4 },
];

// --- Components ---

const SectionHeader = ({ subtitle, title, align = 'center' }) => (
  <div className={`mb-12 ${align === 'left' ? 'text-left' : 'text-center'}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-sm font-semibold tracking-wide uppercase mb-3"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-4xl font-bold text-[#1F2937]"
    >
      {title}
    </motion.h2>
  </div>
);

const ProductCard = ({ product }) => {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl hover:shadow-[#22C55E]/5 transition-all duration-300"
    >
      <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden">
        {/* Placeholder for Product Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <PawPrint className="w-16 h-16 text-gray-300" />
        </div>
        
        {product.tag && (
          <span className={`absolute top-3 left-3 ${product.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
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

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-[#1F2937]">{product.rating}</span>
          <span className="text-sm text-gray-400">({product.reviews})</span>
        </div>
        <h3 className="font-semibold text-[#1F2937] mb-2 group-hover:text-[#22C55E] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#1F2937]">${product.price}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page Sections ---

const HeroSection = () => (
  <section className="relative pt-22 pb-20 md:pt-25 md:pb-32 overflow-hidden bg-[#F8FAFC]">
    {/* Background Decorations */}
    <div className="absolute top-20 right-0 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#38BDF8]/5 rounded-full blur-3xl" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            New Summer Collection Available
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F2937] leading-[1.1] mb-6">
            Everything Your <br />
            <span className="text-[#22C55E]">Furry Friend</span> <br />
            Deserves
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
            Premium pet food, toys, and accessories curated with love. 
            Because they are not just pets, they are family.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-[#22C55E]/25 transition-colors"
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/deals" 
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1F2937] px-8 py-4 rounded-full font-bold text-lg border-2 border-[#E5E7EB] transition-colors"
              >
                View Deals
              </Link>
            </motion.div>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold text-[#1F2937]">50k+</p>
              <p className="text-sm text-gray-500">Happy Pets</p>
            </div>
            <div className="w-px h-12 bg-[#E5E7EB]" />
            <div>
              <p className="text-3xl font-bold text-[#1F2937]">4.9</p>
              <p className="text-sm text-gray-500">Customer Rating</p>
            </div>
            <div className="w-px h-12 bg-[#E5E7EB]" />
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
          className="relative hidden lg:block"
        >
          <div className="relative z-10 bg-linear-to-br from-[#22C55E]/20 to-[#38BDF8]/20 rounded-[2.5rem]">
            <div className="h-110 bg-white rounded-3xl shadow-2xl overflow-hidden relative">
               {/* Placeholder Hero Image */}
               <div className="absolute inset-0  bg-linear-to-br from-[#F8FAFC] to-gray-100 flex items-center justify-center">
                  <img src={home} alt="home-image" />
               </div>
               
               {/* Floating Cards */}
               {/* <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-[-20px] z-1000 left-1 bg-white p-4 rounded-2xl shadow-xl border border-[#E5E7EB]"
               >
                 <div className="flex items-center gap-3">
                   <div className="bg-[#22C55E]/10 p-2 rounded-lg">
                     <Truck className="w-5 h-5 text-[#22C55E]" />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Delivery</p>
                     <p className="font-bold text-[#1F2937]">Free Shipping</p>
                   </div>
                 </div>
               </motion.div> */}

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

const CategoriesSection = () => {
  const { ref, controls } = useScrollReveal();
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader subtitle="Browse by Pet" title="Shop for Your Companion" />
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.name} variants={itemVariants}>
              <Link 
                to={`/shop/${cat.name.toLowerCase()}`}
                className="group block p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#22C55E] hover:shadow-lg hover:shadow-[#22C55E]/5 transition-all duration-300 bg-white"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[#1F2937] mb-1 group-hover:text-[#22C55E] transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.count}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeaturedSection = () => {
  const { ref, controls } = useScrollReveal();

  return (
    <section className="py-20 bg-[#F8FAFC]">
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
              className="inline-flex items-center gap-2 text-[#22C55E] font-semibold hover:text-[#16A34A] transition-colors group"
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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const WhyChooseSection = () => {
  const { ref, controls } = useScrollReveal();

  return (
    <section className="py-20 bg-white">
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
              className="p-8 rounded-3xl bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#22C55E]/30 hover:shadow-xl hover:shadow-[#22C55E]/5 transition-all duration-300"
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

  return (
    <section className="py-20 bg-[#F8FAFC]">
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
              <p className="text-[#1F2937] mb-6 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white font-bold text-lg">
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

const NewsletterSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#22C55E] to-[#16A34A] p-12 md:p-20 text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the JodPetHub Family
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Subscribe for exclusive deals, pet care tips, and new arrival updates. 
            Get 15% off your first order!
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-white/20 border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-[#22C55E] rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Subscribe
            </motion.button>
          </form>
          
          <p className="text-white/70 text-sm mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- Main Home Page ---

const Home = () => {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
};

export default Home;