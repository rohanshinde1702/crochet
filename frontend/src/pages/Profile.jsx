import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsPerson,
  BsEnvelope,
  BsTelephone,
  BsLock,
  BsShieldCheck,
  BsHeart,
  BsHandbag,
  BsBoxArrowRight,
  BsCheck2Circle,
  BsExclamationCircle,
  BsPencilSquare,
  BsKey,
  BsShop,
  BsCalendarCheck,
  BsEye,
  BsEyeSlash,
  BsGeoAlt,
  BsCreditCard,
  BsCheck2,
  BsTruck,
  BsArrowRight,
  BsReceipt,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import {
  LuUser,
  LuShieldCheck,
  LuPackage,
  LuMapPin,
  LuLock,
  LuSparkles,
  LuClock,
  LuCrown,
  LuHeart,
  LuShoppingBag,
  LuMail,
  LuPhone,
  LuKeyRound,
  LuLogOut,
  LuChevronRight,
  LuExternalLink,
} from "react-icons/lu";
import { API_ENDPOINTS } from "../config/api";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=AdminMasterArtisan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=CrochetArtisan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LunaYarn",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=MiloLoops",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=ChloeCrafts",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=OliverStitch",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=DaisyPetal",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanMaster",
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "orders", "address", "security", "activity"

  // Profile Edit State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Standard Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Forgot Password OTP Flow State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP & New Password
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: "", text: "" });
  const [forgotTimer, setForgotTimer] = useState(60);
  const [showForgotPass, setShowForgotPass] = useState(false);

  // User Orders
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Counts
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Timer countdown for Forgot OTP
  useEffect(() => {
    let interval;
    if (isForgotMode && forgotStep === 2 && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isForgotMode, forgotStep, forgotTimer]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Fetch current user details
    fetch(`${API_ENDPOINTS.AUTH}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          const u = data.user;
          setUser(u);
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            avatar: u.avatar || PRESET_AVATARS[0],
            bio: u.bio || "Passionate crochet & handmade enthusiast 🧶",
            address: u.address || "",
            city: u.city || "",
            state: u.state || "",
            pincode: u.pincode || "",
          });

          // Fetch real orders for this user
          fetchOrders(u);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
      });

    // Load local storage counts
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setCartCount(cart.length);
      setWishlistCount(wishlist.length);
    } catch (e) {}
  }, [navigate]);

  // Fetch Orders
  const fetchOrders = async (currentUser) => {
    try {
      setOrdersLoading(true);
      const res = await fetch(API_ENDPOINTS.ORDERS);
      const allOrders = await res.json();
      if (Array.isArray(allOrders)) {
        const myOrders = allOrders.filter(
          (o) =>
            (o.user && String(o.user) === String(currentUser._id || currentUser.id)) ||
            (o.customer?.email &&
              o.customer.email.toLowerCase() === currentUser.email.toLowerCase())
        );
        setUserOrders(myOrders);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const p = passwordData.newPassword;
    if (!p) return { score: 0, label: "None", color: "bg-gray-200" };
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [passwordData.newPassword]);

  // Total Lifetime Spent
  const totalSpent = useMemo(() => {
    return userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [userOrders]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_ENDPOINTS.AUTH}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated"));
      setProfileMsg({ type: "success", text: "Profile details updated successfully! ✨" });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Profile saved successfully! ✨" },
        })
      );
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Standard Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordLoading(false);
      return setPasswordMsg({ type: "error", text: "New passwords do not match." });
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordLoading(false);
      return setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_ENDPOINTS.AUTH}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setPasswordMsg({ type: "success", text: "Password updated securely! 🔒" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Password updated successfully! 🔒" },
        })
      );
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Send Forgot Password OTP
  const handleSendForgotOTP = async () => {
    if (!user?.email) return;
    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");

      setForgotStep(2);
      setForgotTimer(60);
      if (data.previewOtp) {
        setForgotOtp(data.previewOtp.split(""));
      }

      setForgotMsg({
        type: "success",
        text: data.previewOtp
          ? `Code: ${data.previewOtp} (Auto-filled for testing) ✉️`
          : `Verification code sent to ${user.email}! ✉️`,
      });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: data.previewOtp
              ? `Reset code: ${data.previewOtp} ✉️`
              : `Reset code sent to ${user.email}! ✉️`,
          },
        })
      );
    } catch (err) {
      setForgotMsg({ type: "error", text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  // OTP box input navigation
  const handleForgotOtpChange = (val, idx) => {
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...forgotOtp];
      newOtp[idx] = val;
      setForgotOtp(newOtp);
      if (val && idx < 5) {
        document.getElementById(`forgot-otp-${idx + 1}`)?.focus();
      }
    }
  };

  const handleForgotKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !forgotOtp[idx] && idx > 0) {
      document.getElementById(`forgot-otp-${idx - 1}`)?.focus();
    }
  };

  // Handle Verify Forgot OTP & Reset Password
  const handleResetPasswordViaOTP = async (e) => {
    e.preventDefault();
    const fullOtp = forgotOtp.join("");
    if (fullOtp.length !== 6) {
      return setForgotMsg({ type: "error", text: "Please enter the complete 6-digit code." });
    }

    if (!forgotNewPassword || !forgotConfirmPassword) {
      return setForgotMsg({ type: "error", text: "Please fill in all password fields." });
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      return setForgotMsg({ type: "error", text: "Passwords do not match." });
    }

    if (forgotNewPassword.length < 6) {
      return setForgotMsg({ type: "error", text: "Password must be at least 6 characters long." });
    }

    setForgotLoading(true);
    setForgotMsg({ type: "", text: "" });

    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/reset-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp: fullOtp,
          newPassword: forgotNewPassword,
          confirmNewPassword: forgotConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setForgotMsg({ type: "success", text: "Password reset successfully! 🔒" });
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setTimeout(() => {
        setIsForgotMode(false);
        setForgotStep(1);
        setPasswordMsg({
          type: "success",
          text: "Your password has been successfully reset! 🔒",
        });
      }, 1500);

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Password reset successfully! 🔒" },
        })
      );
    } catch (err) {
      setForgotMsg({ type: "error", text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      if (storedUser && storedUser.id) {
        localStorage.setItem(`user_cart_${storedUser.id}`, JSON.stringify(currentCart));
        localStorage.setItem(`user_wishlist_${storedUser.id}`, JSON.stringify(currentWishlist));
      }
    } catch (e) {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(
      new CustomEvent("showToast", { detail: { message: "Signed out successfully." } })
    );
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[#FAF5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#6C2C12] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-[#6C2C12]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recent Member";

  const isMasterAdmin =
    user.role === "admin" || user.email === "admin@cozyloops.com";

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-[#8C6D58]">
            <Link to="/" className="hover:text-[#6C2C12] transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#6C2C12] font-semibold">Account Dashboard</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">Account Active & Secured</span>
          </div>
        </div>

        {/* ================= 1. ULTRA-PROFESSIONAL HERO CARD ================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EBDCD0] mb-8 relative overflow-hidden"
        >
          {/* Subtle Decorative Background Mesh */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#F88897]/15 via-[#FAF3EB]/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#6C2C12]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 relative z-10">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Avatar with Glow Ring */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-[#FAF3EB] shadow-md overflow-hidden bg-[#FAF7F2] ring-2 ring-[#6C2C12]/10 transition-transform group-hover:scale-102">
                  <img
                    src={formData.avatar || user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#6C2C12] text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
                  {isMasterAdmin ? <LuCrown className="text-amber-300 text-sm" /> : <GiYarn className="text-sm" />}
                </div>
              </div>

              {/* User Bio & Meta */}
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A2E1B]">
                    {user.name}
                  </h1>
                  {isMasterAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[11px] font-bold border border-amber-500/30">
                      <LuCrown className="text-amber-600 text-xs" /> Master Admin
                    </span>
                  ) : totalSpent >= 4000 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 text-[11px] font-bold border border-purple-500/30">
                      <LuSparkles className="text-xs" /> VIP Collector
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] font-bold border border-emerald-500/30">
                      <LuShieldCheck className="text-xs" /> Verified Member
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#7D6352] max-w-md italic mb-2">
                  "{formData.bio || user.bio || "Crafting handmade memories with love 🧶"}"
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1.5 gap-x-4 text-xs text-[#8C6D58]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <LuMail className="text-[#F88897]" /> {user.email}
                  </span>
                  {formData.phone && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <LuPhone className="text-[#6C2C12]" /> {formData.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <BsCalendarCheck /> Joined {joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 shrink-0">
              {isMasterAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C2C12] hover:bg-[#52210E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all hover:scale-102"
                >
                  <LuCrown className="text-amber-300" /> Admin Studio
                </Link>
              )}

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF3EB] hover:bg-[#F3E5D8] text-[#6C2C12] text-xs sm:text-sm font-bold rounded-xl border border-[#EBDCD0] transition-colors"
              >
                <BsShop className="text-xs" /> Explore Shop
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <LuLogOut className="text-xs" /> Sign Out
              </button>
            </div>
          </div>

          {/* KPI Metrics Dashboard Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 pt-6 border-t border-[#F0E4D8]">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FAF3EB] border border-[#EBDCD0] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Orders Placed</span>
                <LuPackage className="text-[#6C2C12] text-sm group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#6C2C12]">{userOrders.length}</p>
            </button>

            <Link
              to="/cart"
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FAF3EB] border border-[#EBDCD0] text-left transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Cart Items</span>
                <LuShoppingBag className="text-[#6C2C12] text-sm group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#6C2C12]">{cartCount}</p>
            </Link>

            <Link
              to="/wishlist"
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FAF3EB] border border-[#EBDCD0] text-left transition-colors group"
            >
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Saved Wishlist</span>
                <LuHeart className="text-[#F88897] text-sm group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#F88897]">{wishlistCount}</p>
            </Link>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBDCD0] text-left">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
                <span>Total Spent</span>
                <BsCreditCard className="text-emerald-600 text-sm" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-700">
                ₹{totalSpent.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================= 2. MAIN WORKSPACE GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-3xl p-3 shadow-xs border border-[#EBDCD0] space-y-1.5">
              {[
                { id: "profile", label: "Personal Information", icon: <LuUser className="text-base" />, desc: "Name, bio & avatar" },
                { id: "orders", label: "My Orders & Receipts", icon: <LuPackage className="text-base" />, count: userOrders.length, desc: "Tracking & history" },
                { id: "address", label: "Saved Shipping Address", icon: <LuMapPin className="text-base" />, desc: "Default delivery location" },
                { id: "security", label: "Security & Password", icon: <LuLock className="text-base" />, desc: "Password reset & OTP" },
                { id: "activity", label: "Shopping Shortcuts", icon: <BsShop className="text-base" />, desc: "Cart & collections" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all cursor-pointer text-left ${
                    activeTab === tab.id
                      ? "bg-[#6C2C12] text-white shadow-xs"
                      : "text-[#4A2E1B] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl text-base ${
                      activeTab === tab.id ? "bg-white/15 text-white" : "bg-[#FAF3EB] text-[#6C2C12]"
                    }`}>
                      {tab.icon}
                    </span>
                    <div>
                      <span className="block font-bold">{tab.label}</span>
                      <span className={`block text-[11px] font-normal ${
                        activeTab === tab.id ? "text-white/80" : "text-gray-400"
                      }`}>
                        {tab.desc}
                      </span>
                    </div>
                  </div>

                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Security Status Widget */}
            <div className="bg-[#FAF3EB] rounded-3xl p-5 border border-[#EBDCD0]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                <LuShieldCheck className="text-base text-emerald-600" /> Account Protection
              </div>
              <p className="text-xs text-[#7D6352] leading-relaxed">
                Your credentials and transactions are fully encrypted with standard industry hashing and verified JWT tokens.
              </p>
            </div>
          </div>

          {/* Right: Content Panels */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#EBDCD0]">
              {/* ================= TAB 1: PERSONAL INFORMATION ================= */}
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#4A2E1B] flex items-center gap-2">
                      <LuUser className="text-[#6C2C12]" /> Personal Information
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
                      Manage your public artisan profile, tagline, and contact information.
                    </p>
                  </div>

                  {profileMsg.text && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                        profileMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {profileMsg.type === "success" ? (
                        <BsCheck2Circle className="text-base shrink-0 text-emerald-600" />
                      ) : (
                        <BsExclamationCircle className="text-base shrink-0 text-rose-600" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {/* Avatar Selection */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-2.5">
                        Select Artisan Avatar
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                        {PRESET_AVATARS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar: av })}
                            className={`w-12 h-12 rounded-2xl border-2 p-0.5 overflow-hidden transition-all cursor-pointer hover:scale-105 ${
                              formData.avatar === av
                                ? "border-[#6C2C12] ring-2 ring-[#6C2C12]/20 scale-105 shadow-sm bg-[#FAF3EB]"
                                : "border-[#EBDCD0] opacity-75 hover:opacity-100 bg-[#FAF7F2]"
                            }`}
                          >
                            <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <BsPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <BsTelephone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 98200 12345"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all placeholder-gray-400 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                        Email Address (Primary Login)
                      </label>
                      <div className="relative">
                        <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-500 cursor-not-allowed select-none font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Verified
                        </span>
                      </div>
                    </div>

                    {/* Bio / Tagline */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                        Artisan Bio / Tagline
                      </label>
                      <textarea
                        rows={2}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us a little about your love for handcrafted creations..."
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all placeholder-gray-400 resize-none font-medium"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-3 bg-[#6C2C12] hover:bg-[#52210E] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                      >
                        <BsCheck2 className="text-base" />
                        {profileLoading ? "Saving Changes..." : "Save Profile Details"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= TAB 2: MY ORDERS & RECEIPTS ================= */}
              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-[#4A2E1B] flex items-center gap-2">
                        <LuPackage className="text-[#6C2C12]" /> Order History & Receipts
                      </h2>
                      <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
                        Track your handcrafted orders, fulfillment status, and order invoices.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="text-xs font-bold text-[#6C2C12] hover:underline flex items-center gap-1"
                    >
                      Shop more pieces &rarr;
                    </Link>
                  </div>

                  {ordersLoading ? (
                    <div className="py-12 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-[#6C2C12] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs font-medium">Loading your orders...</p>
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="py-12 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EBDCD0] p-6">
                      <LuPackage className="text-3xl text-gray-400 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-[#4A2E1B]">No orders yet</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                        You haven't placed any handcrafted orders yet. Explore our bespoke catalog to find your next favorite piece!
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6C2C12] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#52210E] transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order, idx) => (
                        <div
                          key={order._id || idx}
                          className="p-5 rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBDCD0]/60">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#4A2E1B]">
                                  Order #{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : `ORD-${idx + 1}`)}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    order.status === "Delivered"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : order.status === "Shipped"
                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {order.status || "Processing"}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Placed on{" "}
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently"}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-xs text-gray-500 block">Total Amount</span>
                              <span className="text-base font-bold text-[#6C2C12]">
                                ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <LuPackage className="text-[#F88897]" />
                              <span>
                                {order.items ? order.items.length : 1}{" "}
                                {order.items && order.items.length === 1 ? "handmade item" : "handmade items"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                <BsTruck className="text-xs" /> Express Delivery
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= TAB 3: SAVED ADDRESS ================= */}
              {activeTab === "address" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#4A2E1B] flex items-center gap-2">
                      <LuMapPin className="text-[#6C2C12]" /> Saved Shipping Address
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
                      Save your default delivery address for seamless 1-click checkout.
                    </p>
                  </div>

                  {profileMsg.text && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                        profileMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {profileMsg.type === "success" ? (
                        <BsCheck2Circle className="text-base shrink-0 text-emerald-600" />
                      ) : (
                        <BsExclamationCircle className="text-base shrink-0 text-rose-600" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                        Street Address / Flat / Building
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Mumbai"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="e.g. Maharashtra"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          PIN Code / Zip
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="e.g. 400001"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-3 bg-[#6C2C12] hover:bg-[#52210E] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                      >
                        <BsCheck2 className="text-base" />
                        {profileLoading ? "Saving Address..." : "Save Delivery Address"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ================= TAB 4: SECURITY & CREDENTIALS ================= */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#4A2E1B] flex items-center gap-2">
                      <LuLock className="text-[#6C2C12]" /> Security & Credentials
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
                      {isForgotMode
                        ? "Reset your password via a 6-digit verification code sent to your email."
                        : "Change your password or reset via email verification."}
                    </p>
                  </div>

                  {/* Status Message */}
                  {(isForgotMode ? forgotMsg.text : passwordMsg.text) && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                        (isForgotMode ? forgotMsg.type : passwordMsg.type) === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {(isForgotMode ? forgotMsg.type : passwordMsg.type) === "success" ? (
                        <BsCheck2Circle className="text-base shrink-0 text-emerald-600" />
                      ) : (
                        <BsExclamationCircle className="text-base shrink-0 text-rose-600" />
                      )}
                      <span>{isForgotMode ? forgotMsg.text : passwordMsg.text}</span>
                    </div>
                  )}

                  {!isForgotMode ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                      {/* Current Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider">
                            Current Password *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotMode(true);
                              setForgotStep(1);
                              setForgotMsg({ type: "", text: "" });
                            }}
                            className="text-xs font-bold text-[#F88897] hover:underline cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            placeholder="Enter your current password"
                            className="w-full pl-4 pr-10 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showCurrentPass ? <BsEyeSlash /> : <BsEye />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            required
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
                            placeholder="Minimum 6 characters"
                            className="w-full pl-4 pr-10 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showNewPass ? <BsEyeSlash /> : <BsEye />}
                          </button>
                        </div>

                        {/* Password Strength Bar */}
                        {passwordData.newPassword && (
                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                              <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-gray-200"}`} />
                              <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-gray-200"}`} />
                              <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-gray-200"}`} />
                            </div>
                            <span className={`text-[10px] font-bold ${passwordStrength.text}`}>
                              Strength: {passwordStrength.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-1.5">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPass ? "text" : "password"}
                            required
                            value={passwordData.confirmNewPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                            }
                            placeholder="Re-enter new password"
                            className="w-full pl-4 pr-10 py-3 bg-[#FAF7F2] border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            {showConfirmPass ? <BsEyeSlash /> : <BsEye />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-6 py-3 bg-[#6C2C12] hover:bg-[#52210E] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60"
                        >
                          {passwordLoading ? "Updating Password..." : "Update Password"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotMode(true);
                            setForgotStep(1);
                            setForgotMsg({ type: "", text: "" });
                          }}
                          className="px-4 py-3 text-xs font-bold text-gray-500 hover:text-[#6C2C12] cursor-pointer hover:underline"
                        >
                          Reset via OTP
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* FORGOT PASSWORD OTP CARD */
                    <div className="max-w-md bg-[#FAF7F2] p-5 sm:p-6 rounded-3xl border border-[#EBDCD0]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#4A2E1B]">
                          <span className="w-7 h-7 rounded-xl bg-[#FAF3EB] text-[#6C2C12] flex items-center justify-center text-xs">
                            🔑
                          </span>
                          <span>Reset Password via OTP</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotMode(false);
                            setForgotMsg({ type: "", text: "" });
                          }}
                          className="text-xs font-semibold text-gray-500 hover:text-[#6C2C12] hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {forgotStep === 1 ? (
                        <div className="space-y-4">
                          <p className="text-xs text-[#7D6352] leading-relaxed">
                            We will send a 6-digit verification code to your registered email: <br />
                            <strong className="text-[#4A2E1B] font-semibold">{user.email}</strong>
                          </p>

                          <button
                            type="button"
                            onClick={handleSendForgotOTP}
                            disabled={forgotLoading}
                            className="w-full py-3 bg-[#6C2C12] hover:bg-[#52210E] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            <BsEnvelope className="text-sm" />
                            {forgotLoading ? "Sending Code..." : "Send Verification Code"}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleResetPasswordViaOTP} className="space-y-4">
                          <p className="text-xs text-[#7D6352]">
                            Enter the 6-digit code sent to <strong className="text-[#4A2E1B]">{user.email}</strong>:
                          </p>

                          {/* OTP Input Boxes */}
                          <div className="flex justify-center gap-2 sm:gap-2.5 py-1">
                            {forgotOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                id={`forgot-otp-${idx}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleForgotOtpChange(e.target.value, idx)}
                                onKeyDown={(e) => handleForgotKeyDown(e, idx)}
                                className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold bg-white border border-[#EBDCD0] rounded-xl text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors"
                              />
                            ))}
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showForgotPass ? "text" : "password"}
                                required
                                value={forgotNewPassword}
                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                placeholder="Create new password"
                                className="w-full px-4 pr-10 py-2.5 bg-white border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowForgotPass(!showForgotPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                {showForgotPass ? <BsEyeSlash /> : <BsEye />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm New Password */}
                          <div>
                            <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              required
                              value={forgotConfirmPassword}
                              onChange={(e) => setForgotConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full px-4 py-2.5 bg-white border border-[#EBDCD0] rounded-xl text-xs sm:text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-3 bg-[#6C2C12] hover:bg-[#52210E] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 mt-2"
                          >
                            {forgotLoading ? "Resetting Password..." : "Reset Password"}
                          </button>

                          <div className="text-center text-xs text-gray-500 pt-1">
                            {forgotTimer > 0 ? (
                              <p>
                                Resend code in <strong className="text-[#6C2C12]">{forgotTimer}s</strong>
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendForgotOTP}
                                className="text-[#F88897] font-bold hover:underline cursor-pointer"
                              >
                                Resend Verification Code
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= TAB 5: SHOPPING SHORTCUTS ================= */}
              {activeTab === "activity" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#4A2E1B] flex items-center gap-2">
                      <BsShop className="text-[#6C2C12]" /> Shopping Shortcuts & Activity
                    </h2>
                    <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
                      Quickly access your saved items, handcrafted collections, and customer support.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/cart"
                      className="p-5 rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDF4EE] text-[#6C2C12] flex items-center justify-center text-xl shadow-xs">
                          <BsHandbag />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">Shopping Bag</h4>
                          <p className="text-xs text-gray-500">{cartCount} items ready for checkout</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#6C2C12] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View <LuChevronRight />
                      </span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="p-5 rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#F88897] flex items-center justify-center text-xl shadow-xs">
                          <BsHeart />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">Saved Wishlist</h4>
                          <p className="text-xs text-gray-500">{wishlistCount} favorites bookmarked</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#F88897] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View <LuChevronRight />
                      </span>
                    </Link>

                    <Link
                      to="/shop"
                      className={`p-5 rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer ${
                        !isMasterAdmin ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF3EB] text-[#6C2C12] flex items-center justify-center text-xl shadow-xs">
                          <GiYarn />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">Explore Full Catalog</h4>
                          <p className="text-xs text-gray-500">Discover all handmade amigurumi, decor & gifts</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#6C2C12] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Explore <LuChevronRight />
                      </span>
                    </Link>

                    {isMasterAdmin && (
                      <Link
                        to="/admin"
                        className="p-5 rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#F88897] flex items-center justify-center text-xl shadow-xs">
                            <LuCrown />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#4A2E1B]">Admin Studio Control</h4>
                            <p className="text-xs text-gray-500">Manage catalog, orders & users</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#F88897] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Launch <LuChevronRight />
                        </span>
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
