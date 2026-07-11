import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ChevronRight, Send, Clock,Loader2 } from "lucide-react";
import { submitContact } from "../../api/contactService";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@pethub.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+1 (555) 123-4567",
    sub: "Mon-Fri 9AM-6PM",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "123 Pet Street, New York, NY 10001",
    sub: "Come say hello!",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitContact(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Message Sent!</h2>
          <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="text-[#FF80C7] hover:underline font-medium"
          >
            Send another message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-[#FF80C7] transition-colors">Home</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#FF80C7] font-medium">Contact</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4">Contact Us</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Have a question, concern, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <div className="w-12 h-12 bg-[#FFE8F5] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[#FF80C7]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] mb-1">{item.title}</h3>
                  <p className="text-gray-700 text-sm font-medium">{item.details}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="  mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-7 bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF80C7] focus:ring-2 focus:ring-[#FF80C7]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF80C7] focus:ring-2 focus:ring-[#FF80C7]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF80C7] focus:ring-2 focus:ring-[#FF80C7]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF80C7] focus:ring-2 focus:ring-[#FF80C7]/20 outline-none transition-all resize-none"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-linear-to-r from-[#FF80C7] to-[#F97316] text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex  gap-3 flex-1"
            >
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-[#FFE8F5] rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#FF80C7]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-1">{item.title}</h3>
                      <p className="text-gray-700 text-sm">{item.details}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
                    </div>
                  </div>
                );
              })}

              <div className="bg-linear-to-r from-[#FFE8F5] to-[#FFF3E8] rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#FF80C7] mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#1F2937] mb-1">Business Hours</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
