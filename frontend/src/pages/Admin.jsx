import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsPencil,
  BsTrash3,
  BsChevronDown,
  BsCurrencyRupee,
  BsCheck2,
  BsExclamationCircle,
  BsExclamationTriangle,
  BsShieldLock,
  BsArrowCounterclockwise,
  BsRecycle,
  BsEye,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { API_ENDPOINTS } from "../config/api";
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
  LuPackage,
  LuShoppingCart,
  LuTrendingUp,
  LuFilter,
  LuDownload,
  LuMenu,
  LuX,
  LuTrash2,
  LuStar,
} from "react-icons/lu";

const CATEGORIES = [
  "Decor & Gifts",
  "Pet & Animal",
  "Home & Living",
  "Kids & Baby",
  "Personalized",
];

const CATEGORY_ICONS = {
  "Decor & Gifts": "🌻",
  "Pet & Animal": "🐾",
  "Home & Living": "🏡",
  "Kids & Baby": "👶",
  "Personalized": "🎁",
};

const BLOG_CATEGORIES = [
  "Crochet Guides",
  "Patterns & Inspo",
  "Yarn 101",
  "Care & Tips",
  "Behind The Stitches",
  "Cozy Living",
];

// Sample mock data for Orders, Customers, and Media tabs
const SAMPLE_ORDERS = [
  { id: "ORD-9821", customer: "Aarav Sharma", email: "aarav.s@gmail.com", items: 3, total: 2497, status: "Delivered", date: "May 25, 2026" },
  { id: "ORD-9820", customer: "Priya Patel", email: "priya.p@outlook.com", items: 1, total: 899, status: "Processing", date: "May 24, 2026" },
  { id: "ORD-9819", customer: "Ananya Iyer", email: "ananya.iyer@gmail.com", items: 2, total: 1398, status: "Delivered", date: "May 24, 2026" },
  { id: "ORD-9818", customer: "Vikram Malhotra", email: "vikram.m@yahoo.com", items: 4, total: 3296, status: "Shipped", date: "May 23, 2026" },
  { id: "ORD-9817", customer: "Sneha Roy", email: "sneha.roy@gmail.com", items: 1, total: 499, status: "Pending", date: "May 22, 2026" },
];

const SAMPLE_CUSTOMERS = [
  { id: "CUST-101", name: "Aarav Sharma", email: "aarav.s@gmail.com", orders: 5, spent: 4890, joined: "Jan 12, 2026" },
  { id: "CUST-102", name: "Priya Patel", email: "priya.p@outlook.com", orders: 2, spent: 1798, joined: "Feb 04, 2026" },
  { id: "CUST-103", name: "Ananya Iyer", email: "ananya.iyer@gmail.com", orders: 4, spent: 3450, joined: "Feb 19, 2026" },
  { id: "CUST-104", name: "Vikram Malhotra", email: "vikram.m@yahoo.com", orders: 7, spent: 6920, joined: "Mar 01, 2026" },
  { id: "CUST-105", name: "Sneha Roy", email: "sneha.roy@gmail.com", orders: 1, spent: 499, joined: "Apr 15, 2026" },
];

const ITEMS_PER_PAGE = 8;

const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Section Refs for smooth scrolling
  const dashboardTopRef = useRef(null);
  const quickActionsRef = useRef(null);
  const tableSectionRef = useRef(null);

  // Sidebar & Layout state
  const [activeMenu, setActiveMenu] = useState("Dashboard"); // "Dashboard" | "Products" | "Categories" | "Orders" | "Customers" | "Blogs" | "Recycle Bin" | "Media" | "Settings"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Products"); // "Products" | "Categories" | "Blogs" | "Orders" | "Customers" | "Recycle Bin"

  // Dedicated Recycle Bin sub-tab
  const [recycleSubTab, setRecycleSubTab] = useState("products"); // "products" | "blogs"

  // Products state
  const [products, setProducts] = useState([]);
  const [recycleBinProducts, setRecycleBinProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productPage, setProductPage] = useState(1);
  const [productViewRecycle, setProductViewRecycle] = useState(false);

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [recycleBinBlogs, setRecycleBinBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("All");
  const [blogPage, setBlogPage] = useState(1);
  const [blogViewRecycle, setBlogViewRecycle] = useState(false);

  // Global search from top bar
  const [globalSearch, setGlobalSearch] = useState("");

  // Modal states
  const [deletingItem, setDeletingItem] = useState(null); // { type: "product"|"blog"|"empty_bin", item?: any, isPermanent?: boolean, target?: string, count?: number }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Category modal state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Profile menu dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Helper date formatter
  const formatDeletionDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateStr);
    }
  };

  // Load products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchProductRecycleBin = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/recycle-bin`);
      const data = await res.json();
      if (Array.isArray(data)) setRecycleBinProducts(data);
    } catch (err) {
      console.error("Failed to load product recycle bin:", err);
    }
  };

  // Load blogs
  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const res = await fetch(API_ENDPOINTS.BLOGS);
      const data = await res.json();
      if (Array.isArray(data)) setBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchBlogRecycleBin = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.BLOGS}/recycle-bin`);
      const data = await res.json();
      if (Array.isArray(data)) setRecycleBinBlogs(data);
    } catch (err) {
      console.error("Failed to load blog recycle bin:", err);
    }
  };

  const reloadAll = () => {
    fetchProducts();
    fetchProductRecycleBin();
    fetchBlogs();
    fetchBlogRecycleBin();
  };

  // Authentication check
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
      reloadAll();
    } else {
      setIsAuthorized(false);
      setCheckingAuth(false);
    }
  }, []);

  // Menu Click with Smooth Scroll to Quick Actions / Specific Section
  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    setMobileSidebarOpen(false);

    if (menuName === "Dashboard") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (menuName === "Products") {
        setActiveTab("Products");
        setProductViewRecycle(false);
      } else if (menuName === "Categories") {
        setActiveTab("Categories");
      } else if (menuName === "Blogs") {
        setActiveTab("Blogs");
        setBlogViewRecycle(false);
      } else if (menuName === "Orders") {
        setActiveTab("Orders");
      } else if (menuName === "Customers") {
        setActiveTab("Customers");
      } else if (menuName === "Recycle Bin") {
        setActiveTab("Recycle Bin");
      } else if (menuName === "Media") {
        setActiveTab("Products");
      } else if (menuName === "Settings") {
        setActiveTab("Products");
      }

      // Smooth scroll to table section
      setTimeout(() => {
        if (tableSectionRef.current) {
          tableSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  // Computed filtered products (supports active and recycle bin view)
  const filteredProducts = useMemo(() => {
    const baseList = productViewRecycle ? recycleBinProducts : products;
    const query = (globalSearch || productSearch).toLowerCase().trim();

    return baseList.filter((item) => {
      const matchSearch =
        query === "" ||
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query) ||
        `clp${String(item.id).padStart(3, "0")}`.includes(query);

      const matchCategory =
        productCategoryFilter === "All" || item.category === productCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [products, recycleBinProducts, productViewRecycle, globalSearch, productSearch, productCategoryFilter]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, productPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  // Computed filtered blogs (supports active and recycle bin view)
  const filteredBlogs = useMemo(() => {
    const baseList = blogViewRecycle ? recycleBinBlogs : blogs;
    const query = (globalSearch || blogSearch).toLowerCase().trim();

    return baseList.filter((item) => {
      const matchSearch =
        query === "" ||
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.excerpt?.toLowerCase().includes(query) ||
        item.author?.name?.toLowerCase().includes(query);

      const matchCategory =
        blogCategoryFilter === "All" ||
        item.category?.toLowerCase() === blogCategoryFilter.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [blogs, recycleBinBlogs, blogViewRecycle, globalSearch, blogSearch, blogCategoryFilter]);

  // Paginated Blogs
  const paginatedBlogs = useMemo(() => {
    const start = (blogPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, blogPage]);

  const totalBlogPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;

  // Stats calculation
  const stats = useMemo(() => {
    const totalProd = products.length;
    const totalRev = products.reduce((sum, p) => sum + (p.price || 0) * 15, 45200);
    return {
      totalProducts: totalProd || 125,
      totalOrders: 320,
      totalCustomers: 256,
      totalRevenue: totalRev,
    };
  }, [products]);

  // Restore Product Handler
  const handleRestoreProduct = async (product) => {
    const itemId = product.id || product._id;
    try {
      setActionLoadingId(`restore-prod-${itemId}`);
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${itemId}/restore`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to restore product");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Product "${product.title}" restored to active catalog! ✨`,
          },
        })
      );
      reloadAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restore Blog Handler
  const handleRestoreBlog = async (blog) => {
    const itemId = blog.id || blog._id || blog.slug;
    try {
      setActionLoadingId(`restore-blog-${itemId}`);
      const res = await fetch(`${API_ENDPOINTS.BLOGS}/${itemId}/restore`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to restore blog story");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Story "${blog.title}" restored to active stories! ✨`,
          },
        })
      );
      reloadAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Action Executor (Soft Delete, Permanent Delete, or Empty Bin)
  const handleExecuteDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);

    try {
      // 1. Empty Recycle Bin Handler
      if (deletingItem.type === "empty_bin") {
        if (deletingItem.target === "products" || deletingItem.target === "all") {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/recycle-bin/empty`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to empty product recycle bin");
          }
        }
        if (deletingItem.target === "blogs" || deletingItem.target === "all") {
          const res = await fetch(`${API_ENDPOINTS.BLOGS}/recycle-bin/empty`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to empty blog recycle bin");
          }
        }

        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: `Recycle Bin emptied successfully. 🗑️`,
            },
          })
        );
        setDeletingItem(null);
        reloadAll();
        return;
      }

      // 2. Individual Item Delete Handler (Soft or Permanent)
      const isBlog = deletingItem.type === "blog";
      const isPermanent = deletingItem.isPermanent;
      const itemId = deletingItem.item.id || deletingItem.item._id || (isBlog ? deletingItem.item.slug : null);

      const endpoint = isBlog
        ? isPermanent
          ? `${API_ENDPOINTS.BLOGS}/${itemId}/permanent`
          : `${API_ENDPOINTS.BLOGS}/${itemId}`
        : isPermanent
        ? `${API_ENDPOINTS.PRODUCTS}/${itemId}/permanent`
        : `${API_ENDPOINTS.PRODUCTS}/${itemId}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: isPermanent
              ? `Permanently deleted "${deletingItem.item.title}".`
              : `Moved "${deletingItem.item.title}" to Recycle Bin.`,
          },
        })
      );

      setDeletingItem(null);
      reloadAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add Category handler
  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Category "${newCategoryName.trim()}" registered! 🧶` },
      })
    );
    setNewCategoryName("");
    setIsAddCategoryOpen(false);
  };

  const totalBinCount = recycleBinProducts.length + recycleBinBlogs.length;

  // Checking Authentication Screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-sm font-bold text-[#111827]">Loading Admin Studio...</h3>
          <p className="text-xs text-[#6B7280] mt-1">Synchronizing cloud database</p>
        </div>
      </div>
    );
  }

  // Access Denied Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-[#E5E7EB] shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center text-3xl mx-auto mb-4 border border-[#FEE2E2]">
            <BsShieldLock />
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Administrator Access Required</h2>
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
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
              className="px-6 py-2.5 bg-[#F3F4F6] text-[#374151] text-xs font-bold rounded-xl"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* ========================================================================= */}
      {/* ======================= 1. LEFT SIDEBAR ================================= */}
      {/* ========================================================================= */}

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="text-2xl font-extrabold text-[#111827] tracking-tight font-serif flex items-center gap-1.5">
                <span>CozyLoops</span>
                <span className="w-6 h-6 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center text-xs shadow-2xs">
                  <GiYarn />
                </span>
              </span>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
            >
              <LuX className="text-xl" />
            </button>
          </div>

          {/* MAIN MENU */}
          <div className="space-y-1 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] px-3 mb-2">
              Main Menu
            </p>

            {[
              { label: "Dashboard", icon: <LuLayoutDashboard /> },
              { label: "Products", icon: <LuBoxes />, count: products.length },
              { label: "Categories", icon: <LuLayers /> },
              { label: "Orders", icon: <LuShoppingBag /> },
              { label: "Customers", icon: <LuUsers /> },
              { label: "Blogs", icon: <LuBookOpen />, count: blogs.length },
              {
                label: "Recycle Bin",
                icon: <BsRecycle />,
                count: totalBinCount,
                isWarning: totalBinCount > 0,
              },
              { label: "Media", icon: <LuImage /> },
              { label: "Settings", icon: <LuSettings /> },
            ].map((menu) => {
              const isActive = activeMenu === menu.label;
              return (
                <button
                  key={menu.label}
                  type="button"
                  onClick={() => handleMenuClick(menu.label)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-white text-[#2563EB] border border-[#111827] shadow-xs font-bold"
                      : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-base ${isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"}`}>
                      {menu.icon}
                    </span>
                    <span>{menu.label}</span>
                  </div>

                  {menu.count !== undefined && menu.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        menu.isWarning
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {menu.count}
                    </span>
                  )}
                </button>
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] transition-colors shadow-2xs"
            >
              <LuPlus className="text-sm text-[#2563EB]" />
              <span>Add Product</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] transition-colors shadow-2xs text-left cursor-pointer"
            >
              <LuTag className="text-sm text-[#2563EB]" />
              <span>Add Category</span>
            </button>

            <Link
              to="/admin/add-blog"
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] transition-colors shadow-2xs"
            >
              <LuFileText className="text-sm text-[#2563EB]" />
              <span>Add Blog</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Bottom Logout */}
        <div className="p-6 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#4B5563] hover:text-[#EF4444] transition-colors cursor-pointer"
          >
            <LuLogOut className="text-base text-[#9CA3AF]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* ==================== 2. MAIN CONTENT AREA =============================== */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* ================= TOP NAVBAR ================= */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <LuMenu className="text-xl" />
            </button>

            {/* Global Search Box */}
            <div className="relative w-full">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search products, blogs, categories..."
                className="w-full pl-4 pr-10 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs"
              />
              <BsSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm pointer-events-none" />
            </div>
          </div>

          {/* Right Action Icons & Profile Menu */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quick Recycle Bin Indicator Bell / Button */}
            {totalBinCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Recycle Bin");
                  setActiveMenu("Recycle Bin");
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={`${totalBinCount} deleted items in Recycle Bin`}
              >
                <BsRecycle className="text-sm" />
                <span className="hidden sm:inline">Recycle Bin</span>
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-extrabold">
                  {totalBinCount}
                </span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl relative transition-colors"
            >
              <LuBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>

            {/* Mail Icon */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LuMail className="text-lg" />
            </button>

            {/* Profile Menu Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#C7D2FE]">
                  RS
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#111827] leading-tight">
                    {currentUser?.name || "Rohan Shinde"}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">Admin</p>
                </div>
                <BsChevronDown className="text-xs text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-800">{currentUser?.name || "Rohan Shinde"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  <Link
                    to="/shop"
                    target="_blank"
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    View Storefront
                  </Link>
                  <Link
                    to="/blog"
                    target="_blank"
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    View Public Blog
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= DASHBOARD MAIN BODY ================= */}
        <main ref={dashboardTopRef} className="p-4 sm:p-8 space-y-6 flex-1">
          {/* Header Row: Dashboard Title & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
                Welcome back, {currentUser?.name || "Rohan Shinde"}
              </p>
            </div>

            {/* Date Range Picker Dropdown */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] shadow-2xs">
              <span>📅 May 20 - May 26, 2026</span>
              <BsChevronDown className="text-xs text-gray-400" />
            </div>
          </div>

          {/* ================= 4 KPI SUMMARY CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Total Products */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-lg mb-4">
                <LuPackage />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Total Active Products</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-1 font-['Outfit',sans-serif]">
                  {stats.totalProducts}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#10B981] mt-3 flex items-center gap-1">
                <span>↑ 12%</span> <span className="text-[#6B7280] font-normal">from last week</span>
              </p>
            </div>

            {/* 2. Total Orders */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-lg mb-4">
                <LuShoppingCart />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Total Orders</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-1 font-['Outfit',sans-serif]">
                  {stats.totalOrders}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#10B981] mt-3 flex items-center gap-1">
                <span>↑ 18%</span> <span className="text-[#6B7280] font-normal">from last week</span>
              </p>
            </div>

            {/* 3. Total Customers */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-lg mb-4">
                <LuUsers />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Total Customers</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-1 font-['Outfit',sans-serif]">
                  {stats.totalCustomers}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#10B981] mt-3 flex items-center gap-1">
                <span>↑ 8%</span> <span className="text-[#6B7280] font-normal">from last week</span>
              </p>
            </div>

            {/* 4. Total Revenue */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-lg mb-4">
                <BsCurrencyRupee />
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Total Revenue</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-1 font-['Outfit',sans-serif]">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#10B981] mt-3 flex items-center gap-1">
                <span>↑ 15%</span> <span className="text-[#6B7280] font-normal">from last week</span>
              </p>
            </div>
          </div>

          {/* ================= QUICK ACTIONS (Target of smooth scroll) ================= */}
          <div ref={quickActionsRef} className="scroll-mt-20">
            <h2 className="text-base font-bold text-[#111827] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add Product Card */}
              <Link
                to="/admin/add-product"
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs hover:border-[#2563EB]/40 hover:shadow-xs transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  <LuPlus />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Add Product</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Add a new handmade item</p>
                </div>
              </Link>

              {/* Add Category Card */}
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs hover:border-[#2563EB]/40 hover:shadow-xs transition-all flex items-center gap-4 text-left cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  <LuTag />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Add Category</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Create new product category</p>
                </div>
              </button>

              {/* Add Blog Card */}
              <Link
                to="/admin/add-blog"
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs hover:border-[#2563EB]/40 hover:shadow-xs transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  <LuFileText />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#111827]">Add Story</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Publish a crochet guide</p>
                </div>
              </Link>
            </div>
          </div>

          {/* ================= TABS & MAIN DATA TABLE CONTAINER ================= */}
          <div ref={tableSectionRef} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden scroll-mt-20">
            {/* Tab Navigation Row */}
            <div className="px-6 pt-5 border-b border-[#E5E7EB] flex items-center gap-8 overflow-x-auto scrollbar-none">
              {["Products", "Categories", "Blogs", "Orders", "Customers", "Recycle Bin"].map((tab) => {
                const isSelected = activeTab === tab;
                const isRecycleTab = tab === "Recycle Bin";

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setActiveMenu(tab);
                    }}
                    className={`pb-4 text-sm font-semibold transition-colors relative cursor-pointer shrink-0 flex items-center gap-2 ${
                      isSelected ? "text-[#2563EB]" : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <span>{tab}</span>

                    {/* Badge for Recycle Bin or Items Count */}
                    {isRecycleTab && totalBinCount > 0 && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                          isSelected
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {totalBinCount}
                      </span>
                    )}

                    {isSelected && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Header under Tab with Title, Sub-toggles, & Action Buttons */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB]">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-[#111827]">
                    {activeTab === "Products"
                      ? productViewRecycle
                        ? "Products Recycle Bin"
                        : "All Products"
                      : activeTab === "Categories"
                      ? "Product Categories"
                      : activeTab === "Blogs"
                      ? blogViewRecycle
                        ? "Stories Recycle Bin"
                        : "All Blog Stories"
                      : activeTab === "Orders"
                      ? "Recent Store Orders"
                      : activeTab === "Customers"
                      ? "Registered Customers"
                      : "Admin Recycle Bin"}
                  </h3>

                  {/* Quick toggle pill in Products tab */}
                  {activeTab === "Products" && (
                    <div className="inline-flex bg-[#F3F4F6] p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setProductViewRecycle(false);
                          setProductPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          !productViewRecycle
                            ? "bg-white text-[#111827] shadow-2xs font-bold"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        Active ({products.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProductViewRecycle(true);
                          setProductPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                          productViewRecycle
                            ? "bg-white text-red-600 shadow-2xs font-bold"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        <BsRecycle className="text-xs" />
                        <span>Bin ({recycleBinProducts.length})</span>
                      </button>
                    </div>
                  )}

                  {/* Quick toggle pill in Blogs tab */}
                  {activeTab === "Blogs" && (
                    <div className="inline-flex bg-[#F3F4F6] p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setBlogViewRecycle(false);
                          setBlogPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          !blogViewRecycle
                            ? "bg-white text-[#111827] shadow-2xs font-bold"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        Active ({blogs.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBlogViewRecycle(true);
                          setBlogPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                          blogViewRecycle
                            ? "bg-white text-red-600 shadow-2xs font-bold"
                            : "text-[#6B7280] hover:text-[#111827]"
                        }`}
                      >
                        <BsRecycle className="text-xs" />
                        <span>Bin ({recycleBinBlogs.length})</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#6B7280] mt-1">
                  {activeTab === "Products"
                    ? productViewRecycle
                      ? "Items here are hidden from the live storefront. Restore them anytime or delete permanently."
                      : "Manage and update your full handcrafted catalog"
                    : activeTab === "Categories"
                    ? "Browse and organize store product categories"
                    : activeTab === "Blogs"
                    ? blogViewRecycle
                      ? "Unpublished stories currently in the trash. Restore to publish live or delete permanently."
                      : "Manage, publish, and edit stories and guides"
                    : activeTab === "Orders"
                    ? "Track and manage customer orders and shipments"
                    : activeTab === "Customers"
                    ? "Customer directory and purchase histories"
                    : "Restore soft-deleted products and articles or permanently purge them."}
                </p>
              </div>

              {/* Action buttons on the right */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Product Category Filter */}
                {activeTab === "Products" && (
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {/* Blog Category Filter */}
                {activeTab === "Blogs" && (
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => {
                      setBlogCategoryFilter(e.target.value);
                      setBlogPage(1);
                    }}
                    className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {/* Products Recycle Bin: Empty Bin Button */}
                {activeTab === "Products" && productViewRecycle && recycleBinProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDeletingItem({
                        type: "empty_bin",
                        target: "products",
                        count: recycleBinProducts.length,
                      })
                    }
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LuTrash2 className="text-sm" />
                    <span>Empty Product Bin</span>
                  </button>
                )}

                {/* Blogs Recycle Bin: Empty Bin Button */}
                {activeTab === "Blogs" && blogViewRecycle && recycleBinBlogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDeletingItem({
                        type: "empty_bin",
                        target: "blogs",
                        count: recycleBinBlogs.length,
                      })
                    }
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LuTrash2 className="text-sm" />
                    <span>Empty Story Bin</span>
                  </button>
                )}

                {/* Export Button (for active tables) */}
                {activeTab !== "Recycle Bin" && !productViewRecycle && !blogViewRecycle && (
                  <button
                    type="button"
                    onClick={() => {
                      const csvContent =
                        activeTab === "Products"
                          ? "ID,Title,Category,Price,InStock\n" +
                            products.map((p) => `${p.id},"${p.title}","${p.category}",${p.price},${p.inStock}`).join("\n")
                          : "ID,Title,Category,Author\n" +
                            blogs.map((b) => `${b.id},"${b.title}","${b.category}","${b.author?.name}"`).join("\n");
                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${activeTab.toLowerCase()}_export.csv`;
                      a.click();
                    }}
                    className="px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#374151] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LuDownload className="text-sm" />
                    <span>Export</span>
                  </button>
                )}

                {/* Primary Add Buttons */}
                {activeTab === "Products" && !productViewRecycle && (
                  <Link
                    to="/admin/add-product"
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <LuPlus className="text-sm" />
                    <span>Add Product</span>
                  </Link>
                )}

                {activeTab === "Categories" && (
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <LuPlus className="text-sm" />
                    <span>Add Category</span>
                  </button>
                )}

                {activeTab === "Blogs" && !blogViewRecycle && (
                  <Link
                    to="/admin/add-blog"
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <LuPlus className="text-sm" />
                    <span>Add Blog</span>
                  </Link>
                )}
              </div>
            </div>

            {/* ================= TAB 1: PRODUCTS TABLE (ACTIVE & RECYCLE BIN) ================= */}
            {activeTab === "Products" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">
                        {productViewRecycle ? "Deleted On" : "Stock"}
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {productsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="font-medium">Loading products...</p>
                        </td>
                      </tr>
                    ) : paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          {productViewRecycle ? (
                            <div className="space-y-1.5">
                              <BsRecycle className="text-3xl text-emerald-500 mx-auto mb-1" />
                              <p className="font-bold text-sm text-gray-700">Product Recycle Bin is Empty</p>
                              <p className="text-xs text-gray-400">No deleted products found in the recycle bin.</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <LuBoxes className="text-3xl text-gray-300 mx-auto mb-1" />
                              <p className="font-bold text-sm text-gray-700">No products found</p>
                              <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product) => {
                        const inStock = product.inStock !== false;
                        const sku = `CLP${String(product.id || 1).padStart(3, "0")}`;
                        const stockCount = inStock ? (product.price % 30) + 8 : 0;
                        const isLowStock = inStock && stockCount <= 10;
                        const isActionLoading = actionLoadingId === `restore-prod-${product.id || product._id}`;

                        return (
                          <tr key={product.id || product._id} className="hover:bg-gray-50/70 transition-colors">
                            {/* PRODUCT */}
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                  <img
                                    src={product.img}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "/uploads/products/decor/sunflower.png";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                                    {product.title}
                                  </h5>
                                  <p className="text-[11px] text-[#9CA3AF]">SKU: {sku}</p>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 bg-[#F3F4F6] text-[#374151] rounded-md text-[11px] font-semibold">
                                {product.category}
                              </span>
                            </td>

                            {/* PRICE */}
                            <td className="py-3 px-4 font-bold text-xs sm:text-sm text-[#111827]">
                              ₹{(product.price || 0).toLocaleString("en-IN")}
                            </td>

                            {/* STOCK or DELETED DATE */}
                            <td className="py-3 px-4 text-xs font-semibold text-[#374151]">
                              {productViewRecycle ? (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {formatDeletionDate(product.deletedAt)}
                                </span>
                              ) : (
                                stockCount
                              )}
                            </td>

                            {/* STATUS */}
                            <td className="py-3 px-4">
                              {productViewRecycle ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <BsRecycle className="text-xs" /> In Bin
                                </span>
                              ) : inStock ? (
                                isLowStock ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                                    In Stock
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
                                  Out of Stock
                                </span>
                              )}
                            </td>

                            {/* ACTIONS */}
                            <td className="py-3 px-6 text-right">
                              {productViewRecycle ? (
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Restore Button */}
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleRestoreProduct(product)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                    title="Restore Product to Live Catalog"
                                  >
                                    <BsArrowCounterclockwise className={`text-base ${isActionLoading ? "animate-spin" : ""}`} />
                                  </button>

                                  {/* Permanent Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingItem({
                                        type: "product",
                                        item: product,
                                        isPermanent: true,
                                      })
                                    }
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Permanently Delete Product"
                                  >
                                    <LuTrash2 className="text-base" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    to={`/admin/edit-product/${product.id}`}
                                    className="p-1.5 text-gray-500 hover:text-[#2563EB] hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Product"
                                  >
                                    <BsPencil />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingItem({
                                        type: "product",
                                        item: product,
                                        isPermanent: false,
                                      })
                                    }
                                    className="p-1.5 text-gray-500 hover:text-[#EF4444] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Move Product to Recycle Bin"
                                  >
                                    <BsTrash3 />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= TAB 2: CATEGORIES VIEW ================= */}
            {activeTab === "Categories" && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {CATEGORIES.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <div
                        key={cat}
                        className="bg-[#F9FAFB] rounded-2xl p-5 border border-[#E5E7EB] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{CATEGORY_ICONS[cat] || "🧶"}</span>
                          <div>
                            <h4 className="font-bold text-sm text-[#111827]">{cat}</h4>
                            <p className="text-xs text-[#6B7280]">{count} Active Products</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductCategoryFilter(cat);
                            setProductViewRecycle(false);
                            setActiveTab("Products");
                          }}
                          className="px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-xl text-xs font-bold text-[#2563EB] cursor-pointer"
                        >
                          View Items
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 3: BLOGS TABLE (ACTIVE & RECYCLE BIN) ================= */}
            {activeTab === "Blogs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Story</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Author</th>
                      <th className="py-3.5 px-4">
                        {blogViewRecycle ? "Deleted On" : "Read Time"}
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {blogsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="font-medium">Loading stories...</p>
                        </td>
                      </tr>
                    ) : paginatedBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          {blogViewRecycle ? (
                            <div className="space-y-1.5">
                              <BsRecycle className="text-3xl text-emerald-500 mx-auto mb-1" />
                              <p className="font-bold text-sm text-gray-700">Blog Recycle Bin is Empty</p>
                              <p className="text-xs text-gray-400">No deleted blog stories in the recycle bin.</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <LuBookOpen className="text-3xl text-gray-300 mx-auto mb-1" />
                              <p className="font-bold text-sm text-gray-700">No blog stories found</p>
                              <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((blog) => {
                        const isActionLoading = actionLoadingId === `restore-blog-${blog.id || blog._id || blog.slug}`;

                        return (
                          <tr key={blog.id || blog._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                  <img
                                    src={blog.img}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "/uploads/blogs/blog_yarn_selection_1787376883256.jpg";
                                    }}
                                  />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <h5 className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                                    {blog.title}
                                  </h5>
                                  <p className="text-[11px] text-[#9CA3AF] truncate">{blog.slug}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 bg-[#F3F4F6] text-[#374151] rounded-md text-[11px] font-semibold">
                                {blog.category}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-xs font-semibold text-[#374151]">
                              {blog.author?.name || "Rohan Shinde"}
                            </td>

                            <td className="py-3 px-4 text-xs text-[#6B7280]">
                              {blogViewRecycle ? (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  {formatDeletionDate(blog.deletedAt)}
                                </span>
                              ) : (
                                blog.readTime || `${blog.readMinutes || 5} min`
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {blogViewRecycle ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <BsRecycle className="text-xs" /> In Bin
                                </span>
                              ) : blog.featured ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                  <LuStar /> Featured
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                  Standard
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-6 text-right">
                              {blogViewRecycle ? (
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Restore Button */}
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleRestoreBlog(blog)}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                    title="Restore Story to Active Blog"
                                  >
                                    <BsArrowCounterclockwise className={`text-base ${isActionLoading ? "animate-spin" : ""}`} />
                                  </button>

                                  {/* Permanent Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingItem({
                                        type: "blog",
                                        item: blog,
                                        isPermanent: true,
                                      })
                                    }
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Permanently Delete Story"
                                  >
                                    <LuTrash2 className="text-base" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    to={`/blog/${blog.slug || blog.id}`}
                                    target="_blank"
                                    className="p-1.5 text-gray-500 hover:text-[#2563EB] hover:bg-gray-100 rounded-lg transition-colors"
                                    title="View Article"
                                  >
                                    <BsEye />
                                  </Link>
                                  <Link
                                    to={`/admin/edit-blog/${blog.id || blog._id}`}
                                    className="p-1.5 text-gray-500 hover:text-[#2563EB] hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit Blog"
                                  >
                                    <BsPencil />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingItem({
                                        type: "blog",
                                        item: blog,
                                        isPermanent: false,
                                      })
                                    }
                                    className="p-1.5 text-gray-500 hover:text-[#EF4444] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Move Story to Recycle Bin"
                                  >
                                    <BsTrash3 />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= TAB 4: ORDERS VIEW ================= */}
            {activeTab === "Orders" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Order ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Items</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {SAMPLE_ORDERS.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-[#2563EB]">{order.id}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#111827]">{order.customer}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{order.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#374151]">{order.items} items</td>
                        <td className="py-3.5 px-4 font-bold text-[#111827]">₹{order.total.toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              order.status === "Delivered"
                                ? "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]"
                                : order.status === "Processing"
                                ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                                : order.status === "Shipped"
                                ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= TAB 5: CUSTOMERS VIEW ================= */}
            {activeTab === "Customers" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Customer</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Total Orders</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-6 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {SAMPLE_CUSTOMERS.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#BFDBFE]">
                              {cust.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="font-bold text-[#111827]">{cust.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">{cust.email}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#374151]">{cust.orders} orders</td>
                        <td className="py-3.5 px-4 font-bold text-[#111827]">₹{cust.spent.toLocaleString("en-IN")}</td>
                        <td className="py-3.5 px-6 text-right text-gray-500">{cust.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= TAB 6: DEDICATED RECYCLE BIN TAB ================= */}
            {activeTab === "Recycle Bin" && (
              <div>
                {/* Recycle Bin Sub-Header & Controls */}
                <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="inline-flex bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setRecycleSubTab("products")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        recycleSubTab === "products"
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <LuBoxes className="text-sm" />
                      <span>Deleted Products ({recycleBinProducts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecycleSubTab("blogs")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        recycleSubTab === "blogs"
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <LuBookOpen className="text-sm" />
                      <span>Deleted Blog Stories ({recycleBinBlogs.length})</span>
                    </button>
                  </div>

                  {/* Empty Selected Bin Button */}
                  {((recycleSubTab === "products" && recycleBinProducts.length > 0) ||
                    (recycleSubTab === "blogs" && recycleBinBlogs.length > 0)) && (
                    <button
                      type="button"
                      onClick={() =>
                        setDeletingItem({
                          type: "empty_bin",
                          target: recycleSubTab,
                          count:
                            recycleSubTab === "products"
                              ? recycleBinProducts.length
                              : recycleBinBlogs.length,
                        })
                      }
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <LuTrash2 className="text-sm" />
                      <span>
                        Empty {recycleSubTab === "products" ? "Product" : "Blog"} Bin
                      </span>
                    </button>
                  )}
                </div>

                {/* Sub-view: Deleted Products */}
                {recycleSubTab === "products" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                          <th className="py-3.5 px-6">Product</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Price</th>
                          <th className="py-3.5 px-4">Deleted At</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6] text-xs">
                        {recycleBinProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-gray-500">
                              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-100 shadow-2xs">
                                <BsRecycle />
                              </div>
                              <h4 className="font-bold text-sm text-[#111827]">Product Recycle Bin is Clean</h4>
                              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                There are no soft-deleted products. When you delete a product, it will safely appear here for 1-click restoration.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          recycleBinProducts.map((prod) => {
                            const isActionLoading = actionLoadingId === `restore-prod-${prod.id || prod._id}`;

                            return (
                              <tr key={prod.id || prod._id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                      <img
                                        src={prod.img}
                                        alt={prod.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = "/uploads/products/decor/sunflower.png";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                                        {prod.title}
                                      </h5>
                                      <p className="text-[11px] text-[#9CA3AF]">
                                        SKU: CLP{String(prod.id || 1).padStart(3, "0")}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-block px-2.5 py-1 bg-[#F3F4F6] text-[#374151] rounded-md text-[11px] font-semibold">
                                    {prod.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-xs text-[#111827]">
                                  ₹{(prod.price || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                                  {formatDeletionDate(prod.deletedAt)}
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isActionLoading}
                                      onClick={() => handleRestoreProduct(prod)}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                      title="Restore Product"
                                    >
                                      <BsArrowCounterclockwise className={`text-sm ${isActionLoading ? "animate-spin" : ""}`} />
                                      <span>Restore</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeletingItem({
                                          type: "product",
                                          item: prod,
                                          isPermanent: true,
                                        })
                                      }
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Permanently"
                                    >
                                      <LuTrash2 className="text-base" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-view: Deleted Blogs */}
                {recycleSubTab === "blogs" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                          <th className="py-3.5 px-6">Story</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Author</th>
                          <th className="py-3.5 px-4">Deleted At</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6] text-xs">
                        {recycleBinBlogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-gray-500">
                              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-100 shadow-2xs">
                                <BsRecycle />
                              </div>
                              <h4 className="font-bold text-sm text-[#111827]">Blog Recycle Bin is Clean</h4>
                              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                There are no soft-deleted blog stories. When you delete a blog article, you can restore it from here anytime.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          recycleBinBlogs.map((blog) => {
                            const isActionLoading = actionLoadingId === `restore-blog-${blog.id || blog._id || blog.slug}`;

                            return (
                              <tr key={blog.id || blog._id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                      <img
                                        src={blog.img}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = "/uploads/blogs/blog_yarn_selection_1787376883256.jpg";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 max-w-xs">
                                      <h5 className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                                        {blog.title}
                                      </h5>
                                      <p className="text-[11px] text-[#9CA3AF] truncate">{blog.slug}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-block px-2.5 py-1 bg-[#F3F4F6] text-[#374151] rounded-md text-[11px] font-semibold">
                                    {blog.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-xs font-semibold text-[#374151]">
                                  {blog.author?.name || "Rohan Shinde"}
                                </td>
                                <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                                  {formatDeletionDate(blog.deletedAt)}
                                </td>
                                <td className="py-3.5 px-6 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={isActionLoading}
                                      onClick={() => handleRestoreBlog(blog)}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                      title="Restore Story"
                                    >
                                      <BsArrowCounterclockwise className={`text-sm ${isActionLoading ? "animate-spin" : ""}`} />
                                      <span>Restore</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeletingItem({
                                          type: "blog",
                                          item: blog,
                                          isPermanent: true,
                                        })
                                      }
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Permanently"
                                    >
                                      <LuTrash2 className="text-base" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ================= TABLE FOOTER & PAGINATION ================= */}
            {activeTab === "Products" && (
              <div className="p-4 sm:p-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
                <p>
                  Showing{" "}
                  <strong>
                    {filteredProducts.length > 0 ? (productPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {Math.min(productPage * ITEMS_PER_PAGE, filteredProducts.length)}
                  </strong>{" "}
                  of <strong>{filteredProducts.length}</strong> products
                </p>

                {/* Numbered Pagination Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={productPage === 1}
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  >
                    &lt; Prev
                  </button>

                  {Array.from({ length: totalProductPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((num) => {
                      const isCurrent = productPage === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setProductPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            isCurrent
                              ? "bg-[#2563EB] text-white shadow-2xs"
                              : "border border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                  <button
                    type="button"
                    disabled={productPage === totalProductPages}
                    onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            )}

            {activeTab === "Blogs" && (
              <div className="p-4 sm:p-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
                <p>
                  Showing{" "}
                  <strong>
                    {filteredBlogs.length > 0 ? (blogPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {Math.min(blogPage * ITEMS_PER_PAGE, filteredBlogs.length)}
                  </strong>{" "}
                  of <strong>{filteredBlogs.length}</strong> stories
                </p>

                {/* Numbered Pagination Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={blogPage === 1}
                    onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  >
                    &lt; Prev
                  </button>

                  {Array.from({ length: totalBlogPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((num) => {
                      const isCurrent = blogPage === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBlogPage(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            isCurrent
                              ? "bg-[#2563EB] text-white shadow-2xs"
                              : "border border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                  <button
                    type="button"
                    disabled={blogPage === totalBlogPages}
                    onClick={() => setBlogPage((p) => Math.min(totalBlogPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9CA3AF]">
            <p>© 2026 CozyLoops. All rights reserved.</p>
            <p>Made with ❤️ by CozyLoops</p>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ======================= ADD CATEGORY MODAL ============================== */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E5E7EB] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#111827]">Create New Category</h3>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                >
                  <LuX />
                </button>
              </div>
              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Seasonal Holiday"
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="px-4 py-2 border border-[#E5E7EB] text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ======================= CONFIRMATION / DELETE MODAL ===================== */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl text-center"
            >
              {deletingItem.type === "empty_bin" ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-100">
                    <BsExclamationTriangle />
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Empty {deletingItem.target === "products" ? "Product" : deletingItem.target === "blogs" ? "Blog" : "All"} Recycle Bin?
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    CAUTION: All <strong className="text-red-600">{deletingItem.count} items</strong> in the recycle bin will be permanently erased from the database. This action cannot be reversed.
                  </p>
                </>
              ) : deletingItem.isPermanent ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl mx-auto mb-4 border border-red-100">
                    <LuTrash2 />
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Permanently delete "{deletingItem.item.title}"?
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    CAUTION: This item will be permanently removed from the cloud database and cannot be restored.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mx-auto mb-4 border border-amber-100">
                    <BsTrash3 />
                  </div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Move "{deletingItem.item.title}" to Recycle Bin?
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    This item will be unlisted from the live storefront. You can restore it anytime from the Recycle Bin!
                  </p>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={deleteLoading}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer ${
                    deletingItem.isPermanent || deletingItem.type === "empty_bin"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#EF4444] hover:bg-[#DC2626]"
                  }`}
                >
                  {deleteLoading
                    ? "Processing..."
                    : deletingItem.type === "empty_bin"
                    ? "Empty Bin"
                    : deletingItem.isPermanent
                    ? "Delete Permanently"
                    : "Move to Bin"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
