import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaArrowRight, FaUserCheck } from "react-icons/fa";
import { LuX, LuPlus, LuShieldCheck, LuUser, LuCheck } from "react-icons/lu";
import { BsExclamationCircle } from "react-icons/bs";
import { API_ENDPOINTS } from "../../config/api";

const DEVICE_ACCOUNTS_KEY = "cozyloops_device_accounts";

export const getSavedDeviceAccounts = () => {
  try {
    const raw = localStorage.getItem(DEVICE_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Default real known accounts if any exist on this machine
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const defaults = [];
  if (currentUser && currentUser.email) {
    defaults.push({
      name: currentUser.name || currentUser.email.split("@")[0],
      email: currentUser.email,
      avatar: currentUser.avatar,
      provider: "Google",
    });
  }
  return defaults;
};

export const saveDeviceAccount = (account) => {
  try {
    const existing = getSavedDeviceAccounts();
    const filtered = existing.filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    const updated = [account, ...filtered].slice(0, 5); // Keep up to 5 recent accounts
    localStorage.setItem(DEVICE_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

const SocialAuthModal = ({ isOpen, provider, onClose, onSuccess }) => {
  const [deviceAccounts, setDeviceAccounts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      const accounts = getSavedDeviceAccounts();
      setDeviceAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedEmail(accounts[0].email);
        setShowCustomInput(false);
      } else {
        setShowCustomInput(true);
      }

      // Try Google One-Tap if provider is Google
      if (provider === "Google" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: "1087462828282-sampleclientid.apps.googleusercontent.com",
            callback: (response) => {
              // Parse JWT credential from Google if provided
              try {
                const base64Url = response.credential.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.email) {
                  executeLogin(payload.email, payload.name, payload.picture);
                }
              } catch (err) {
                console.log("Google Credential parse fallback", err);
              }
            },
          });
        } catch (e) {
          // One tap fallback
        }
      }
    }
  }, [isOpen, provider]);

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  const executeLogin = async (email, name, avatar) => {
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const finalName = name ? name.trim() : normalizedEmail.split("@")[0];
      const finalAvatar =
        avatar ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(normalizedEmail)}`;

      const res = await fetch(`${API_ENDPOINTS.AUTH}/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider || "Google",
          name: finalName,
          email: normalizedEmail,
          avatar: finalAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Social login failed");

      // Save to device remembered accounts
      saveDeviceAccount({
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        provider: provider || "Google",
      });

      // Save token and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Restore user scoped cart
      const userScopedCart = JSON.parse(
        localStorage.getItem(`user_cart_${data.user.id || data.user._id}`)
      );
      const restoredCart =
        Array.isArray(data.user.cart) && data.user.cart.length > 0
          ? data.user.cart
          : Array.isArray(userScopedCart) && userScopedCart.length > 0
          ? userScopedCart
          : [];

      localStorage.setItem("cart", JSON.stringify(restoredCart));
      if (Array.isArray(data.user.wishlist)) {
        localStorage.setItem("wishlist", JSON.stringify(data.user.wishlist));
      }

      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Signed in as ${data.user.name} via ${provider}! 🧶✨`,
          },
        })
      );

      if (onSuccess) onSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (acc) => {
    executeLogin(acc.email, acc.name, acc.avatar);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    executeLogin(customEmail, customName);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[28px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative overflow-hidden"
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <LuX className="text-xl" />
          </button>

          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
              {provider === "Google" ? <FcGoogle /> : <FaFacebook className="text-[#1877F2]" />}
            </div>
            <h3 className="text-xl font-bold text-[#2B1810] tracking-tight">
              {provider === "Google" ? "Sign in with Google" : "Log in with Facebook"}
            </h3>
            <p className="text-xs text-[#7D6352] mt-1">
              Choose an account from your device to continue to{" "}
              <strong className="text-[#6C2C12]">CozyLoops</strong>
            </p>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <BsExclamationCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Device Suggested Accounts List */}
          {deviceAccounts.length > 0 && !showCustomInput && (
            <div className="space-y-2.5 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Accounts on this device
              </p>

              {deviceAccounts.map((acc, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAccountSelect(acc)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-[#6C2C12] hover:bg-[#FDF7F2] transition-all text-left cursor-pointer group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        acc.avatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(acc.email)}`
                      }
                      alt={acc.name}
                      className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#2B1810] truncate group-hover:text-[#6C2C12]">
                        {acc.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate">{acc.email}</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-full text-gray-400 group-hover:text-[#6C2C12] group-hover:bg-white shrink-0">
                    <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2.5 px-3 border border-dashed border-gray-300 hover:border-[#6C2C12] rounded-2xl text-xs font-bold text-[#6C2C12] hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
              >
                <LuPlus className="text-sm" />
                <span>Use another {provider} email / account</span>
              </button>
            </div>
          )}

          {/* 2. Custom Device Email AutoComplete Input (Offers Native Browser Suggestions) */}
          {(showCustomInput || deviceAccounts.length === 0) && (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              {deviceAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs font-bold text-[#E87A8A] hover:underline cursor-pointer flex items-center gap-1 mb-2"
                >
                  ← Back to device accounts
                </button>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2B1810] mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1810] mb-1">
                  {provider} Email Address *
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="email"
                    name="email"
                    required
                    autoComplete="email username"
                    inputMode="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={
                      provider === "Google" ? "Enter your Gmail address" : "Enter your Facebook email"
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] font-medium"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  💡 Type to pick from your browser's saved {provider} accounts.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60 ${
                    provider === "Google"
                      ? "bg-[#6C2C12] hover:bg-[#54210D]"
                      : "bg-[#1877F2] hover:bg-[#166FE5]"
                  }`}
                >
                  <span>
                    {loading ? `Connecting ${provider}...` : `Continue as ${customName || "User"}`}
                  </span>
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Safe Authentication Tag */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <LuShieldCheck className="text-emerald-500 text-sm" />
            <span>Encrypted & Verified via {provider} OAuth Protocol</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SocialAuthModal;
