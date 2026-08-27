import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsArrowLeft,
  BsEye,
  BsEyeSlash,
  BsPerson,
  BsEnvelope,
  BsLock,
  BsShieldCheck,
  BsHeart,
  BsHeartFill,
  BsTruck,
  BsGift,
  BsExclamationCircle,
} from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaArrowRight } from "react-icons/fa";
import { GiYarn } from "react-icons/gi";
import { LuSparkles } from "react-icons/lu";
import { API_ENDPOINTS } from "../config/api";
import SocialAuthModal from "../components/auth/SocialAuthModal";

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details Form, 2 = OTP Verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [socialProvider, setSocialProvider] = useState(null); // 'Google' | 'Facebook'

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, agreeToTerms } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return setError("Please fill in all required fields.");
    }

    if (!agreeToTerms) {
      return setError("Please agree to the Terms & Conditions and Privacy Policy.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/send-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setStep(2);
      setTimer(60);
      if (data.previewOtp) {
        setOtp(data.previewOtp.split(""));
      }
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: data.previewOtp
              ? `Verification code: ${data.previewOtp} (Auto-filled for testing) ✉️`
              : `Verification code sent to ${email}! ✉️`,
          },
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP box input navigation
  const handleOtpChange = (val, idx) => {
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (val && idx < 5) {
        document.getElementById(`otp-${idx + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) return setError("Please enter complete 6-digit code.");

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.AUTH}/verify-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: fullOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Welcome to CozyLoops, ${data.user.name}! 🧶` },
        })
      );
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        {/* ================= LEFT COLUMN: SIGN UP FORM ================= */}
        <div className="lg:col-span-6 bg-white p-7 sm:p-9 lg:p-10 flex flex-col justify-center h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
          {/* Header */}
          <div className="text-center mb-3.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B1810] tracking-tight mb-1">
              {step === 1 ? "Create your account" : "Verify your email"}
            </h1>

            {/* Decorative Heart Divider */}
            <div className="flex items-center justify-center gap-2 my-1.5">
              <span className="w-10 h-[1px] bg-[#E87A8A]/40"></span>
              <BsHeartFill className="text-[11px] text-[#E87A8A]" />
              <span className="w-10 h-[1px] bg-[#E87A8A]/40"></span>
            </div>

            <p className="text-xs sm:text-sm text-[#7D6352]">
              {step === 1
                ? "Join CozyLoops and discover handmade creations made with love."
                : `Enter the 6-digit verification code sent to ${formData.email}`}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <BsExclamationCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Sign Up Form */
            <form onSubmit={handleSendOTP} className="space-y-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#2B1810] mb-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <BsPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#2B1810] mb-0.5">
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
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#2B1810] mb-0.5">
                  Password
                </label>
                <div className="relative">
                  <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-11 py-2 sm:py-2.5 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#2B1810] mb-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-11 py-2 sm:py-2.5 bg-white border border-[#E5D7CA] rounded-xl text-xs sm:text-sm text-[#2B1810] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] focus:ring-1 focus:ring-[#6C2C12] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <BsEyeSlash className="text-sm" /> : <BsEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded text-[#E87A8A] accent-[#E87A8A] border-[#EADBCE] cursor-pointer"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-[#7D6352] cursor-pointer select-none">
                  I agree to the{" "}
                  <span className="text-[#E87A8A] font-semibold hover:underline">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-[#E87A8A] font-semibold hover:underline">
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1 group"
              >
                <span>{loading ? "Sending Verification Code..." : "Sign Up"}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#E5D7CA] w-full"></div>
                <span className="bg-white px-2.5 text-xs text-gray-400 whitespace-nowrap">
                  or sign up with
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
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOTP} className="space-y-5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C2C12] hover:underline cursor-pointer"
              >
                <BsArrowLeft /> Back to account details
              </button>

              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-10 h-12 text-center text-lg font-bold bg-white border border-[#E5D7CA] rounded-xl text-[#2B1810] focus:outline-none focus:border-[#6C2C12] transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#6C2C12] hover:bg-[#54210D] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 group"
              >
                <span>{loading ? "Verifying Code..." : "Verify & Complete Registration"}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center text-xs text-[#8C6D58]">
                {timer > 0 ? (
                  <p>
                    Resend verification code in{" "}
                    <strong className="text-[#6C2C12]">{timer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-[#E87A8A] font-bold hover:underline cursor-pointer"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-[#E87A8A] hover:underline">
              Sign In
            </Link>
          </div>
        </motion.div>
        </div>

        {/* ================= RIGHT COLUMN: HERO ARTWORK & BENEFITS ================= */}
        <motion.div
          layoutId="auth-image-column"
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 bg-[#FDF6F0] relative flex flex-col justify-between p-7 sm:p-10 lg:p-12 overflow-hidden h-full min-h-[260px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-[#EBDCD0]"
        >
          {/* Subtle Warm Background Gradient & Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF7F2]/95 via-[#FDF5EE]/80 to-[#FAF0E6]/95 pointer-events-none z-0" />

          {/* Background Image of Crochet Scene */}
          <motion.img
            layoutId="auth-crochet-image"
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src="/uploads/others/signin_banner.jpg"
            alt="Handmade Crochet Setup"
            className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none mix-blend-multiply"
            onError={(e) => {
              e.target.src = "/uploads/others/signup_art.jpg";
            }}
          />

        </motion.div>
      </motion.div>

      {/* ================= DEVICE-AWARE SOCIAL AUTH MODAL ================= */}
      <SocialAuthModal
        isOpen={!!socialProvider}
        provider={socialProvider}
        onClose={() => setSocialProvider(null)}
        onSuccess={() => navigate("/")}
      />
    </div>
  );
};

export default SignUp;