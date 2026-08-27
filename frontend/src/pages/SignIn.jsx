import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsEnvelope,
  BsLock,
  BsEye,
  BsEyeSlash,
  BsHeart,
  BsHeartFill,
  BsX,
  BsArrowLeft,
  BsCheck2Circle,
  BsExclamationCircle,
  BsShieldCheck,
  BsTruck,
} from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaArrowRight } from "react-icons/fa";
import { GiYarn } from "react-icons/gi";
import { LuSparkles } from "react-icons/lu";
import { API_ENDPOINTS } from "../config/api";
import SocialAuthModal from "../components/auth/SocialAuthModal";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialProvider, setSocialProvider] = useState(null); // 'Google' | 'Facebook'

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotTimer, setForgotTimer] = useState(60);

  // Forgot timer countdown
  useEffect(() => {
    let interval;
    if (showForgotModal && forgotStep === 2 && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password) {
      return setError("Please enter both email and password.");
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid email or password");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Restore cart from server or user backup
      const userScopedCart = JSON.parse(
        localStorage.getItem(`user_cart_${data.user.id || data.user._id}`)
      );
      const restoredCart =
        Array.isArray(data.user.cart) && data.user.cart.length > 0
          ? data.user.cart
          : Array.isArray(userScopedCart) && userScopedCart.length > 0
          ? userScopedCart
          : [];

      // Restore wishlist from server or user backup
      const userScopedWishlist = JSON.parse(
        localStorage.getItem(`user_wishlist_${data.user.id || data.user._id}`)
      );
      const restoredWishlist =
        Array.isArray(data.user.wishlist) && data.user.wishlist.length > 0
          ? data.user.wishlist
          : Array.isArray(userScopedWishlist) && userScopedWishlist.length > 0
          ? userScopedWishlist
          : [];

      localStorage.setItem("cart", JSON.stringify(restoredCart));
      localStorage.setItem("wishlist", JSON.stringify(restoredWishlist));
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Welcome back, ${data.user.name}! 🧶` },
        })
      );
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send Forgot Password OTP
  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      return setForgotError("Please enter your registered email address.");
    }

    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");

      setForgotStep(2);
      setForgotTimer(60);
      if (data.previewOtp) {
        setForgotOtp(data.previewOtp.split(""));
      }
      setForgotSuccess(
        data.previewOtp
          ? `Reset Code: ${data.previewOtp} (Auto-filled for testing) ✉️`
          : `Verification code sent to ${forgotEmail}! ✉️`
      );
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // OTP inputs
  const handleOtpBoxChange = (val, idx) => {
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...forgotOtp];
      newOtp[idx] = val;
      setForgotOtp(newOtp);
      if (val && idx < 5) {
        document.getElementById(`signin-forgot-otp-${idx + 1}`)?.focus();
      }
    }
  };

  // Verify and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const fullOtp = forgotOtp.join("");
    if (fullOtp.length !== 6) {
      return setForgotError("Please enter complete 6-digit code.");
    }

    if (!forgotNewPassword || !forgotConfirmPassword) {
      return setForgotError("Please fill in all password fields.");
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      return setForgotError("New passwords do not match.");
    }

    if (forgotNewPassword.length < 6) {
      return setForgotError("Password must be at least 6 characters long.");
    }

    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/reset-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: fullOtp,
          newPassword: forgotNewPassword,
          confirmNewPassword: forgotConfirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setForgotSuccess("Password reset successfully! You can now sign in. 🔒");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotOtp(["", "", "", "", "", ""]);
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setFormData({ ...formData, email: forgotEmail, password: "" });
      }, 1500);

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Password reset successfully! 🔒" },
        })
      );
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#F7F3EE] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <motion.div
        layoutId="auth-card-wrapper"
        initial={{ opacity: 0, scale: 1, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl w-full min-h-[700px] lg:h-[720px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_15px_50px_rgba(108,44,18,0.08)] border border-[#EBDCD0] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative"
      >
        {/* ================= LEFT COLUMN: HERO ARTWORK & BENEFITS ================= */}
        <motion.div
          layoutId="auth-image-column"
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 bg-[#FDF6F0] relative flex flex-col justify-between p-7 sm:p-10 lg:p-12 overflow-hidden h-full min-h-[260px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-[#EBDCD0]"
        >
          {/* Subtle Warm Background Gradient & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF7F2]/95 via-[#FDF5EE]/80 to-[#FAF0E6]/95 pointer-events-none z-0" />

          {/* Background Image of Crochet Scene */}
          <motion.img
            layoutId="auth-crochet-image"
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            src="/uploads/others/signin_banner.jpg"
            alt="Handmade Crochet Setup"
            className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none mix-blend-multiply"
            onError={(e) => {
              e.target.src = "/uploads/others/signup_art.jpg";
            }}
          />
         
        </motion.div>

        {/* ================= RIGHT COLUMN: SIGN IN FORM ================= */}
        <div className="lg:col-span-6 bg-white p-7 sm:p-9 lg:p-10 flex flex-col justify-center h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1810] tracking-tight mb-2">
                Sign in to your account
              </h1>

              {/* Decorative Heart Divider */}
              <div className="flex items-center justify-center gap-2 my-1.5">
                <span className="w-10 h-[1px] bg-[#E87A8A]/40"></span>
                <BsHeartFill className="text-[11px] text-[#E87A8A]" />
                <span className="w-10 h-[1px] bg-[#E87A8A]/40"></span>
              </div>

              <p className="text-xs sm:text-sm text-[#7D6352]">
                Sign in to manage your orders, cart and favorite crochet items.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <BsExclamationCircle className="text-sm shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Email Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#2B1810] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-[#2B1810]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(formData.email);
                      setForgotStep(1);
                      setForgotError("");
                      setForgotSuccess("");
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-[#E87A8A] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <BsEyeSlash className="text-sm" /> : <BsEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1.5 group"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2.5">
                <div className="border-t border-[#E5D7CA] w-full"></div>
                <span className="bg-white px-3 text-xs text-gray-400 whitespace-nowrap">
                  or continue with
                </span>
                <div className="border-t border-[#E5D7CA] w-full"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSocialProvider("Google")}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#E5D7CA] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FcGoogle className="text-lg" />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSocialProvider("Facebook")}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#E5D7CA] rounded-xl text-xs sm:text-sm font-semibold text-gray-800 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FaFacebook className="text-lg text-[#1877F2]" />
                  <span>Continue with Facebook</span>
                </button>
              </div>
            </form>

            {/* Footer Link */}
            <div className="mt-5 text-center text-xs sm:text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-bold text-[#E87A8A] hover:underline">
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF5F0] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EADBCE] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white text-[#8C6D58] hover:text-[#6C2C12] flex items-center justify-center border border-[#EADBCE] cursor-pointer"
              >
                <BsX className="text-xl" />
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-[#FAF3EB] text-[#6C2C12] flex items-center justify-center text-xl mx-auto mb-2 shadow-xs">
                  🔑
                </div>
                <h3 className="text-xl font-bold text-[#4A2E1B]">Reset Password</h3>
                <p className="text-xs text-[#8C6D58] mt-1">
                  {forgotStep === 1
                    ? "Enter your email to receive a 6-digit verification code."
                    : `Enter the code sent to ${forgotEmail} and choose a new password.`}
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-[#FFF1F2] text-[#E87A8A] border border-[#FCD5DC] rounded-xl text-xs font-medium text-center">
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="mb-4 p-3 bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB] rounded-xl text-xs font-medium text-center">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-3 bg-white border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#7A3E20] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="flex justify-center gap-2 py-1">
                    {forgotOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`signin-forgot-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                        className="w-10 h-12 text-center text-lg font-bold bg-white border border-[#EADBCE] rounded-xl text-[#4A2E1B] focus:outline-none focus:border-[#7A3E20] transition-colors"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#7A3E20] transition-colors"
                    />
                  </div>

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
                      className="w-full px-4 py-2.5 bg-white border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] focus:outline-none focus:border-[#7A3E20] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {forgotLoading ? "Resetting Password..." : "Reset Password"}
                  </button>

                  <div className="flex items-center justify-between text-xs text-[#8C6D58] pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BsArrowLeft /> Change Email
                    </button>
                    {forgotTimer > 0 ? (
                      <span>Resend in {forgotTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendForgotOTP}
                        className="text-[#E87A8A] font-bold hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DEVICE-AWARE SOCIAL AUTH MODAL ================= */}
      <SocialAuthModal
        isOpen={!!socialProvider}
        provider={socialProvider}
        onClose={() => setSocialProvider(null)}
        onSuccess={(u) => {
          if (u.role === "admin") navigate("/admin");
          else navigate("/");
        }}
      />
    </div>
  );
};

export default SignIn;