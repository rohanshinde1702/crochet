import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

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
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Verification code sent to ${email}! ✉️` },
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
          detail: { message: `Welcome to Crochet, ${data.user.name}! 🧶` },
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
    <div className="min-h-screen bg-[#F7EFE9] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl w-full bg-[#FAF5F0] rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(108,44,18,0.1)] border border-[#EADBCE] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* ================= LEFT COLUMN: FORM ================= */}
        <div className="lg:col-span-7 bg-[#FDFAF7] p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 mb-2 group">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#E87A8A]">
                Cozy<span className="text-[#6C2C12]">Loops</span>
              </span>
              <span className="w-6 h-6 rounded-full bg-[#FCE8EB] text-[#E87A8A] flex items-center justify-center text-xs">
                🧶
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] flex items-center justify-center gap-1.5 tracking-tight">
              {step === 1 ? "Create Your Account" : "Verify Your Email"}{" "}
              <span className="text-[#E87A8A]">💕</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8C6D58] mt-1">
              {step === 1
                ? "Join CozyLoops and discover handmade creations made with love."
                : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-xs bg-[#FFF1F2] text-[#E87A8A] border border-[#FCD5DC] rounded-xl font-medium text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            /* Step 1: Sign Up Form */
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <BsPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284] text-base" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284] text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89284] hover:text-[#7A3E20] cursor-pointer"
                  >
                    {showPassword ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
                <p className="flex items-center gap-1 text-[11px] text-[#8C6D58] mt-1.5">
                  <BsShieldCheck className="text-[#E87A8A]" /> Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89284] text-base" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-sm text-[#4A2E1B] placeholder-[#B5A497] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A89284] hover:text-[#7A3E20] cursor-pointer"
                  >
                    {showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1">
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

              {/* Sign Up Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#7A3E20] hover:bg-[#633017] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? "Sending Verification Code..." : "Sign Up"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#EADBCE] w-full"></div>
                <span className="bg-[#FDFAF7] px-3 text-xs text-[#8C6D58] whitespace-nowrap">
                  or sign up with
                </span>
                <div className="border-t border-[#EADBCE] w-full"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("showToast", {
                        detail: { message: "Google Sign-Up coming soon! 🧶" },
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
                        detail: { message: "Facebook Sign-Up coming soon! 🧶" },
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
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOTP} className="space-y-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A3E20] hover:underline cursor-pointer"
              >
                <BsArrowLeft /> Back to account details
              </button>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-[#4A2E1B] focus:outline-none focus:border-[#7A3E20] focus:bg-white transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#7A3E20] hover:bg-[#633017] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {loading ? "Verifying Code..." : "Verify & Complete Registration"}
              </button>

              <div className="text-center text-xs text-[#8C6D58]">
                {timer > 0 ? (
                  <p>
                    Resend verification code in{" "}
                    <strong className="text-[#7A3E20]">{timer}s</strong>
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
          <div className="mt-5 text-center text-xs text-[#8C6D58]">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-[#E87A8A] hover:underline">
              Sign In
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
              Create an account and be the first to know about new arrivals, special offers and more!
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
    </div>
  );
};

export default SignUp;