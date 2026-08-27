import { useState } from "react";
import { motion } from "framer-motion";
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { FaInstagram, FaFacebookF, FaPinterestP, FaYoutube, FaRegEnvelope, FaHeart } from "react-icons/fa";
import { LuUser, LuMail, LuTag, LuPenLine, LuSend } from "react-icons/lu";
import TopBar from "../components/topBar/TopBar";
import { useSettings } from "../context/SettingsContext";

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // 'idle' | 'sending' | 'success'
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit message");

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Message sent! We'll reply to your email soon. 💌" },
        })
      );

      // Clear success notification after 6 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 6000);
    } catch (err) {
      alert(err.message || "Could not send message. Please try again.");
      setStatus("idle");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };



  return (
    <div className="relative min-h-screen bg-[#FAF6F0] overflow-hidden pt-6 pb-12">
      {/* Decorative Crochet Flowers - Top Left (Desktop Only) */}
      <div className="absolute -left-16 -top-16 w-64 h-64 opacity-100 pointer-events-none hidden xl:block z-0">
        <img
          src="/uploads/others/contact_flowers.jpg"
          alt="Crochet Flowers Decor"
          className="w-full h-full object-contain rounded-full shadow-inner"
        />
      </div>

      {/* Decorative Crochet Hearts Basket - Bottom Left (Desktop Only) */}
      <div className="absolute -left-16 bottom-32 w-64 h-64 opacity-100 pointer-events-none hidden xl:block z-0">
        <img
          src="/uploads/others/contact_hearts_basket.jpg"
          alt="Crochet Basket Decor"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      {/* Decorative Crochet Bunny - Bottom Right (Desktop Only) */}
      <div className="absolute -right-16 bottom-20 w-72 h-72 opacity-100 pointer-events-none hidden xl:block z-0">
        <img
          src="/uploads/others/contact_bunny.jpg"
          alt="Crochet Bunny Decor"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24 items-stretch justify-between py-10">

          {/* Left Column: Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full lg:w-1/2 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6">
              <motion.span
                variants={itemVariants}
                className="text-xs font-bold tracking-wider uppercase text-[#D25F5F] flex items-center gap-1.5"
              >
                We'd love to hear from you <span className="text-[#D25F5F] text-sm">♥</span>
              </motion.span>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl font-bold font-serif text-[#6C2C12]"
              >
                Contact Us
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg"
              >
                Have a question, custom request, or just want to say hello?
                We're here for you. Reach out and we'll get back to you
                as soon as possible.
              </motion.p>

              {/* Contact Info Items List */}
              <motion.div variants={itemVariants} className="flex flex-col gap-5 mt-4">
                {/* Email Us */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#6C2C12] text-xl shrink-0">
                    <IoMailOutline />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Us</h4>
                    <a
                      href={`mailto:${settings?.email || "hello@cozyloops.com"}`}
                      className="text-[#6C2C12] hover:text-[#F88897] font-semibold text-sm sm:text-base transition-colors"
                    >
                      {settings?.email || "hello@cozyloops.com"}
                    </a>
                  </div>
                </div>

                {/* Call / WhatsApp */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#6C2C12] text-xl shrink-0">
                    <IoCallOutline />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Call / WhatsApp</h4>
                    <a
                      href={`tel:${settings?.phone || "+91 12345 67890"}`}
                      className="text-[#6C2C12] hover:text-[#F88897] font-semibold text-sm sm:text-base transition-colors"
                    >
                      {settings?.phone || "+91 12345 67890"}
                    </a>
                  </div>
                </div>

                {/* Our Studio */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#6C2C12] text-xl shrink-0">
                    <IoLocationOutline />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Our Studio</h4>
                    <p className="text-[#6C2C12] font-semibold text-sm sm:text-base">
                      {settings?.address || "Mumbai, Maharashtra, India"}
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EBE0] flex items-center justify-center text-[#6C2C12] text-xl shrink-0">
                    <IoTimeOutline />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Business Hours</h4>
                    <p className="text-[#6C2C12] font-semibold text-sm sm:text-base">
                      {settings?.businessHours || "Mon - Sat: 10:00 AM - 7:00 PM"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div variants={itemVariants} className="mt-10 lg:mt-6">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#6C2C12] mb-3">Let's Connect</h5>
              <div className="flex items-center gap-3">
                {settings?.socialLinks?.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={settings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-[#D25F5F] hover:bg-[#B74A4A] transition-colors duration-300 flex items-center justify-center text-white"
                  >
                    <FaInstagram />
                  </motion.a>
                )}
                {settings?.socialLinks?.facebook && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={settings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-[#D25F5F] hover:bg-[#B74A4A] transition-colors duration-300 flex items-center justify-center text-white"
                  >
                    <FaFacebookF />
                  </motion.a>
                )}
                {settings?.socialLinks?.pinterest && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={settings.socialLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pinterest"
                    className="w-10 h-10 rounded-full bg-[#D25F5F] hover:bg-[#B74A4A] transition-colors duration-300 flex items-center justify-center text-white"
                  >
                    <FaPinterestP />
                  </motion.a>
                )}
                {settings?.socialLinks?.youtube && (
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href={settings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-10 h-10 rounded-full bg-[#D25F5F] hover:bg-[#B74A4A] transition-colors duration-300 flex items-center justify-center text-white"
                  >
                    <FaYoutube />
                  </motion.a>
                )}
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href={`mailto:${settings?.email || "hello@cozyloops.com"}`}
                  aria-label="Email Us"
                  className="w-10 h-10 rounded-full bg-[#D25F5F] hover:bg-[#B74A4A] transition-colors duration-300 flex items-center justify-center text-white"
                >
                  <FaRegEnvelope />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Contact Message Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full lg:w-1/2 bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_15px_40px_rgba(108,44,18,0.04)] border border-[#F2ECE4] flex flex-col gap-6 relative z-10"
          >
            <div className="text-center">
              <span className="text-[#D25F5F] text-xl">♡</span>
              <h2 className="text-2xl font-bold font-serif text-[#6C2C12] mt-1">Send Us a Message</h2>
              {/* Divider Decor */}
              <div className="flex items-center justify-center gap-4 my-2">
                <span className="w-12 h-px bg-[#EADFD4]"></span>
                <span className="text-[#E06D77] text-xs font-semibold">✿</span>
                <span className="w-12 h-px bg-[#EADFD4]"></span>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center font-medium"
                >
                  Thank you! Your message has been sent successfully. ♥
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Your Name */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className={`w-full bg-[#FAF8F5] border ${errors.name ? 'border-red-300 focus:border-red-400' : 'border-[#EADFD4] focus:border-[#C2A58F]'} rounded-xl px-4 py-3.5 pr-10 text-sm outline-none text-[#6C2C12] placeholder-gray-400`}
                    />
                    <LuUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full bg-[#FAF8F5] border ${errors.email ? 'border-red-300 focus:border-red-400' : 'border-[#EADFD4] focus:border-[#C2A58F]'} rounded-xl px-4 py-3.5 pr-10 text-sm outline-none text-[#6C2C12] placeholder-gray-400`}
                    />
                    <LuMail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    className={`w-full bg-[#FAF8F5] border ${errors.subject ? 'border-red-300 focus:border-red-400' : 'border-[#EADFD4] focus:border-[#C2A58F]'} rounded-xl px-4 py-3.5 pr-10 text-sm outline-none text-[#6C2C12] placeholder-gray-400`}
                  />
                  <LuTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                </div>
                {errors.subject && <p className="text-red-500 text-xs mt-1 pl-1">{errors.subject}</p>}
              </div>

              {/* Your Message */}
              <div>
                <div className="relative">
                  <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    className={`w-full bg-[#FAF8F5] border ${errors.message ? 'border-red-300 focus:border-red-400' : 'border-[#EADFD4] focus:border-[#C2A58F]'} rounded-xl px-4 py-3.5 pr-10 text-sm outline-none text-[#6C2C12] placeholder-gray-400 resize-none`}
                  ></textarea>
                  <LuPenLine className="absolute right-4 top-5 text-gray-400 text-lg" />
                </div>
                {errors.message && <p className="text-red-500 text-xs mt-1 pl-1">{errors.message}</p>}
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 1 }}
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-[#6C2C12] border-2 border-[#6C2C12] hover:bg-white hover:text-[#6C2C12] text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer shadow-md text-sm sm:text-base"
              >
                {status === "sending" ? "Sending..." : "Send Message"} <LuSend className="text-sm sm:text-base" />
              </motion.button>
            </form>

            {/* Custom/Bulk Highlight Block */}
            <div className="bg-[#FAF3EB] rounded-2xl p-4 flex items-start gap-4 border border-[#eadfd47a]">
              <span className="text-3xl filter saturate-150 py-1 text-red-800"><FaHeart /></span>
              <p className="text-xs sm:text-sm text-[#6C2C12] leading-relaxed">
                For custom orders or bulk inquiries, please mention all
                the details in your message. We'll be happy to help!
              </p>
            </div>
          </motion.div>

        </div>

        <TopBar />

      </div>
    </div>
  );
};

export default Contact;
