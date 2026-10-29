import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import {
  BsHandbag,
  BsHeart,
  BsX,
  BsHouse,
  BsPerson,
  BsBoxArrowRight,
  BsSliders2,
  BsChevronDown,
  BsTruck,
  BsCreditCard,
  BsCheckCircle,
  BsQuestionCircle,
  BsShieldCheck,
  BsFileText,
  BsExclamationTriangle,
  BsGrid3X3Gap,
  BsLayoutSidebarInset,
  BsShop,
  BsStars,
} from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";
import { LuBookOpen } from "react-icons/lu";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const demoPages = [
  { label: "Checkout", path: "/checkout", icon: BsCreditCard, badge: "New" },
  { label: "Track Order", path: "/track-order", icon: BsTruck, badge: "Live" },
  { label: "Order Receipt", path: "/order-success/CL-284910", icon: BsCheckCircle },
  { label: "Help & FAQ", path: "/faq", icon: BsQuestionCircle },
  { label: "Privacy Policy", path: "/privacy-policy", icon: BsShieldCheck },
  { label: "Terms & Conditions", path: "/terms-of-service", icon: BsFileText },
  { label: "404 Error Page", path: "/404", icon: BsExclamationTriangle },
  { label: "Admin Studio", path: "/admin", icon: BsSliders2, badge: "Portal" },
];

const homePages = [
  {
    label: "Home 1 — Classic Artisan",
    path: "/",
    altPath: "/home-1",
    icon: BsHouse,
    badge: "Classic",
    desc: "Hero slider, artisan picks & maker story"
  },
  {
    label: "Home 2 — Modern Boutique",
    path: "/home-2",
    icon: BsShop,
    badge: "Boutique",
    desc: "Split hero, curated bento & weekly drop"
  },
  {
    label: "Home 3 — Studio & Workshop",
    path: "/home-3",
    icon: BsStars,
    badge: "Story",
    desc: "Interactive lookbook, workbench & gallery"
  }
];

const shopPages = [
  {
    label: "Top Filter Bar (Original)",
    path: "/shop",
    icon: BsGrid3X3Gap,
    badge: "Original",
    desc: "Original top category pills layout"
  },
  {
    label: "Left Sidebar Filter",
    path: "/shop-sidebar",
    icon: BsLayoutSidebarInset,
    badge: "Popular",
    desc: "Docked sticky sidebar with live filters"
  },
  {
    label: "Filter Drawer (On Click)",
    path: "/shop-drawer",
    icon: BsSliders2,
    badge: "Modern",
    desc: "Slide-out offcanvas filter panel"
  }
];

const blogPages = [
  {
    label: "Top Filter Bar (Original)",
    path: "/blog",
    icon: LuBookOpen,
    badge: "Original",
    desc: "Original top category pills layout"
  },
  {
    label: "Left Sidebar Filter",
    path: "/blog-sidebar",
    icon: BsLayoutSidebarInset,
    badge: "Popular",
    desc: "Docked sticky sidebar with tag cloud"
  },
  {
    label: "Filter Drawer (On Click)",
    path: "/blog-drawer",
    icon: BsSliders2,
    badge: "Modern",
    desc: "Slide-out filter drawer expanding grid"
  }
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [mobileHomeOpen, setMobileHomeOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    const loadUser = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        setUser(stored || null);
      } catch {
        setUser(null);
      }
    };

    updateCartCount();
    updateWishlistCount();
    loadUser();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
      window.removeEventListener("userUpdated", loadUser);
    };
  }, []);

  const handleLogout = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const currentWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      if (storedUser && storedUser.id) {
        localStorage.setItem(`user_cart_${storedUser.id}`, JSON.stringify(currentCart));
        localStorage.setItem(`user_wishlist_${storedUser.id}`, JSON.stringify(currentWishlist));
      }
    } catch {
      // Ignore errors
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    setCartCount(0);
    setWishlistCount(0);
    setUser(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new CustomEvent("showToast", { detail: { message: "Signed out successfully." } }));
    navigate("/");
  };

  // Close search and dropdowns on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearchOpen(false);
      setSearchTerm("");
      setDebouncedQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setHomeDropdownOpen(false);
      setShopDropdownOpen(false);
      setBlogDropdownOpen(false);
      setPagesDropdownOpen(false);
      setMobileHomeOpen(false);
      setMobileShopOpen(false);
      setMobileBlogOpen(false);
      setMobilePagesOpen(false);
      setUserDropdownOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Click outside listener for search & user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isSearchOpen]);

  // Debounce search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      const clearTimer = setTimeout(() => {
        setDebouncedQuery("");
        setSearchResults([]);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const startTimer = setTimeout(() => {
      setIsSearching(true);
    }, 0);

    const timer = setTimeout(() => {
      const query = searchTerm.trim();
      setDebouncedQuery(query);

      try {
        const localProducts = JSON.parse(localStorage.getItem("cozyloops_products")) || [];
        const results = localProducts.filter(
          (p) => p.title && p.title.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 350);

    return () => { clearTimeout(startTimer); clearTimeout(timer); };
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false);
    navigate(`/product/${product.id}`);
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isHomeActive = () => {
    return location.pathname === "/" || location.pathname.startsWith("/home-");
  };

  const isShopActive = () => location.pathname.startsWith("/shop");
  const isBlogActive = () => location.pathname.startsWith("/blog");

  const isPagesActive = () => {
    const pagePaths = [
      "/checkout",
      "/order-success",
      "/track-order",
      "/faq",
      "/privacy-policy",
      "/terms-of-service",
      "/404",
    ];
    return pagePaths.some((p) => location.pathname.startsWith(p));
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F2ECE4]/60 shadow-[0_2px_10px_rgba(108,44,18,0.05)]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12 xl:px-20">
          {/* Logo */}
          <Link to="/">
            <div className="shrink-0">
              <img
                className="h-auto w-32 object-contain sm:w-36 md:w-40 lg:w-45"
                src="/uploads/logo/logo.png"
                alt="CozyLoops"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-9 cursor-pointer text-sm xl:text-base font-bold uppercase">
              {/* Home Dropdown (Desktop) */}
              <div
                className="relative py-2"
                onMouseEnter={() => setHomeDropdownOpen(true)}
                onMouseLeave={() => setHomeDropdownOpen(false)}
              >
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 transition-all duration-300 hover:text-[#F88897] cursor-pointer uppercase font-bold text-sm xl:text-base ${
                    isHomeActive() || homeDropdownOpen ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  <span>Home</span>
                  <BsChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      homeDropdownOpen ? "rotate-180 text-[#F88897]" : ""
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {homeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-[#EADFD4] overflow-hidden z-50 p-2 normal-case text-left"
                    >
                      <div className="px-3 py-2 border-b border-[#FAF3EB] flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Storefront Styles</span>
                        <span className="text-[10px] text-[#F88897] bg-[#FAF3EB] px-2 py-0.5 rounded-full font-bold">
                          {homePages.length} Styles
                        </span>
                      </div>

                      <div className="py-1">
                        {homePages.map((item) => {
                          const Icon = item.icon;
                          const isCurrent =
                            location.pathname === item.path ||
                            (item.altPath && location.pathname === item.altPath);
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setHomeDropdownOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors group ${
                                isCurrent
                                  ? "bg-[#FAF3EB] text-[#F88897]"
                                  : "text-[#6C2C12] hover:bg-[#FAF3EB]"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                                    isCurrent
                                      ? "bg-white text-[#F88897] shadow-xs"
                                      : "bg-[#FAF3EB] text-[#6C2C12] group-hover:bg-white group-hover:text-[#F88897]"
                                  }`}
                                >
                                  <Icon className="text-sm" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors leading-tight">
                                    {item.label}
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0E8] text-[#E87A8A] shrink-0 ml-2">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/about">
                <li
                  className={`transition-all duration-300 hover:text-[#F88897] ${
                    isActive("/about") ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  About
                </li>
              </Link>
              {/* Shop Dropdown (Desktop) */}
              <div
                className="relative py-2"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <Link
                  to="/shop"
                  className={`flex items-center gap-1.5 transition-all duration-300 hover:text-[#F88897] cursor-pointer uppercase font-bold text-sm xl:text-base ${
                    isShopActive() || shopDropdownOpen ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  <span>Shop</span>
                  <BsChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      shopDropdownOpen ? "rotate-180 text-[#F88897]" : ""
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {shopDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-[#EADFD4] overflow-hidden z-50 p-2 normal-case text-left"
                    >
                      <div className="px-3 py-2 border-b border-[#FAF3EB] flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Shop Layouts</span>
                        <span className="text-[10px] text-[#F88897] bg-[#FAF3EB] px-2 py-0.5 rounded-full font-bold">
                          3 Styles
                        </span>
                      </div>

                      <div className="py-1">
                        {shopPages.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setShopDropdownOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors group ${
                                isCurrent
                                  ? "bg-[#FAF3EB] text-[#F88897]"
                                  : "text-[#6C2C12] hover:bg-[#FAF3EB]"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                                    isCurrent
                                      ? "bg-white text-[#F88897] shadow-xs"
                                      : "bg-[#FAF3EB] text-[#6C2C12] group-hover:bg-white group-hover:text-[#F88897]"
                                  }`}
                                >
                                  <Icon className="text-sm" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors leading-tight">
                                    {item.label}
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0E8] text-[#E87A8A] shrink-0 ml-2">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Blog Dropdown (Desktop) */}
              <div
                className="relative py-2"
                onMouseEnter={() => setBlogDropdownOpen(true)}
                onMouseLeave={() => setBlogDropdownOpen(false)}
              >
                <Link
                  to="/blog"
                  className={`flex items-center gap-1.5 transition-all duration-300 hover:text-[#F88897] cursor-pointer uppercase font-bold text-sm xl:text-base ${
                    isBlogActive() || blogDropdownOpen ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  <span>Blog</span>
                  <BsChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      blogDropdownOpen ? "rotate-180 text-[#F88897]" : ""
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {blogDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-[#EADFD4] overflow-hidden z-50 p-2 normal-case text-left"
                    >
                      <div className="px-3 py-2 border-b border-[#FAF3EB] flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Blog Layouts</span>
                        <span className="text-[10px] text-[#F88897] bg-[#FAF3EB] px-2 py-0.5 rounded-full font-bold">
                          3 Styles
                        </span>
                      </div>

                      <div className="py-1">
                        {blogPages.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setBlogDropdownOpen(false)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors group ${
                                isCurrent
                                  ? "bg-[#FAF3EB] text-[#F88897]"
                                  : "text-[#6C2C12] hover:bg-[#FAF3EB]"
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                                    isCurrent
                                      ? "bg-white text-[#F88897] shadow-xs"
                                      : "bg-[#FAF3EB] text-[#6C2C12] group-hover:bg-white group-hover:text-[#F88897]"
                                  }`}
                                >
                                  <Icon className="text-sm" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors leading-tight">
                                    {item.label}
                                  </div>
                                  <p className="text-[11px] text-gray-500 font-normal truncate mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0E8] text-[#E87A8A] shrink-0 ml-2">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/contact">
                <li
                  className={`transition-all duration-300 hover:text-[#F88897] ${
                    isActive("/contact") ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  Contact
                </li>
              </Link>

              {/* Pages Dropdown (Desktop) */}
              <div
                className="relative py-2"
                onMouseEnter={() => setPagesDropdownOpen(true)}
                onMouseLeave={() => setPagesDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
                  className={`flex items-center gap-1.5 transition-all duration-300 hover:text-[#F88897] cursor-pointer bg-transparent border-0 uppercase font-bold text-sm xl:text-base ${
                    isPagesActive() || pagesDropdownOpen ? "text-[#F88897]" : "text-[#6C2C12]"
                  }`}
                >
                  <span>Pages</span>
                  <BsChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      pagesDropdownOpen ? "rotate-180 text-[#F88897]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {pagesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-[#EADFD4] overflow-hidden z-50 p-2 normal-case"
                    >
                      <div className="px-3 py-2 border-b border-[#FAF3EB] flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <span>Storefront Pages</span>
                        <span className="text-[10px] text-[#F88897] bg-[#FAF3EB] px-2 py-0.5 rounded-full font-bold">
                          8 Templates
                        </span>
                      </div>

                      <div className="py-1">
                        {demoPages.map((item) => {
                          const Icon = item.icon;
                          const isCurrent =
                            location.pathname === item.path ||
                            (item.path.includes("order-success") &&
                              location.pathname.startsWith("/order-success"));
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setPagesDropdownOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors group ${
                                isCurrent
                                  ? "bg-[#FAF3EB] text-[#F88897]"
                                  : "text-[#6C2C12] hover:bg-[#FAF3EB]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                    isCurrent
                                      ? "bg-white text-[#F88897] shadow-xs"
                                      : "bg-[#FAF3EB] text-[#6C2C12] group-hover:bg-white group-hover:text-[#F88897]"
                                  }`}
                                >
                                  <Icon className="text-sm" />
                                </span>
                                <span>{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0E8] text-[#E87A8A]">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ul>
          </nav>

          {/* Desktop Action Icons */}
          <div className="hidden items-center gap-4 text-xl sm:gap-5 lg:flex">
            {/* Expanding Inline Search Bar */}
            <div ref={searchContainerRef} className="relative flex items-center">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`cursor-pointer text-[#6C2C12] hover:text-[#F88897] transition-all duration-300 bg-transparent border-0 flex items-center justify-center ${
                  isSearchOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
                title="Search products"
                aria-label="Search products"
              >
                <CiSearch className="text-2xl" />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-[#FAF6F0] rounded-full px-3 py-1.5 border border-[#EADFD4] focus-within:border-[#6C2C12] shadow-md z-30 overflow-hidden"
                  >
                    <CiSearch className="text-xl text-[#6C2C12] shrink-0 mr-1.5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchSubmit(e);
                        if (e.key === "Escape") setIsSearchOpen(false);
                      }}
                      placeholder="Search products..."
                      className="w-full bg-transparent text-xs sm:text-sm text-[#6C2C12] placeholder-gray-400 focus:outline-none"
                    />

                    {isSearching && (
                      <BiLoaderAlt className="animate-spin text-sm text-[#F88897] shrink-0 ml-1" />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchTerm("");
                        setDebouncedQuery("");
                        setSearchResults([]);
                      }}
                      className="p-0.5 text-gray-400 hover:text-[#6C2C12] transition-colors cursor-pointer shrink-0 ml-1"
                      title="Close"
                    >
                      <BsX className="text-xl" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions Popover */}
              <AnimatePresence>
                {isSearchOpen && !isSearching && debouncedQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#eadfd4] overflow-hidden z-50 py-1.5"
                  >
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-3 py-1 border-b border-[#f2ece4] flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>Suggestions ({searchResults.length})</span>
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-[#F88897] hover:underline cursor-pointer normal-case font-semibold"
                          >
                            View all
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-[#f7eee8]">
                          {searchResults.slice(0, 5).map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleSelectProduct(product)}
                              className="flex items-center gap-2.5 p-2 hover:bg-[#FAF3EB] transition-colors cursor-pointer group"
                            >
                              <img
                                src={product.img}
                                alt={product.title}
                                className="w-10 h-10 aspect-square rounded-md object-cover bg-gray-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-[#6C2C12] truncate group-hover:text-[#F88897] transition-colors">
                                  {product.title}
                                </h4>
                                <span className="text-xs font-bold text-[#6C2C12]">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {searchResults.length > 5 && (
                          <div className="p-2 border-t border-[#f2ece4] text-center bg-[#FAF6F0]">
                            <button
                              type="button"
                              onClick={handleSearchSubmit}
                              className="text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                            >
                              View all in Shop →
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 text-center">
                        <p className="text-xs font-semibold text-gray-600">
                          No products found matching "{debouncedQuery}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative" title="Wishlist">
              <BsHeart
                className={`cursor-pointer hover:text-[#F88897] transition-all duration-300 ${
                  isActive("/wishlist") ? "text-[#F88897]" : "text-[#6C2C12]"
                }`}
              />
              <AnimatePresence mode="popLayout">
                {wishlistCount > 0 && (
                  <motion.span
                    key={`desktop-wishlist-${wishlistCount}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-[#F88897] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative" title="Shopping Cart">
              <BsHandbag
                className={`cursor-pointer hover:text-[#F88897] transition-all duration-300 ${
                  isActive("/cart") ? "text-[#F88897]" : "text-[#6C2C12]"
                }`}
              />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span
                    key={`desktop-cart-${cartCount}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-[#F88897] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Account / Profile Dropdown */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center cursor-pointer"
                  title={`Logged in as ${user.name}`}
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                        user.name
                      )}`
                    }
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-[#FAF3EB] object-cover border border-[#EADFD4] hover:scale-105 transition-transform"
                  />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EADFD4] overflow-hidden z-50 py-1.5"
                    >
                      <div className="px-3.5 py-2.5 border-b border-[#FAF3EB]">
                        <p className="text-xs font-bold text-[#6C2C12] truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#6C2C12] hover:bg-[#FAF3EB] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <BsPerson className="text-sm text-[#F88897]" /> My Profile
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#6C2C12] hover:bg-[#FAF3EB] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <BsTruck className="text-sm text-[#F88897]" /> Track Orders
                        </Link>
                        <Link
                          to="/checkout"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#6C2C12] hover:bg-[#FAF3EB] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <BsCreditCard className="text-sm text-[#F88897]" /> Checkout Demo
                        </Link>
                        {(user.role === "admin" || user.email === "admin@cozyloops.com") && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#6C2C12] hover:bg-[#FAF3EB] flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <BsSliders2 className="text-sm text-[#F88897]" /> Admin Studio
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[#FAF3EB] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <BsBoxArrowRight className="text-sm" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/signin" title="Sign In" className="relative">
                <BsPerson
                  className={`cursor-pointer hover:text-[#F88897] transition-all duration-300 text-2xl ${
                    isActive("/signin") || isActive("/signup")
                      ? "text-[#F88897]"
                      : "text-[#6C2C12]"
                  }`}
                />
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-4 text-[#6C2C12] lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full overflow-hidden bg-white shadow-md lg:hidden border-b border-[#eadfd4]"
            >
              <div className="px-5 pt-4 pb-2">
                {/* Mobile Search input */}
                <div className="relative">
                  <div className="flex items-center bg-[#FAF6F0] rounded-full px-3 py-2 border border-[#EADFD4] focus-within:border-[#6C2C12]">
                    <CiSearch className="text-xl text-[#6C2C12] shrink-0 mr-2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchSubmit(e);
                          setMenuOpen(false);
                        }
                      }}
                      placeholder="Search products..."
                      className="w-full bg-transparent text-xs text-[#6C2C12] placeholder-gray-400 focus:outline-none"
                    />
                    {isSearching && (
                      <BiLoaderAlt className="animate-spin text-sm text-[#F88897] shrink-0 ml-1.5" />
                    )}
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="text-gray-400 hover:text-[#6C2C12] ml-1"
                      >
                        <BsX className="text-lg" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Suggestions */}
                  {!isSearching && debouncedQuery && (
                    <div className="mt-2 bg-white rounded-lg border border-[#eadfd4] shadow-md overflow-hidden divide-y divide-[#f7eee8]">
                      {searchResults.length > 0 ? (
                        searchResults.slice(0, 4).map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              handleSelectProduct(product);
                              setMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-2"
                          >
                            <img
                              src={product.img}
                              alt={product.title}
                              className="w-8 h-8 rounded-md object-cover"
                            />
                            <span className="text-xs font-semibold text-[#6C2C12] truncate flex-1">
                              {product.title}
                            </span>
                            <span className="text-xs font-bold text-[#6C2C12]">
                              ₹{product.price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="p-2.5 text-center text-xs text-gray-500">
                          No products available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <nav className="px-5 py-3">
                <ul className="flex flex-col text-sm font-bold uppercase">
                  {/* Mobile Home Accordion */}
                  <li className="border-b border-gray-100 py-2.5">
                    <button
                      type="button"
                      onClick={() => setMobileHomeOpen(!mobileHomeOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-bold uppercase text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                    >
                      <span>Home ({homePages.length} Styles)</span>
                      <BsChevronDown
                        className={`text-xs transition-transform duration-200 ${
                          mobileHomeOpen ? "rotate-180 text-[#F88897]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileHomeOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-2 pl-2 space-y-1 normal-case"
                        >
                          {homePages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] hover:bg-[#FAF3EB] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="text-sm text-[#F88897]" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E8] text-[#E87A8A]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                  <Link to="/about">
                    <li
                      className={`border-b border-gray-100 py-3 transition-all duration-300 hover:text-[#F88897] ${
                        isActive("/about") ? "text-[#F88897]" : "text-[#6C2C12]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      About
                    </li>
                  </Link>
                  {/* Mobile Shop Accordion */}
                  <li className="border-b border-gray-100 py-2.5">
                    <button
                      type="button"
                      onClick={() => setMobileShopOpen(!mobileShopOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-bold uppercase text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                    >
                      <span>Shop ({shopPages.length} Layouts)</span>
                      <BsChevronDown
                        className={`text-xs transition-transform duration-200 ${
                          mobileShopOpen ? "rotate-180 text-[#F88897]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileShopOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-2 pl-2 space-y-1 normal-case"
                        >
                          {shopPages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] hover:bg-[#FAF3EB] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="text-sm text-[#F88897]" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E8] text-[#E87A8A]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Mobile Pages Accordion */}
                  <li className="border-b border-gray-100 py-2.5">
                    <button
                      type="button"
                      onClick={() => setMobilePagesOpen(!mobilePagesOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-bold uppercase text-[#6C2C12] hover:text-[#F88897] transition-colors"
                    >
                      <span>Store Pages ({demoPages.length})</span>
                      <BsChevronDown
                        className={`text-xs transition-transform duration-200 ${
                          mobilePagesOpen ? "rotate-180 text-[#F88897]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobilePagesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-2 pl-2 space-y-1 normal-case"
                        >
                          {demoPages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] hover:bg-[#FAF3EB] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="text-sm text-[#F88897]" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E8] text-[#E87A8A]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>

                  {/* Mobile Blog Accordion */}
                  <li className="border-b border-gray-100 py-2.5">
                    <button
                      type="button"
                      onClick={() => setMobileBlogOpen(!mobileBlogOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-bold uppercase text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                    >
                      <span>Blog ({blogPages.length} Layouts)</span>
                      <BsChevronDown
                        className={`text-xs transition-transform duration-200 ${
                          mobileBlogOpen ? "rotate-180 text-[#F88897]" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileBlogOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-2 pl-2 space-y-1 normal-case"
                        >
                          {blogPages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] hover:bg-[#FAF3EB] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="text-sm text-[#F88897]" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF0E8] text-[#E87A8A]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                  <Link to="/contact">
                    <li
                      className={`border-b border-gray-100 py-3 transition-all duration-300 hover:text-[#F88897] ${
                        isActive("/contact") ? "text-[#F88897]" : "text-[#6C2C12]"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Contact
                    </li>
                  </Link>
                  {user && (user.role === "admin" || user.email === "admin@cozyloops.com") && (
                    <Link to="/admin">
                      <li
                        className={`border-b border-gray-100 py-3 transition-all duration-300 hover:text-[#F88897] flex items-center justify-between ${
                          isActive("/admin") ? "text-[#F88897]" : "text-[#6C2C12]"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>Admin Studio</span>
                        <span className="text-[10px] bg-[#FAF3EB] text-[#F88897] font-bold px-2 py-0.5 rounded-md uppercase">
                          Admin
                        </span>
                      </li>
                    </Link>
                  )}
                  {user ? (
                    <Link to="/profile">
                      <li
                        className={`py-3 transition-all duration-300 hover:text-[#F88897] flex items-center justify-between ${
                          isActive("/profile") ? "text-[#F88897]" : "text-[#6C2C12]"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>My Profile ({user.name})</span>
                        <span className="text-xs bg-[#FAF3EB] px-2 py-0.5 rounded-md lowercase font-normal">
                          Account
                        </span>
                      </li>
                    </Link>
                  ) : (
                    <Link to="/signin">
                      <li
                        className={`py-3 transition-all duration-300 hover:text-[#F88897] ${
                          isActive("/signin") ? "text-[#F88897]" : "text-[#6C2C12]"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign In / Register
                      </li>
                    </Link>
                  )}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Floating Bottom Navigation */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#eadfd4] shadow-[0_-4px_12px_rgba(108,44,18,0.08)] px-6 py-2 flex items-center justify-around z-50 lg:hidden"
      >
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === "/" ? "text-[#F88897]" : "text-[#6C2C12]"
          }`}
        >
          <BsHouse className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[#6C2C12] hover:text-[#F88897] transition-all cursor-pointer bg-transparent border-0"
        >
          <CiSearch className="text-2xl font-bold" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Search</span>
        </button>
        <Link
          to="/wishlist"
          className={`flex flex-col items-center gap-1 relative transition-all ${
            location.pathname === "/wishlist" ? "text-[#F88897]" : "text-[#6C2C12]"
          }`}
        >
          <BsHeart className="text-xl" />
          <AnimatePresence mode="popLayout">
            {wishlistCount > 0 && (
              <motion.span
                key={`mobile-wishlist-${wishlistCount}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -top-2 right-2 w-4 h-4 rounded-full bg-[#F88897] text-white text-[9px] font-bold flex items-center justify-center"
              >
                {wishlistCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist</span>
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center gap-1 relative transition-all ${
            location.pathname === "/cart" ? "text-[#F88897]" : "text-[#6C2C12]"
          }`}
        >
          <BsHandbag className="text-xl" />
          <AnimatePresence mode="popLayout">
            {cartCount > 0 && (
              <motion.span
                key={`mobile-cart-${cartCount}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -top-2 -right-0.5 w-4 h-4 rounded-full bg-[#F88897] text-white text-[9px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
        </Link>
        <Link
          to={user ? "/profile" : "/signin"}
          className={`flex flex-col items-center gap-1 relative transition-all ${
            location.pathname === "/profile" ||
            location.pathname === "/signin" ||
            location.pathname === "/signup"
              ? "text-[#F88897]"
              : "text-[#6C2C12]"
          }`}
        >
          <BsPerson className="text-xl" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {user ? "Account" : "Sign In"}
          </span>
        </Link>
      </motion.div>
    </>
  );
};

export default Header;
