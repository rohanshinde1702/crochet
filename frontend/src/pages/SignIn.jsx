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
} from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const userScopedCart = JSON.parse(localStorage.getItem(`user_cart_${data.user.id}`));
      const restoredCart = (Array.isArray(data.user.cart) && data.user.cart.length > 0)
        ? data.user.cart
        : (Array.isArray(userScopedCart) && userScopedCart.length > 0)
        ? userScopedCart
        : [];

      // Restore wishlist from server or user backup
      const userScopedWishlist = JSON.parse(localStorage.getItem(`user_wishlist_${data.user.id}`));
      const restoredWishlist = (Array.isArray(data.user.wishlist) && data.user.wishlist.length > 0)
        ? data.user.wishlist
        : (Array.isArray(userScopedWishlist) && userScopedWishlist.length > 0)
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
      setForgotSuccess(`Verification code sent to ${forgotEmail}! ✉️`);
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
    <div className="min-h-screen bg-[#F7EFE9] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl w-full bg-[#FAF5F0] rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(108,44,18,0.1)] border border-[#EADBCE] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative"
      >
        {/* ================= LEFT COLUMN: FORM ================= */}
        <div className="lg:col-span-7 bg-[#FDFAF7] p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1.5 mb-2 group">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#E87A8A]">
                Cozy<span className="text-[#6C2C12]">Loops</span>
              </span>
              <span className="w-6 h-6 rounded-full bg-[#FCE8EB] text-[#E87A8A] flex items-center justify-center text-xs">
                🧶
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] flex items-center justify-center gap-1.5 tracking-tight">
              Welcome Back <span className="text-[#E87A8A]">💕</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
              Sign in to manage your orders, cart and favorite crochet items.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 text-xs bg-[#FFF1F2] text-[#E87A8A] border border-[#FCD5DC] rounded-xl font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284] text-sm" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#4A2E1B]">
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
                  className="text-xs font-semibold text-[#E87A8A] hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284] text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89284] hover:text-[#7A3E20] cursor-pointer"
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-[#7A3E20] hover:bg-[#633017] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#EADBCE] w-full"></div>
              <span className="bg-[#FDFAF7] px-3 text-xs text-[#8C6D58] whitespace-nowrap">
                or sign in with
              </span>
              <div className="border-t border-[#EADBCE] w-full"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("showToast", {
                      detail: { message: "Google Sign-In coming soon! 🧶" },
                    })
                  )
                }
                className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-white border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-[#4A2E1B] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <FcGoogle className="text-lg" />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("showToast", {
                      detail: { message: "Facebook Sign-In coming soon! 🧶" },
                    })
                  )
                }
                className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-white border border-[#EADBCE] rounded-xl text-xs sm:text-sm font-semibold text-[#4A2E1B] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <FaFacebook className="text-lg text-[#1877F2]" />
                <span>Continue with Facebook</span>
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-xs text-[#8C6D58]">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-[#E87A8A] hover:underline">
              Sign Up
            </Link>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ARTWORK SHOWCASE ================= */}
        <div className="lg:col-span-5 bg-[#F6ECE2] relative flex flex-col justify-between overflow-hidden p-6 sm:p-10 border-t lg:border-t-0 lg:border-l border-[#EADBCE]">
          {/* Top Decorative Text */}
          <div className="text-center z-10">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FDFAF7] text-[#E87A8A] flex items-center justify-center text-lg mb-3 shadow-xs">
              <BsHeart />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#4A2E1B] font-semibold leading-tight">
              Handmade with love, <br />
              <span className="text-[#E87A8A] italic font-normal">just for you.</span>
            </h2>

            {/* Divider with heart */}
            <div className="flex items-center justify-center gap-2 my-3 text-[#D5C2B2]">
              <span className="w-8 h-[1px] bg-[#D5C2B2]"></span>
              <BsHeartFill className="text-[10px] text-[#E87A8A]" />
              <span className="w-8 h-[1px] bg-[#D5C2B2]"></span>
            </div>

            <p className="text-xs sm:text-sm text-[#7D6352] max-w-xs mx-auto leading-relaxed">
              Sign in to manage your orders, cart and favorite crochet items.
            </p>
          </div>

          {/* Bottom Crochet Artwork Image */}
          <div className="mt-6 sm:mt-8 relative rounded-2xl overflow-hidden shadow-md border border-[#EADBCE]/80 z-10 aspect-[4/4.2]">
            <img
              src="/uploads/others/signup_art.jpg"
              alt="Handmade Crochet Creations"
              className="w-full h-full object-cover"
            />
            {/* Subtle bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
          </div>
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
                    className="w-full py-3 bg-[#7A3E20] hover:bg-[#633017] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
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
                    className="w-full py-3 bg-[#7A3E20] hover:bg-[#633017] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
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
    </div>
  );
};

export default SignIn;