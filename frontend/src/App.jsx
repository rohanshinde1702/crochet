import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BsHeartFill, BsHeart, BsHandbag, BsCheck2, BsX, BsTrash, BsInfoCircle, BsCheck2Circle } from "react-icons/bs";
import AppRoutes from "./routes/index";

const App = () => {
  const { pathname } = useLocation();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleToast = (e) => {
      const detail = e.detail || {};
      const rawMessage = typeof detail === "string" ? detail : detail.message || "";
      const explicitType = detail.type || "";
      const id = Date.now() + Math.random();

      // Determine category and style based on message content or explicit type
      let toastConfig = {
        badge: "Notification",
        badgeBg: "bg-[#FAF3EB] text-[#6C2C12]",
        iconBg: "bg-[#FAF3EB] text-[#6C2C12]",
        progressBarBg: "bg-[#6C2C12]",
        icon: <BsCheck2 className="text-base" />,
      };

      const lower = rawMessage.toLowerCase();

      if (explicitType === "wishlist_add" || (lower.includes("wishlist") && (lower.includes("added") || lower.includes("saved")))) {
        toastConfig = {
          badge: "Wishlist",
          badgeBg: "bg-[#FFF0F3] text-[#F88897] border border-[#F88897]/20",
          iconBg: "bg-[#FFF0F3] text-[#F88897]",
          progressBarBg: "bg-[#F88897]",
          icon: <BsHeartFill className="text-sm" />,
        };
      } else if (explicitType === "wishlist_remove" || (lower.includes("wishlist") && (lower.includes("removed") || lower.includes("cleared")))) {
        toastConfig = {
          badge: "Wishlist Updated",
          badgeBg: "bg-[#FFF5F5] text-[#E05353] border border-[#E05353]/20",
          iconBg: "bg-[#FFF5F5] text-[#E05353]",
          progressBarBg: "bg-[#E05353]",
          icon: <BsHeart className="text-sm" />,
        };
      } else if (explicitType === "cart_add" || (lower.includes("cart") && lower.includes("added"))) {
        toastConfig = {
          badge: "Shopping Bag",
          badgeBg: "bg-[#FDF4EE] text-[#6C2C12] border border-[#6C2C12]/20",
          iconBg: "bg-[#FDF4EE] text-[#6C2C12]",
          progressBarBg: "bg-[#6C2C12]",
          icon: <BsHandbag className="text-sm" />,
        };
      } else if (explicitType === "cart_remove" || (lower.includes("cart") && lower.includes("removed"))) {
        toastConfig = {
          badge: "Cart Updated",
          badgeBg: "bg-[#FFF5F5] text-[#E05353] border border-[#E05353]/20",
          iconBg: "bg-[#FFF5F5] text-[#E05353]",
          progressBarBg: "bg-[#E05353]",
          icon: <BsTrash className="text-sm" />,
        };
      } else if (lower.includes("already in your cart")) {
        toastConfig = {
          badge: "Already in Bag",
          badgeBg: "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20",
          iconBg: "bg-[#FFFBEB] text-[#D97706]",
          progressBarBg: "bg-[#D97706]",
          icon: <BsInfoCircle className="text-sm" />,
        };
      } else if (lower.includes("copied") || lower.includes("clipboard")) {
        toastConfig = {
          badge: "Link Copied",
          badgeBg: "bg-[#ECFDF5] text-[#059669] border border-[#059669]/20",
          iconBg: "bg-[#ECFDF5] text-[#059669]",
          progressBarBg: "bg-[#059669]",
          icon: <BsCheck2Circle className="text-sm" />,
        };
      } else if (lower.includes("success") || lower.includes("placed") || lower.includes("sent")) {
        toastConfig = {
          badge: "Success",
          badgeBg: "bg-[#ECFDF5] text-[#059669] border border-[#059669]/20",
          iconBg: "bg-[#ECFDF5] text-[#059669]",
          progressBarBg: "bg-[#059669]",
          icon: <BsCheck2Circle className="text-sm" />,
        };
      }

      // Format clean message text (remove trailing heart/yarn emojis from the main body for cleaner typography)
      const cleanMessage = rawMessage.replace(/[♥🧶♡✿]/g, "").trim();

      const newToast = {
        id,
        message: cleanMessage,
        ...toastConfig,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("showToast", handleToast);
    return () => {
      window.removeEventListener("showToast", handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="relative">
      <AppRoutes />

      {/* Global Toast Container */}
      <div className="fixed top-20 right-4 sm:top-24 sm:right-8 z-9999 flex flex-col gap-3 pointer-events-none max-w-[92vw] sm:max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -15, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative overflow-hidden bg-white/95 backdrop-blur-md border border-[#EADFD4] text-[#6C2C12] p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_32px_-6px_rgba(108,44,18,0.12),0_4px_12px_rgba(0,0,0,0.04)] flex items-start gap-3.5 pointer-events-auto min-w-[280px] sm:min-w-[320px]"
            >
              {/* Left Circular Icon Badge */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${toast.iconBg}`}>
                {toast.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${toast.badgeBg}`}>
                    {toast.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#6C2C12] leading-snug line-clamp-2">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-[#6C2C12] p-1 rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                title="Dismiss"
              >
                <BsX className="text-lg" />
              </button>

              {/* Bottom Progress Timer Bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-[2.5px] ${toast.progressBarBg} opacity-40`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App; 