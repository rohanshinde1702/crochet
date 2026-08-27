import { useState, useEffect } from "react";
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
  BsArrowLeft,
  BsEye,
  BsEyeSlash,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { API_ENDPOINTS } from "../config/api";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=CrochetArtisan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LunaYarn",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=MiloLoops",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=ChloeCrafts",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=OliverStitch",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=DaisyPetal",
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "security", "activity"

  // Profile Edit State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
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

    // Fetch user details
    fetch(`${API_ENDPOINTS.AUTH}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            avatar: data.user.avatar || PRESET_AVATARS[0],
          });
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin");
      });

    // Load counts
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setCartCount(cart.length);
    setWishlistCount(wishlist.length);
  }, [navigate]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          avatar: formData.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userUpdated"));
      setProfileMsg({ type: "success", text: "Profile updated successfully! ✨" });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Profile details saved! ✨" },
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
      return setPasswordMsg({ type: "error", text: "Password must be at least 6 characters long." });
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

      setPasswordMsg({ type: "success", text: "Password updated successfully! 🔒" });
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
      setForgotMsg({ type: "success", text: `Verification code sent to ${user.email}! ✉️` });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Reset code sent to ${user.email}! ✉️` },
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
        setPasswordMsg({ type: "success", text: "Your password has been successfully reset! 🔒" });
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

  return (
    <div className="min-h-screen bg-[#FAF5F0] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D58] mb-6">
          <Link to="/" className="hover:text-[#6C2C12] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#6C2C12] font-semibold">My Account</span>
        </div>

        {/* ================= HERO PROFILE CARD ================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EADFD4] mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F88897]/15 via-[#FAF3EB] to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* User Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FAF3EB] shadow-md overflow-hidden bg-[#FFF9F5]">
                <img
                  src={formData.avatar || user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#6C2C12] text-white flex items-center justify-center text-xs shadow-md">
                <GiYarn />
              </div>
            </div>

            {/* User Details */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A2E1B]">
                    {user.name}
                  </h1>
                  <p className="text-sm text-[#8C6D58] mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                    <BsEnvelope className="text-xs" /> {user.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF5F5] hover:bg-[#FFE5E8] text-[#E05353] border border-[#FCD5DC] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <BsBoxArrowRight /> Sign Out
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
                <Link
                  to="/cart"
                  className="bg-[#FAF7F2] hover:bg-[#FAF3EB] border border-[#EADBCE] rounded-2xl p-3 text-center transition-colors group cursor-pointer"
                >
                  <div className="text-lg sm:text-xl font-bold text-[#6C2C12] group-hover:scale-105 transition-transform">
                    {cartCount}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#8C6D58] font-medium flex items-center justify-center gap-1 mt-0.5">
                    <BsHandbag className="text-[10px]" /> Cart Items
                  </div>
                </Link>

                <Link
                  to="/wishlist"
                  className="bg-[#FAF7F2] hover:bg-[#FAF3EB] border border-[#EADBCE] rounded-2xl p-3 text-center transition-colors group cursor-pointer"
                >
                  <div className="text-lg sm:text-xl font-bold text-[#F88897] group-hover:scale-105 transition-transform">
                    {wishlistCount}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#8C6D58] font-medium flex items-center justify-center gap-1 mt-0.5">
                    <BsHeart className="text-[10px]" /> Wishlist
                  </div>
                </Link>

                <div className="bg-[#FAF7F2] border border-[#EADBCE] rounded-2xl p-3 text-center">
                  <div className="text-xs sm:text-sm font-bold text-[#4A2E1B] truncate">
                    {joinDate}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#8C6D58] font-medium flex items-center justify-center gap-1 mt-0.5">
                    <BsCalendarCheck className="text-[10px]" /> Joined
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#EADFD4] space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer text-left ${
                  activeTab === "profile"
                    ? "bg-[#6C2C12] text-white shadow-sm"
                    : "text-[#4A2E1B] hover:bg-[#FAF3EB]"
                }`}
              >
                <BsPencilSquare className="text-base" />
                <span>Personal Information</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer text-left ${
                  activeTab === "security"
                    ? "bg-[#6C2C12] text-white shadow-sm"
                    : "text-[#4A2E1B] hover:bg-[#FAF3EB]"
                }`}
              >
                <BsKey className="text-base" />
                <span>Security & Password</span>
              </button>

              <button
                onClick={() => setActiveTab("activity")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer text-left ${
                  activeTab === "activity"
                    ? "bg-[#6C2C12] text-white shadow-sm"
                    : "text-[#4A2E1B] hover:bg-[#FAF3EB]"
                }`}
              >
                <BsShop className="text-base" />
                <span>Quick Shopping Links</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#EADFD4]">
              {/* TAB 1: PERSONAL INFORMATION */}
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-bold text-[#4A2E1B] mb-1 flex items-center gap-2">
                    <BsPerson className="text-[#6C2C12]" /> Personal Information
                  </h2>
                  <p className="text-xs text-[#8C6D58] mb-6">
                    Update your account details and choose your artisanal avatar.
                  </p>

                  {profileMsg.text && (
                    <div
                      className={`mb-5 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        profileMsg.type === "success"
                          ? "bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]"
                          : "bg-[#FFF1F2] text-[#E87A8A] border border-[#FCD5DC]"
                      }`}
                    >
                      {profileMsg.type === "success" ? (
                        <BsCheck2Circle className="text-base shrink-0" />
                      ) : (
                        <BsExclamationCircle className="text-base shrink-0" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {/* Avatar Picker */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] mb-2.5">
                        Choose Your Avatar
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        {PRESET_AVATARS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar: av })}
                            className={`w-12 h-12 rounded-full border-2 p-0.5 overflow-hidden transition-transform cursor-pointer hover:scale-105 ${
                              formData.avatar === av
                                ? "border-[#6C2C12] scale-110 shadow-md ring-2 ring-[#6C2C12]/20"
                                : "border-[#EADBCE] opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <BsPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284]" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email Address (Read-only) */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284]" />
                        <input
                          type="email"
                          disabled
                          value={formData.email}
                          className="w-full pl-10 pr-4 py-3 bg-[#F5EFE9] border border-[#EADBCE] rounded-xl text-sm text-[#8C6D58] cursor-not-allowed select-none"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#EAF7EE] text-[#1E7E34] px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A89284] mt-1">
                        Email cannot be changed directly as it is linked to your account.
                      </p>
                    </div>

                    {/* Phone Number (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <BsTelephone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284]" />
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-colors placeholder-[#B5A497]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
                    >
                      {profileLoading ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: SECURITY & PASSWORD */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-[#4A2E1B] flex items-center gap-2">
                      <BsLock className="text-[#6C2C12]" /> Security & Password
                    </h2>
                  </div>
                  <p className="text-xs text-[#8C6D58] mb-6">
                    {isForgotMode
                      ? "Reset your password via a secure verification code sent to your email."
                      : "Keep your account secure by updating your password or reset via email OTP."}
                  </p>

                  {/* Status message for password changes */}
                  {(isForgotMode ? forgotMsg.text : passwordMsg.text) && (
                    <div
                      className={`mb-5 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        (isForgotMode ? forgotMsg.type : passwordMsg.type) === "success"
                          ? "bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]"
                          : "bg-[#FFF1F2] text-[#E87A8A] border border-[#FCD5DC]"
                      }`}
                    >
                      {(isForgotMode ? forgotMsg.type : passwordMsg.type) === "success" ? (
                        <BsCheck2Circle className="text-base shrink-0" />
                      ) : (
                        <BsExclamationCircle className="text-base shrink-0" />
                      )}
                      <span>{isForgotMode ? forgotMsg.text : passwordMsg.text}</span>
                    </div>
                  )}

                  {!isForgotMode ? (
                    /* ================= OPTION A: STANDARD PASSWORD CHANGE ================= */
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-[#4A2E1B]">
                            Current Password
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
                        <input
                          type="password"
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-colors placeholder-[#B5A497]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-colors placeholder-[#B5A497]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordData.confirmNewPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                          }
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] focus:bg-white transition-colors placeholder-[#B5A497]"
                        />
                      </div>

                      <p className="flex items-center gap-1.5 text-[11px] text-[#8C6D58] pt-1">
                        <BsShieldCheck className="text-[#6C2C12]" /> Passwords are encrypted with bcrypt for maximum security.
                      </p>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-6 py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
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
                          className="px-4 py-3 text-xs font-bold text-[#8C6D58] hover:text-[#6C2C12] cursor-pointer hover:underline"
                        >
                          Reset via Email OTP
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ================= OPTION B: FORGOT PASSWORD OTP RESET ================= */
                    <div className="max-w-md bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#EADBCE]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#4A2E1B]">
                          <span className="w-6 h-6 rounded-full bg-[#FAF3EB] text-[#6C2C12] flex items-center justify-center text-xs">
                            🔑
                          </span>
                          <span>Reset Password via Email OTP</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotMode(false);
                            setForgotMsg({ type: "", text: "" });
                          }}
                          className="text-xs font-semibold text-[#8C6D58] hover:text-[#6C2C12] hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {forgotStep === 1 ? (
                        <div className="space-y-4">
                          <p className="text-xs text-[#7D6352] leading-relaxed">
                            We will send a 6-digit verification code to your verified email: <br />
                            <strong className="text-[#4A2E1B] font-semibold">{user.email}</strong>
                          </p>

                          <button
                            type="button"
                            onClick={handleSendForgotOTP}
                            disabled={forgotLoading}
                            className="w-full py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            <BsEnvelope className="text-sm" />
                            {forgotLoading ? "Sending Code..." : "Send Verification Code"}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleResetPasswordViaOTP} className="space-y-4">
                          <p className="text-xs text-[#7D6352]">
                            Enter the 6-digit code sent to <strong className="text-[#4A2E1B]">{user.email}</strong> and create your new password:
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
                                className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold bg-white border border-[#EADBCE] rounded-xl text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors"
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
                                className="w-full px-4 pr-10 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors placeholder-[#B5A497]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowForgotPass(!showForgotPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89284] hover:text-[#6C2C12] cursor-pointer"
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
                              className="w-full px-4 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#6C2C12] transition-colors placeholder-[#B5A497]"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 mt-2"
                          >
                            {forgotLoading ? "Resetting Password..." : "Reset Password"}
                          </button>

                          <div className="text-center text-xs text-[#8C6D58] pt-1">
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

              {/* TAB 3: QUICK SHOPPING LINKS */}
              {activeTab === "activity" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-bold text-[#4A2E1B] mb-1 flex items-center gap-2">
                    <BsShop className="text-[#6C2C12]" /> Quick Shopping Access
                  </h2>
                  <p className="text-xs text-[#8C6D58] mb-6">
                    Quickly jump into your saved items or explore the handcrafted collection.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/cart"
                      className="p-5 rounded-2xl border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#FDF4EE] text-[#6C2C12] flex items-center justify-center text-xl">
                          <BsHandbag />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">Shopping Bag</h4>
                          <p className="text-xs text-[#8C6D58]">{cartCount} items ready for checkout</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#6C2C12] group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="p-5 rounded-2xl border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#FFF0F3] text-[#F88897] flex items-center justify-center text-xl">
                          <BsHeart />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">My Wishlist</h4>
                          <p className="text-xs text-[#8C6D58]">{wishlistCount} saved favorites</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#F88897] group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </Link>

                    <Link
                      to="/shop"
                      className={`p-5 rounded-2xl border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer ${
                        !(user.role === "admin" || user.email === "admin@cozyloops.com") ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#FAF3EB] text-[#6C2C12] flex items-center justify-center text-xl">
                          <GiYarn />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4A2E1B]">Explore Full Collection</h4>
                          <p className="text-xs text-[#8C6D58]">Browse hundreds of handcrafted creations</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#6C2C12] group-hover:translate-x-1 transition-transform">
                        Shop →
                      </span>
                    </Link>

                    {(user.role === "admin" || user.email === "admin@cozyloops.com") && (
                      <Link
                        to="/admin"
                        className="p-5 rounded-2xl border border-[#EADBCE] bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#FFF0F3] text-[#F88897] flex items-center justify-center text-xl">
                            <BsKey />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#4A2E1B]">Admin Control Panel</h4>
                            <p className="text-xs text-[#8C6D58]">Add, edit & manage product catalog</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#F88897] group-hover:translate-x-1 transition-transform">
                          Manage →
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
