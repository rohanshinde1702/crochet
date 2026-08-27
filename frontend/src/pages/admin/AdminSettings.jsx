import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BsCheck2,
  BsSun,
  BsMoonStars,
  BsInstagram,
  BsFacebook,
  BsPinterest,
  BsYoutube,
  BsTwitterX,
  BsWhatsapp,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsClock,
} from "react-icons/bs";
import {
  LuSave,
  LuStore,
  LuBell,
  LuPalette,
  LuShare2,
  LuPhoneCall,
} from "react-icons/lu";
import { useSettings } from "../../context/SettingsContext";

const AdminSettings = () => {
  const { isDark, toggleTheme } = useOutletContext();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();

  // Form State
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [freeShippingLimit, setFreeShippingLimit] = useState(999);
  const [currency, setCurrency] = useState("INR (₹)");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    pinterest: "",
    youtube: "",
    twitter: "",
  });

  const [saving, setSaving] = useState(false);

  // Populate state once settings load
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || "CozyLoops Studio");
      setEmail(settings.email || "cozyloops.crochet@gmail.com");
      setPhone(settings.phone || "+91 98765 43210");
      setWhatsapp(settings.whatsapp || "+91 98765 43210");
      setAddress(settings.address || "Mumbai, Maharashtra, India");
      setBusinessHours(settings.businessHours || "Mon - Sat: 10:00 AM - 7:00 PM");
      setFreeShippingLimit(settings.freeShippingLimit || 999);
      setCurrency(settings.currency || "INR (₹)");
      setMaintenanceMode(Boolean(settings.maintenanceMode));
      setSocialLinks({
        instagram: settings.socialLinks?.instagram || "https://instagram.com/",
        facebook: settings.socialLinks?.facebook || "https://facebook.com/",
        pinterest: settings.socialLinks?.pinterest || "https://pinterest.com/",
        youtube: settings.socialLinks?.youtube || "https://youtube.com/",
        twitter: settings.socialLinks?.twitter || "https://x.com/",
      });
    }
  }, [settings]);

  const handleSocialChange = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSettings({
        storeName,
        email,
        phone,
        whatsapp,
        address,
        businessHours,
        socialLinks,
        freeShippingLimit,
        currency,
        maintenanceMode,
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Store Settings & Configuration
        </h1>
        <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
          Manage your live social media links, support email, phone numbers, address, and theme appearance
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ================= 1. CONTACT INFORMATION & ADDRESS ================= */}
        <div className={`rounded-2xl p-6 border shadow-2xs space-y-4 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}>
            <div className="flex items-center gap-2.5">
              <LuPhoneCall className="text-lg text-[#2563EB]" />
              <h3 className="font-bold text-sm">Contact Information & Physical Address</h3>
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold">
              Updates Footer, Contact & Header
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Support Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsEnvelope className="text-xs text-blue-500" />
                <span>Support & Contact Email *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. cozyloops.crochet@gmail.com"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsTelephone className="text-xs text-blue-500" />
                <span>Contact Phone Number *</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsWhatsapp className="text-xs text-emerald-500" />
                <span>WhatsApp Order Support Number</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Business Hours */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsClock className="text-xs text-amber-500" />
                <span>Business & Working Hours</span>
              </label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="e.g. Mon - Sat: 10:00 AM - 7:00 PM"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Studio / Physical Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsGeoAlt className="text-xs text-red-500" />
                <span>Studio Location / Physical Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra, India"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ================= 2. SOCIAL MEDIA PROFILES & LINKS ================= */}
        <div className={`rounded-2xl p-6 border shadow-2xs space-y-4 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}>
            <div className="flex items-center gap-2.5">
              <LuShare2 className="text-lg text-[#2563EB]" />
              <h3 className="font-bold text-sm">Social Media Links</h3>
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold">
              Live Clickable Links in Footer & Contact
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsInstagram className="text-xs text-pink-500" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
                placeholder="https://instagram.com/cozyloops"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsFacebook className="text-xs text-blue-600" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) => handleSocialChange("facebook", e.target.value)}
                placeholder="https://facebook.com/cozyloops"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Pinterest */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsPinterest className="text-xs text-red-600" />
                <span>Pinterest Board URL</span>
              </label>
              <input
                type="url"
                value={socialLinks.pinterest}
                onChange={(e) => handleSocialChange("pinterest", e.target.value)}
                placeholder="https://pinterest.com/cozyloops"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsYoutube className="text-xs text-red-500" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={socialLinks.youtube}
                onChange={(e) => handleSocialChange("youtube", e.target.value)}
                placeholder="https://youtube.com/@cozyloops"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            {/* Twitter / X */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                <BsTwitterX className="text-xs" />
                <span>Twitter / X Profile URL</span>
              </label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                placeholder="https://x.com/cozyloops"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ================= 3. STORE DETAILS & SHIPPING ================= */}
        <div className={`rounded-2xl p-6 border shadow-2xs space-y-4 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}>
            <LuStore className="text-lg text-[#2563EB]" />
            <h3 className="font-bold text-sm">Store Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Store Brand Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs cursor-not-allowed ${
                  isDark ? "bg-slate-900/50 border-slate-800 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(Number(e.target.value))}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ================= 4. THEME APPEARANCE CARD ================= */}
        <div className={`rounded-2xl p-6 border shadow-2xs space-y-4 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}>
            <LuPalette className="text-lg text-[#2563EB]" />
            <h3 className="font-bold text-sm">Theme Appearance</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <div
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                !isDark
                  ? "border-[#2563EB] bg-blue-50/50 shadow-xs"
                  : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-2xs">
                  <BsSun />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-[#111827]"}`}>
                    Light Theme
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Clean, bright aesthetic for daytime work
                  </p>
                </div>
              </div>
              {!isDark && (
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs shadow-2xs">
                  <BsCheck2 />
                </span>
              )}
            </div>

            {/* Dark Mode Card */}
            <div
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                isDark
                  ? "border-[#2563EB] bg-slate-800 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center text-xl shadow-2xs border border-slate-700">
                  <BsMoonStars />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-[#111827]"}`}>
                    Dark Theme
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Sleek dark mode to reduce eye strain
                  </p>
                </div>
              </div>
              {isDark && (
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs shadow-2xs">
                  <BsCheck2 />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            <LuSave className="text-base" />
            <span>{saving ? "Saving Changes..." : "Save All Settings & Social Links"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
