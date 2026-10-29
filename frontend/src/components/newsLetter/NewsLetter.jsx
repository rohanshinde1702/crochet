import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BsEnvelope, BsCheckCircleFill, BsArrowRight } from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    // Simulate API delay
    setTimeout(() => {
      try {
        const subscribers = JSON.parse(localStorage.getItem("cozyloops_subscribers")) || [];
        if (!subscribers.includes(email.trim().toLowerCase())) {
          subscribers.push(email.trim().toLowerCase());
          localStorage.setItem("cozyloops_subscribers", JSON.stringify(subscribers));
        }
      } catch {
        // Ignore storage errors
      }

      setStatus("success");
      setMessage("You're subscribed! Use coupon code COZY10 for 10% off your first handcrafted order.");
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Subscribed! Use code COZY10 for 10% off at checkout." },
        })
      );
    }, 600);
  };

  return (
    <section className="min-h-[500px] sm:h-125 md:h-120 w-full bg-[url('/uploads/others/newsletter.png')] bg-cover bg-center relative overflow-hidden flex items-center py-12 sm:py-0">
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[92%] sm:w-[75%] md:w-[60%] lg:w-[48%] xl:w-[38%] mx-auto sm:mx-0 sm:absolute sm:left-[8%] md:left-[10%] xl:left-[12%]"
      >
        <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-[2px] text-[#6C2C12] bg-[#FAF3EB]/90 px-3 py-1 rounded-full mb-2">
          Handcrafted With Love
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl my-2 leading-tight font-bold text-[#6C2C12]">
          Handmade Happiness Just For You!
        </h2>

        <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 max-w-lg mb-5">
          Join our artisan community to receive exclusive pattern previews, seasonal launches, and a 10% discount on your next handcrafted order.
        </p>

        {/* Newsletter Subscription Form */}
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-white/95 backdrop-blur-xs border border-emerald-300 rounded-2xl shadow-md text-emerald-800 flex items-start gap-3"
            >
              <BsCheckCircleFill className="text-xl text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">{message}</p>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-md font-mono text-xs font-bold text-emerald-900 tracking-wider">
                    COZY10
                  </span>
                  <Link
                    to="/shop"
                    className="text-xs font-bold text-[#6C2C12] hover:text-[#F88897] hover:underline"
                  >
                    Start Shopping →
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md bg-white/90 p-1.5 rounded-2xl sm:rounded-full border border-[#EADFD4] shadow-md backdrop-blur-xs">
                <div className="flex items-center w-full px-3 py-1.5">
                  <BsEnvelope className="text-gray-400 text-base shrink-0 mr-2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email address..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto shrink-0 px-6 py-2.5 bg-[#6C2C12] hover:bg-[#54210D] text-white rounded-xl sm:rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {status === "loading" ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-sm" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Get 10% Off</span>
                      <BsArrowRight className="text-xs" />
                    </>
                  )}
                </button>
              </div>

              {status === "error" && (
                <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  {message}
                </p>
              )}

              {/* Alternative Action */}
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors"
                >
                  <span>Or browse collection directly</span>
                  <span>→</span>
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default NewsLetter;
