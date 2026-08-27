import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsHandbag, BsHeart, BsHeartFill, BsListUl, BsSearch, BsX, BsStarFill, BsStarHalf, 
  BsStar, BsChevronLeft, BsChevronRight, BsGrid3X3Gap, BsEye, BsCheck2 } from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuRotateCcw } from "react-icons/lu";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import { API_ENDPOINTS } from "../config/api";

const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  "All Creations",
  "Decor & Gifts",
  "Pet & Animal",
  "Home & Living",
  "Kids & Baby",
  "Personalized"
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹300", min: 0, max: 300 },
  { label: "₹300 - ₹600", min: 300, max: 600 },
  { label: "₹600 - ₹1000", min: 600, max: 1000 },
  { label: "Over ₹1000", min: 1000, max: Infinity }
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating-desc" },
  { label: "Name: A to Z", value: "name-asc" }
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const resolveCategory = (param) => {
    if (!param) return "All Creations";
    const found = CATEGORIES.find(
      (c) =>
        c.toLowerCase() === param.toLowerCase() ||
        (c === "Personalized" && param.toLowerCase().includes("personalized"))
    );
    return found || "All Creations";
  };

  const [selectedCategory, setSelectedCategory] = useState(() =>
    resolveCategory(searchParams.get("category"))
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // Index in PRICE_RANGES
  const [sortBy, setSortBy] = useState("featured");
  const [layoutMode, setLayoutMode] = useState("grid4"); // "grid4", "grid3", "list"
  const [currentPage, setCurrentPage] = useState(1);

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Sync with localStorage on mount & events
  useEffect(() => {
    const loadState = () => {
      setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
      setWishlistItems(JSON.parse(localStorage.getItem("wishlist")) || []);
    };
    loadState();

    window.addEventListener("cartUpdated", loadState);
    window.addEventListener("wishlistUpdated", loadState);

    return () => {
      window.removeEventListener("cartUpdated", loadState);
      window.removeEventListener("wishlistUpdated", loadState);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(API_ENDPOINTS.PRODUCTS)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, []);

  // Update category and search query when URL search params change
  useEffect(() => {
    const paramCategory = searchParams.get("category");
    const paramSearch = searchParams.get("search");

    if (paramCategory) {
      const resolved = resolveCategory(paramCategory);
      setSelectedCategory(resolved);
    } else if (!paramSearch) {
      setSelectedCategory("All Creations");
    }

    if (paramSearch !== null) {
      setSearchQuery(paramSearch);
    }

    if (paramCategory || paramSearch) {
      setTimeout(() => {
        const el = document.getElementById("shop-products");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [searchParams]);

  // Reset pagination to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedPriceRange, sortBy]);

  // Handle Category Select
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === "All Creations") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  // Helper Checkers
  const isProductInCart = (id) => cartItems.some((item) => item.id === id);
  const isProductInWishlist = (id) => wishlistItems.some((item) => item.id === id);
  const getCartQuantity = (id) => {
    const found = cartItems.find((item) => item.id === id);
    return found ? found.quantity || 1 : 0;
  };

  // Cart Actions
  const toggleCart = (product, quantity = 1) => {
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Please sign in to add items to your cart! 🧶" }
        })
      );
      navigate("/signin");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      // Remove from cart
      updatedCart = cart.filter((item) => item.id !== product.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${product.title}" from cart.` }
        })
      );
    } else {
      // Add to cart with metadata
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img,
        quantity: quantity
      };
      updatedCart = [...cart, newItem];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Added "${product.title}" to cart! 🧶` }
        })
      );
    }

    saveCart(updatedCart);
    setCartItems(updatedCart);
  };

  // Wishlist Actions
  const toggleWishlist = (product) => {
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Please sign in to save items to your wishlist! ♥" }
        })
      );
      navigate("/signin");
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const existingIndex = wishlist.findIndex((item) => item.id === product.id);

    let updatedWishlist;
    if (existingIndex > -1) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${product.title}" from wishlist.` }
        })
      );
    } else {
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img
      };
      updatedWishlist = [...wishlist, newItem];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Added "${product.title}" to wishlist! ♥` }
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== "All Creations") {
      result = result.filter(
        (item) => item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Price Range Filter
    const activeRange = PRICE_RANGES[selectedPriceRange];
    if (activeRange) {
      result = result.filter(
        (item) => item.price >= activeRange.min && item.price <= activeRange.max
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [products, selectedCategory, searchQuery, selectedPriceRange, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setTimeout(() => {
      const el = document.getElementById("shop-products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = { "All Creations": products.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "All Creations") {
        counts[cat] = products.filter(
          (p) => p.category && p.category.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [products]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory("All Creations");
    setSearchQuery("");
    setSelectedPriceRange(0);
    setSortBy("featured");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const hasActiveFilters =
    selectedCategory !== "All Creations" ||
    searchQuery.trim() !== "" ||
    selectedPriceRange !== 0 ||
    sortBy !== "featured";

  // Helper for star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<BsStarFill key={i} className="text-[#f59e0b] text-xs" />);
      } else if (rating >= i - 0.5) {
        stars.push(<BsStarHalf key={i} className="text-[#f59e0b] text-xs" />);
      } else {
        stars.push(<BsStar key={i} className="text-gray-300 text-xs" />);
      }
    }
    return stars;
  };

  // Open Quick View Modal
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setModalQuantity(1);
  };

  // Hero Animation variants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section Start Here */}
      <div className="relative h-50 overflow-hidden bg-[#FAF3EB] flex items-center">
        {/* Background Image with Framer Motion Animation */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center w-full h-full bg-[url('/uploads/hero/shop-hero.jpg')]"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-transparent sm:w-3/4 md:w-2/3" />

        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
          className="container relative z-10 px-5 sm:px-8 md:px-12 lg:px-20 max-w-xl"
        >
          <motion.h5
            variants={itemVariants}
            className="text-xs sm:text-sm font-semibold uppercase tracking-[2px] text-[#6C2C12] mb-1"
          >
            - Our Shop -
          </motion.h5>
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#6C2C12] mb-2"
          >
            Made By Hand, <br /><span className="text-[#F88897]">Crafted For You</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-md"
          >
            Discover beautifully handcrafted crochet creations for every moment, home, and heartwarming gift.
          </motion.p>
        </motion.div>
      </div>
      {/* Hero Section End Here */}

      {/* Main Shop Content */}
      <div id="shop-products" className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 sm:pt-10 scroll-mt-24">
        {/* Category Pills Bar */}
        <div className="mb-6 pb-2 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
            const count = categoryCounts[category] || 0;
            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[#6C2C12] text-white shadow-md shadow-[#6C2C12]/20 scale-102"
                    : "bg-white text-gray-600 border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FAF3EB] text-[#8C6D62]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter, Search & View Controls Bar */}
        <div className="bg-white rounded-2xl border border-[#EADFD4] p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cozy socks, flowers, plushies..."
                className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded text-sm text-[#6C2C12] placeholder-gray-400 focus:bg-white focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C2C12] cursor-pointer"
                >
                  <BsX className="text-lg" />
                </button>
              )}
            </div>

            {/* Price Filter & Sort & Layout */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Price Range Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Price:</span>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="border border-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm rounded px-3 py-2 focus:outline-hidden focus:border-[#F88897] cursor-pointer font-medium"
                >
                  {PRICE_RANGES.map((range, index) => (
                    <option key={index} value={index}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm rounded px-3 py-2 focus:outline-hidden focus:border-[#F88897] cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center bg-[#FAF6F0] border border-[#EADFD4] rounded p-1 gap-1">
                <button
                  onClick={() => setLayoutMode("grid4")}
                  title="4-Column Grid"
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    layoutMode === "grid4"
                      ? "bg-[#6C2C12] text-white shadow-2xs"
                      : "text-[#8C6D62] hover:text-[#6C2C12]"
                  }`}
                >
                  <BsGrid3X3Gap className="text-sm" />
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  title="List View"
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    layoutMode === "list"
                      ? "bg-[#6C2C12] text-white shadow-2xs"
                      : "text-[#8C6D62] hover:text-[#6C2C12]"
                  }`}
                >
                  <BsListUl className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[#F2ECE4] text-xs">
              <span className="font-semibold text-gray-500">Active Filters:</span>

              {selectedCategory !== "All Creations" && (
                <span className="inline-flex items-center gap-1.5 bg-[#FAF3EB] text-[#6C2C12] px-2.5 py-1 rounded-md border border-[#EADFD4] font-medium">
                  Category: {selectedCategory}
                  <button
                    onClick={() => handleCategorySelect("All Creations")}
                    className="hover:text-[#6C2C12] cursor-pointer"
                  >
                    <BsX className="text-sm" />
                  </button>
                </span>
              )}

              {searchQuery.trim() !== "" && (
                <span className="inline-flex items-center gap-1.5 bg-[#FAF3EB] text-[#6C2C12] px-2.5 py-1 rounded-md border border-[#EADFD4] font-medium">
                  Keyword: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:text-[#6C2C12] cursor-pointer">
                    <BsX className="text-sm" />
                  </button>
                </span>
              )}

              {selectedPriceRange !== 0 && (
                <span className="inline-flex items-center gap-1.5 bg-[#FAF3EB] text-[#6C2C12] px-2.5 py-1 rounded-md border border-[#EADFD4] font-medium">
                  {PRICE_RANGES[selectedPriceRange].label}
                  <button onClick={() => setSelectedPriceRange(0)} className="hover:text-[#6C2C12] cursor-pointer">
                    <BsX className="text-sm" />
                  </button>
                </span>
              )}

              {sortBy !== "featured" && (
                <span className="inline-flex items-center gap-1.5 bg-[#FAF3EB] text-[#6C2C12] px-2.5 py-1 rounded-md border border-[#EADFD4] font-medium">
                  Sort: {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                  <button onClick={() => setSortBy("featured")} className="hover:text-[#6C2C12] cursor-pointer">
                    <BsX className="text-sm" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[#F88897] hover:text-[#6C2C12] font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-6 px-1">
          <span>
            Showing{" "}
            <strong className="text-[#6C2C12]">
              {filteredProducts.length === 0
                ? 0
                : `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredProducts.length
                  )}`}
            </strong>{" "}
            of <strong className="text-[#6C2C12]">{filteredProducts.length}</strong> handcrafted creation
            {filteredProducts.length === 1 ? "" : "s"}
          </span>
          {totalPages > 1 && (
            <span className="text-xs font-semibold text-[#6C2C12]">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* 3. Products Rendering */}
        {loading ? (
          /* Loading State */
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6C2C12] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#6C2C12] font-semibold text-sm">Loading handcrafted creations...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-white rounded-3xl border border-[#EADFD4] max-w-lg mx-auto shadow-xs"
          >
            <div className="w-20 h-20 mx-auto bg-[#FAF3EB] rounded-full flex items-center justify-center text-[#F88897] text-3xl mb-4 shadow-inner">
              <GiYarn className="animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-[#6C2C12] mb-2">No Crochet Creations Found</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We couldn&apos;t find any items matching your current filters. Try changing your search keyword or clearing the filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 bg-[#6C2C12] hover:bg-[#52210d] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              <LuRotateCcw /> Reset All Filters
            </button>
          </motion.div>
        ) : layoutMode === "list" ? (
          /* List View */
          <motion.div
            key={`list-${currentPage}-${filteredProducts.length}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {paginatedProducts.map((product) => {
              const inCart = isProductInCart(product.id);
              const inWishlist = isProductInWishlist(product.id);

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  className="group bg-white rounded-lg border border-[#EADFD4] shadow-2xs transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch"
                >
                  {/* Left: Image Container */}
                  <div 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="relative w-full md:w-52 lg:w-56 shrink-0 bg-[#FFF9F5] aspect-square overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full aspect-square object-cover transition-transform duration-600 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/uploads/products/decor/sunflower.png";
                      }}
                    />
                  </div>

                  {/* Right: Info & Actions */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category, Badge & Rating */}
                      <div className="flex items-center justify-between gap-1 mb-1.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold uppercase tracking-wider text-[12px]">
                            {product.category}
                          </span>
                          {product.badge && (
                            <span className="bg-[#F88897] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 shrink-0">
                          <BsStarFill className="text-[#f59e0b] text-[12px]" />
                          <span className="font-bold text-[#6C2C12] text-sm">{product.rating}</span>
                          <span className="text-[12px] text-black">({product.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-bold text-sm sm:text-base text-[#6C2C12] transition-colors cursor-pointer line-clamp-1 mb-1"
                      >
                        {product.title}
                      </h3>

                      {/* Material Note */}
                      {product.material && (
                        <p className="text-[12px] text-black line-clamp-1 mb-3">
                          {product.material}
                        </p>
                      )}

                      {/* Description */}
                      {product.description && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Price & Actions */}
                    <div className="pt-3 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-[#6C2C12]">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Wishlist Button with Icon + Text */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                            inWishlist
                              ? "bg-[#F88897] border-[#F88897] text-white"
                              : "bg-[#FAF6F0] border-[#EADFD4] text-[#6C2C12] hover:border-[#6C2C12] hover:text-[#6C2C12]"
                          }`}
                        >
                          {inWishlist ? <BsHeartFill className="text-xs" /> : <BsHeart className="text-xs" />}
                          <span>{inWishlist ? "Wishlisted" : "Wishlist"}</span>
                        </button>

                        {/* View Details Button with Icon + Text */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                          title="View Product Details"
                          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-[#FAF6F0] border border-[#EADFD4] text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white transition-all duration-300 cursor-pointer"
                        >
                          <BsEye className="text-xs" />
                          <span>View</span>
                        </button>

                        {/* Add to Cart Button with Icon + Text */}
                        <button
                          onClick={() => {
                            if (!inCart) toggleCart(product);
                          }}
                          disabled={inCart}
                          className={`flex items-center gap-1.5 px-5 sm:px-6 py-2 rounded text-xs font-semibold transition-all duration-300 shadow-xs ${
                            inCart
                              ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                              : "bg-[#6C2C12] text-white border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] cursor-pointer"
                          }`}
                        >
                          {inCart ? <BsCheck2 className="text-sm font-bold" /> : <BsHandbag className="text-xs" />}
                          <span>{inCart ? "In Cart" : "Cart"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Grid View (3 or 4 columns) */
          <motion.div
            key={`grid-${currentPage}-${filteredProducts.length}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={'product-grid grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2  md:grid-cols-3 xl:grid-cols-4'}
          >
            {paginatedProducts.map((product) => {
              const inCart = isProductInCart(product.id);
              const inWishlist = isProductInWishlist(product.id);

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  className="group bg-white rounded-lg border border-[#EADFD4] shadow-2xs transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top: Product Image */}
                  <div 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="aspect-square w-full bg-[#FAF6F0] overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/uploads/products/decor/sunflower.png";
                      }}
                    />

                    {/* Top-Left Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#F88897] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                        {product.badge}
                      </span>
                    )}

                    {/* Floating Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                          inWishlist
                            ? "bg-[#F88897] text-white scale-105"
                            : "bg-white text-[#F88897] hover:bg-[#F88897] hover:text-white"
                        }`}
                      >
                        {inWishlist ? <BsHeartFill className="text-sm" /> : <BsHeart className="text-sm" />}
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                        title="View Product Details"
                        className="w-9 h-9 rounded-full bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 delay-75 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      >
                        <BsEye className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom: Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between gap-1 mb-1.5 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-[12px]">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <BsStarFill className="text-[#f59e0b] text-[12px]" />
                          <span className="font-bold text-[#6C2C12] text-sm">{product.rating}</span>
                          <span className="text-[12px] text-black">({product.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-bold text-sm sm:text-base text-[#6C2C12] transition-colors cursor-pointer line-clamp-1 mb-1"
                      >
                        {product.title}
                      </h3>

                      {/* Material Note */}
                      {product.material && (
                        <p className="text-[12px] text-black line-clamp-1 mb-3">
                          {product.material}
                        </p>
                      )}
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-[#6C2C12]">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          if (!inCart) toggleCart(product);
                        }}
                        disabled={inCart}
                        className={`flex items-center gap-1.5 px-8 py-2 rounded text-xs font-semibold transition-all duration-300 shadow-xs ${
                          inCart
                            ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                            : "bg-[#6C2C12] text-white border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] cursor-pointer"
                        }`}
                      >
                        {inCart ? (
                          <>
                            <BsCheck2 className="text-sm font-bold" /> In Cart
                          </>
                        ) : (
                          <>
                            <BsHandbag className="text-xs" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-10 sm:mt-12 pt-6 border-t border-[#EADFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-[#6C2C12]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
              </span>{" "}
              of <span className="font-bold text-[#6C2C12]">{filteredProducts.length}</span> creations
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] shadow-2xs cursor-pointer"
                }`}
              >
                <BsChevronLeft className="text-xs" /> Prev
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#6C2C12] text-white shadow-xs"
                      : "bg-white text-[#6C2C12] hover:bg-[#FAF3EB] border border-[#EADFD4] shadow-2xs"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] shadow-2xs cursor-pointer"
                }`}
              >
                Next <BsChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
