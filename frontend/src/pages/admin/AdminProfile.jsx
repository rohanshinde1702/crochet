import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { BsShieldLock, BsCheckCircleFill, BsExclamationCircle, BsEye, BsEyeSlash, BsEnvelope, BsTelephone, BsGeoAlt, BsKey, BsPersonBadge,
  BsSun,BsMoonStars,} from "react-icons/bs";
import { LuUser, LuSave, LuShieldCheck, LuLock, LuMail, LuCrown, LuSparkles, LuBoxes, LuShoppingBag, } from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const ADMIN_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=AdminMasterArtisan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanMasterAdmin",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=FelixCrochetAdmin",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=LunaArtisanLead",
  "https://api.dicebear.com/7.x/bottts/svg?seed=CozyStudioBot",
  "https://api.dicebear.com/7.x/micah/svg?seed=CozyCreativeAdmin",
];

const AdminProfile = () => {
  const { isDark, theme, toggleTheme, refreshCounts } = useOutletContext();

  const [adminUser, setAdminUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  });

  const [formData, setFormData] = useState({
    name: adminUser.name || "",
    email: adminUser.email || "",
    phone: adminUser.phone || "",
    avatar: adminUser.avatar || ADMIN_AVATARS[0],
    bio: adminUser.bio || "Lead Artisan & Administrator at CozyLoops Handcrafted.",
    address: adminUser.address || "",
    city: adminUser.city || "",
    state: adminUser.state || "",
    pincode: adminUser.pincode || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Password Update State
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState({ current: false, next: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // Active Tab
  const [activeTab, setActiveTab] = useState("general"); // "general" | "security"

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (stored && stored.email) {
      setAdminUser(stored);
      setFormData({
        name: stored.name || "",
        email: stored.email || "",
        phone: stored.phone || "",
        avatar: stored.avatar || ADMIN_AVATARS[0],
        bio: stored.bio || "Lead Artisan & Administrator at CozyLoops Handcrafted.",
        address: stored.address || "",
        city: stored.city || "",
        state: stored.state || "",
        pincode: stored.pincode || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      const updated = { ...adminUser, ...data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      setAdminUser(updated);

      setProfileMsg({
        type: "success",
        text: "Administrator profile details updated successfully! ✨",
      });

      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Admin profile saved to MongoDB! 🧶" },
        })
      );
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPassLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");

      setPassMsg({
        type: "success",
        text: "Administrator password updated successfully! 🔒",
      });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Password updated successfully! 🔒" },
        })
      );
    } catch (err) {
      setPassMsg({ type: "error", text: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Profile
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[11px] font-bold flex items-center gap-1">
              <LuCrown className="text-xs" />
              <span>Super Admin</span>
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Manage your administrator credentials, personal info, and security preferences
          </p>
        </div>

        {/* Action Link to Storefront */}
        <Link
          to="/"
          target="_blank"
          className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
            isDark ? "border-slate-700 hover:bg-slate-800 text-gray-200" : "border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          <LuSparkles className="text-amber-500 text-xs" />
          <span>View Live Storefront</span>
        </Link>
      </div>

      {/* Hero Banner Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs relative overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Large Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-lg bg-gradient-to-tr from-blue-50 to-indigo-100 p-1">
              <img
                src={formData.avatar || ADMIN_AVATARS[0]}
                alt={adminUser.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-slate-900" title="Admin Active">
              <LuShieldCheck />
            </span>
          </div>

          {/* Details */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold">{adminUser.name || "Administrator"}</h2>
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold self-center sm:self-auto">
                Full Privileges
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <LuMail className="text-xs" />
              <span>{adminUser.email}</span>
            </p>
            <p className={`text-xs mt-2.5 max-w-xl ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {formData.bio || "Lead Artisan & Administrator at CozyLoops Handcrafted."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`flex items-center gap-2 p-1 rounded-2xl border ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-gray-200"
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-[#2563EB] text-white shadow-xs"
              : isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <LuUser className="text-sm" />
          <span>General Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#2563EB] text-white shadow-xs"
              : isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <LuLock className="text-sm" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* ================= TAB 1: GENERAL INFORMATION ================= */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveProfile} className={`p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">
              Select Admin Avatar
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {ADMIN_AVATARS.map((avatarUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatar: avatarUrl })}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 p-0.5 transition-transform hover:scale-105 cursor-pointer ${
                    formData.avatar === avatarUrl
                      ? "border-[#2563EB] ring-2 ring-blue-500/20 scale-105 bg-blue-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <img src={avatarUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {profileMsg.text && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              {profileMsg.type === "success" ? <BsCheckCircleFill /> : <BsExclamationCircle />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
              </div>
            </div>

            {/* Email Address (Read-only for Admin ID) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Administrator Email (Verified)
              </label>
              <div className="relative">
                <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border cursor-not-allowed opacity-75 ${
                    isDark ? "bg-slate-900/60 border-slate-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <BsTelephone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                City / Location
              </label>
              <div className="relative">
                <BsGeoAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
              </div>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Business / Shipping Address
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full studio or administrative shipping address..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] resize-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                }`}
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Administrator Bio / Tagline
              </label>
              <textarea
                rows={2}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief introduction displayed across system receipts and admin notes..."
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] resize-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <LuSave className="text-sm" />
              <span>{savingProfile ? "Saving to Database..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: SECURITY & PASSWORD ================= */}
      {activeTab === "security" && (
        <form onSubmit={handleUpdatePassword} className={`p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div>
            <h3 className="text-base font-bold">Update Master Password</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Ensure your administrator account uses a strong, secure passphrase.
            </p>
          </div>

          {/* Alerts */}
          {passMsg.text && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              passMsg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              {passMsg.type === "success" ? <BsCheckCircleFill /> : <BsExclamationCircle />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <div className="space-y-4 max-w-lg">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <BsKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass.current ? "text" : "password"}
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPass.current ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <BsShieldLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass.next ? "text" : "password"}
                  required
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass({ ...showPass, next: !showPass.next })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPass.next ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <BsShieldLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPass.next ? "text" : "password"}
                  required
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border focus:outline-none focus:border-[#2563EB] ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-gray-800"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <LuLock className="text-sm" />
              <span>{passLoading ? "Updating Password..." : "Update Master Password"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminProfile;
