import { motion } from "framer-motion";
import { Heart, Shield, Truck, Award, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Happy Pets", value: "10K+" },
  { label: "Products", value: "500+" },
  { label: "Brands", value: "50+" },
  { label: "Happy Customers", value: "5K+" },
];

const values = [
  {
    icon: Heart,
    title: "Pet First",
    description: "Every product we stock is chosen with your pet's health and happiness in mind.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "We partner with trusted brands and verify every product for safety and quality.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery so your pet never has to wait long for their essentials.",
  },
  {
    icon: Award,
    title: "Best Prices",
    description: "Competitive pricing with regular deals and discounts for our loyal customers.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-[#FF80C7] transition-colors">Home</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#FF80C7] font-medium">About</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4">
              About PetHub
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your trusted destination for premium pet products — because your furry family members deserve the very best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                PetHub was born from a simple belief — that our pets are family. What started as a small
                local pet supply shop has grown into a trusted online destination for pet parents who want
                the best for their furry, feathered, and scaled companions.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We partner with premium brands and carefully curate every product in our catalog, from
                nutritious food and tasty treats to cozy beds and engaging toys. Every item meets our
                strict standards for quality, safety, and value.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, PetHub serves thousands of happy pet parents across the country, and we're
                committed to making pet parenting easier, more affordable, and a whole lot more fun.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80"
                alt="Happy pets"
                className="rounded-2xl w-full h-48 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80"
                alt="Pet products"
                className="rounded-2xl w-full h-48 object-cover mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80"
                alt="Dogs playing"
                className="rounded-2xl w-full h-48 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80"
                alt="Cat relaxing"
                className="rounded-2xl w-full h-48 object-cover mt-8"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-3xl font-bold text-[#FF80C7] mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#1F2937] text-center mb-12">Why Choose PetHub?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                  >
                    <div className="w-14 h-14 bg-[#FFE8F5] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-[#FF80C7]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-[#FF80C7] to-[#F97316] rounded-3xl p-10 md:p-14 text-center text-white mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the PetHub Family</h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Sign up today and give your pet the love, care, and quality they deserve.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-[#FF80C7] font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#1F2937] text-center mb-8">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#FFE8F5] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-[#FF80C7]" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Email</h3>
                <p className="text-gray-500 text-sm">support@pethub.com</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#FFE8F5] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-[#FF80C7]" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Phone</h3>
                <p className="text-gray-500 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-12 h-12 bg-[#FFE8F5] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-[#FF80C7]" />
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Address</h3>
                <p className="text-gray-500 text-sm">123 Pet Street, New York, NY 10001</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
