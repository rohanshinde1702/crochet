import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsChevronDown,
  BsShieldLock,
  BsRecycle,
  BsSun,
  BsMoonStars,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import {
  LuLayoutDashboard,
  LuBoxes,
  LuLayers,
  LuShoppingBag,
  LuUsers,
  LuBookOpen,
  LuImage,
  LuSettings,
  LuPlus,
  LuTag,
  LuFileText,
  LuLogOut,
  LuBell,
  LuMail,
  LuMenu,
  LuX,
} from "react-icons/lu";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("adminTheme") || "light";
  });
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("adminTheme", nextTheme);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: nextTheme === "dark" ? "🌙 Dark Mode activated!" : "☀️ Light Mode activated!",
        },
      })
    );
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // Global counts for sidebar badges
  const [counts, setCounts] = useState({
    products: 0,
    blogs: 0,
    recycleBin: 0,
  });

  // Add Category Modal State (Shared)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🧶");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Fetch counts for badges
  const fetchCounts = async () => {
    try {
      const [prodRes, binProdRes, blogRes, binBlogRes] = await Promise.all([
        fetch("http://localhost:5000/api/products"),
        fetch("http://localhost:5000/api/products/recycle-bin"),
        fetch("http://localhost:5000/api/blogs"),
        fetch("http://localhost:5000/api/blogs/recycle-bin"),
      ]);

      const [prods, binProds, blogs, binBlogs] = await Promise.all([
        prodRes.json().catch(() => []),
        binProdRes.json().catch(() => []),
        blogRes.json().catch(() => []),
        binBlogRes.json().catch(() => []),
      ]);

      setCounts({
        products: Array.isArray(prods) ? prods.length : 0,
        blogs: Array.isArray(blogs) ? blogs.length : 0,
        recycleBin: (Array.isArray(binProds) ? binProds.length : 0) + (Array.isArray(binBlogs) ? binBlogs.length : 0),
      });
    } catch (err) {
      console.error("Failed to load badge counts:", err);
    }
  };

  // Check Authentication
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin =
      storedUser &&
      (storedUser.role === "admin" ||
        storedUser.email === "admin@cozyloops.com");

    if (isAdmin) {
      setCurrentUser(storedUser);
      setIsAuthorized(true);
      setCheckingAuth(false);
      fetchCounts();
    } else {
      setIsAuthorized(false);
      setCheckingAuth(false);
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    fetchCounts();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingCat(true);

    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: newCategoryIcon.trim() || "🧶",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Category "${newCategoryName.trim()}" registered! 🧶✨` },
        })
      );
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
      fetchCounts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Nav items configuration
  const navItems = [
    { label: "Dashboard", path: "/admin", icon: <LuLayoutDashboard />, exact: true },
    { label: "Products", path: "/admin/products", icon: <LuBoxes />, count: counts.products },
    { label: "Categories", path: "/admin/categories", icon: <LuLayers /> },
    { label: "Orders", path: "/admin/orders", icon: <LuShoppingBag /> },
    { label: "Customers", path: "/admin/customers", icon: <LuUsers /> },
    { label: "Blogs", path: "/admin/blogs", icon: <LuBookOpen />, count: counts.blogs },
    {
      label: "Recycle Bin",
      path: "/admin/recycle-bin",
      icon: <BsRecycle />,
      count: counts.recycleBin,
      isWarning: counts.recycleBin > 0,
    },
    { label: "Media", path: "/admin/media", icon: <LuImage /> },
    { label: "Settings", path: "/admin/settings", icon: <LuSettings /> },
  ];

  // Loading Screen
  if (checkingAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif] ${isDark ? "bg-[#0F172A] text-white" : "bg-[#F9FAFB] text-[#111827]"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-sm font-bold">Loading Admin Studio...</h3>
          <p className="text-xs text-gray-500 mt-1">Synchronizing cloud database</p>
        </div>
      </div>
    );
  }

  // Access Denied Screen
  if (!isAuthorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] ${isDark ? "bg-[#0F172A]" : "bg-[#F9FAFB]"}`}>
        <div className={`rounded-3xl p-8 sm:p-12 max-w-md w-full border text-center shadow-xl ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"}`}>
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center text-3xl mx-auto mb-4 border border-[#FEE2E2]">
            <BsShieldLock />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#111827]"}`}>
            Administrator Access Required
          </h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Only authorized administrators may access this dashboard.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link
              to="/signin"
              className="px-6 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className={`px-6 py-2.5 text-xs font-bold rounded-xl ${isDark ? "bg-slate-800 text-gray-200" : "bg-[#F3F4F6] text-[#374151]"}`}
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-['Plus_Jakarta_Sans',sans-serif] antialiased transition-colors duration-200 ${
      isDark ? "bg-[#0F172A] text-slate-100" : "bg-[#F9FAFB] text-[#111827]"
    }`}>
      {/* ========================================================================= */}
      {/* ======================= 1. LEFT SIDEBAR ================================= */}
      {/* ========================================================================= */}

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isDark ? "bg-[#1E293B] border-slate-800 text-slate-100" : "bg-white border-[#E5E7EB] text-[#111827]"
        } ${mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="p-6 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className={`text-2xl font-extrabold tracking-tight font-serif flex items-center gap-1.5 ${isDark ? "text-white" : "text-[#111827]"}`}>
                <span>CozyLoops</span>
                <span className="w-6 h-6 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center text-xs shadow-2xs">
                  <GiYarn />
                </span>
              </span>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-200 rounded-lg cursor-pointer"
            >
              <LuX className="text-xl" />
            </button>
          </div>

          {/* MAIN MENU */}
          <div className="space-y-1 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] px-3 mb-2">
              Main Menu
            </p>

            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? isDark
                        ? "bg-slate-800 text-blue-400 border border-blue-500/30 shadow-xs font-bold"
                        : "bg-white text-[#2563EB] border border-[#111827] shadow-xs font-bold"
                      : isDark
                      ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
                      : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-base ${isActive ? (isDark ? "text-blue-400" : "text-[#2563EB]") : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isWarning
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : isDark
                          ? "bg-slate-700 text-slate-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] px-3 mb-2">
              Quick Actions
            </p>

            <Link
              to="/admin/add-product"
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl text-xs font-bold transition-colors shadow-2xs ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-white hover:bg-[#F9FAFB] border-[#E5E7EB] text-[#374151]"
              }`}
            >
              <LuPlus className="text-sm text-[#2563EB]" />
              <span>Add Product</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl text-xs font-bold transition-colors shadow-2xs text-left cursor-pointer ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-white hover:bg-[#F9FAFB] border-[#E5E7EB] text-[#374151]"
              }`}
            >
              <LuTag className="text-sm text-[#2563EB]" />
              <span>Add Category</span>
            </button>

            <Link
              to="/admin/add-blog"
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl text-xs font-bold transition-colors shadow-2xs ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                  : "bg-white hover:bg-[#F9FAFB] border-[#E5E7EB] text-[#374151]"
              }`}
            >
              <LuFileText className="text-sm text-[#2563EB]" />
              <span>Add Story</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Bottom Logout */}
        <div className={`p-6 border-t ${isDark ? "border-slate-800" : "border-[#E5E7EB]"}`}>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LuLogOut className="text-base text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* ==================== 2. MAIN CONTENT AREA =============================== */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* ================= TOP NAVBAR ================= */}
        <header className={`h-16 border-b sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors ${
          isDark ? "bg-[#1E293B]/95 border-slate-800 backdrop-blur-md" : "bg-white/95 border-[#E5E7EB] backdrop-blur-md"
        }`}>
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg ${isDark ? "text-gray-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <LuMenu className="text-xl" />
            </button>

            {/* Global Search Box */}
            <div className="relative w-full">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search admin records..."
                className={`w-full pl-4 pr-10 py-2 border rounded-xl text-xs sm:text-sm focus:outline-none transition-all shadow-2xs ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:border-[#2563EB] focus:bg-white"
                }`}
              />
              <BsSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            </div>
          </div>

          {/* Right Action Icons & Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* ================= THEME TOGGLE BUTTON ================= */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                  : "bg-white border-[#E5E7EB] text-gray-700 hover:bg-gray-50"
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? (
                <>
                  <BsSun className="text-base text-amber-400 animate-spin-slow" />
                  <span className="text-[11px] font-bold hidden sm:inline text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <BsMoonStars className="text-sm text-indigo-600" />
                  <span className="text-[11px] font-bold hidden sm:inline text-gray-700">Dark</span>
                </>
              )}
            </button>

            {/* Quick Recycle Bin Indicator */}
            {counts.recycleBin > 0 && (
              <Link
                to="/admin/recycle-bin"
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title={`${counts.recycleBin} deleted items in Recycle Bin`}
              >
                <BsRecycle className="text-sm" />
                <span className="hidden sm:inline">Bin</span>
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-extrabold">
                  {counts.recycleBin}
                </span>
              </Link>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
                isDark ? "text-gray-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <LuBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>

            {/* Profile Menu Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#C7D2FE]">
                  RS
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-[#111827]"}`}>
                    {currentUser?.name || "Rohan Shinde"}
                  </p>
                  <p className="text-[10px] text-gray-400">Admin</p>
                </div>
                <BsChevronDown className="text-xs text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border py-2 z-50 ${
                  isDark ? "bg-[#1E293B] border-slate-700 text-slate-200" : "bg-white border-[#E5E7EB] text-gray-700"
                }`}>
                  <div className={`px-4 py-2 border-b ${isDark ? "border-slate-700" : "border-gray-100"}`}>
                    <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {currentUser?.name || "Rohan Shinde"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
                  </div>
                  <Link
                    to="/shop"
                    target="_blank"
                    className={`block px-4 py-2 text-xs ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}
                  >
                    View Storefront
                  </Link>
                  <Link
                    to="/blog"
                    target="_blank"
                    className={`block px-4 py-2 text-xs ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}
                  >
                    View Public Blog
                  </Link>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between cursor-pointer ${
                      isDark ? "hover:bg-slate-800 text-amber-300" : "hover:bg-gray-50 text-indigo-600"
                    }`}
                  >
                    <span>Theme</span>
                    <span className="text-[10px] font-bold uppercase">{theme}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-xs text-red-500 cursor-pointer ${
                      isDark ? "hover:bg-slate-800" : "hover:bg-red-50"
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= OUTLET FOR DEDICATED PAGES ================= */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          <Outlet context={{ currentUser, globalSearch, refreshCounts: fetchCounts, theme, isDark, toggleTheme }} />

          {/* Bottom Footer */}
          <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 ${
            isDark ? "border-slate-800" : "border-[#E5E7EB]"
          }`}>
            <p>© 2026 CozyLoops Studio. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                Theme: <strong className="capitalize">{theme}</strong>
              </span>
              <span>•</span>
              <p>Made with ❤️ by CozyLoops</p>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ======================= ADD CATEGORY MODAL (GLOBAL) ===================== */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${
                isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">Create New Category</h3>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded-lg cursor-pointer"
                >
                  <LuX />
                </button>
              </div>
              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Festive Holiday"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="e.g. 🎄"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                      isDark ? "border-slate-700 text-gray-300 hover:bg-slate-800" : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCat}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCat ? "Creating..." : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
