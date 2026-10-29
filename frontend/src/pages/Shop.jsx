import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsHandbag,
  BsHeart,
  BsHeartFill,
  BsListUl,
  BsSearch,
  BsX,
  BsStarFill,
  BsStarHalf,
  BsStar,
  BsChevronLeft,
  BsChevronRight,
  BsGrid3X3Gap,
  BsEye,
  BsCheck2,
  BsPlus,
  BsDash,
  BsLightningCharge,
  BsSliders2,
  BsLayoutSidebarInset,
  BsFunnel,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuRotateCcw } from "react-icons/lu";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import { getProducts, getCategories } from "../services/dataService";
import { getCategoryIcon } from "../utils/categoryIcons";
import ImageLightbox from "../components/common/ImageLightbox";

const ITEMS_PER_PAGE = 12;

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹300", min: 0, max: 300 },
  { label: "₹300 - ₹600", min: 300, max: 600 },
  { label: "₹600 - ₹1000", min: 600, max: 1000 },
  { label: "Over ₹1000", min: 1000, max: Infinity },
];

const RATING_OPTIONS = [
  { label: "All Ratings", min: 0 },
  { label: "4.5 Stars & Above", min: 4.5 },
  { label: "4.0 Stars & Above", min: 4.0 },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState(["All Creations"]);

  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "All Creations"
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // Index in PRICE_RANGES
  const [selectedRating, setSelectedRating] = useState(0); // Min rating (0, 4.0, 4.5)
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [layoutMode, setLayoutMode] = useState("grid"); // "grid", "list"
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filterbar Display Options:
  // Layout is determined by the Header Dropdown selection (/shop, /shop-sidebar, /shop-drawer or ?layout=...)
  const filterMode = useMemo(() => {
    if (location.pathname.includes("sidebar")) return "sidebar";
    if (location.pathname.includes("drawer")) return "drawer";
    const layout = searchParams.get("layout");
    if (layout === "sidebar" || layout === "drawer" || layout === "top") return layout;
    return "top"; // Original top filter bar is default
  }, [location.pathname, searchParams]);

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Quick View & Lightbox state
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Fetch products and categories on mount
  useEffect(() => {
    getProducts()
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

    getCategories()
      .then((catData) => {
        if (Array.isArray(catData) && catData.length > 0) {
          const names = catData.map((c) => c.name || c.title || c);
          setCategories(["All Creations", ...names]);
        } else {
          setCategories([
            "All Creations",
            "Decor & Gifts",
            "Pet & Animal",
            "Home & Living",
            "Kids & Baby",
            "Personalized",
          ]);
        }
      })
      .catch(() => {
        setCategories([
          "All Creations",
          "Decor & Gifts",
          "Pet & Animal",
          "Home & Living",
          "Kids & Baby",
          "Personalized",
        ]);
      });
  }, []);

  // Sync URL search params
  useEffect(() => {
    const timer = setTimeout(() => {
      const cat = searchParams.get("category");
      if (cat) setSelectedCategory(cat);
      const q = searchParams.get("search");
      if (q) setSearchQuery(q);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Check item in cart / wishlist
  const isProductInCart = (id) => cartItems.some((item) => item.id === id);
  const isProductInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  // Cart Actions (Guest Allowed)
  const toggleCart = (product, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = cart.filter((item) => item.id !== product.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${product.title}" from cart.` },
        })
      );
    } else {
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img,
        quantity: quantity,
      };
      updatedCart = [...cart, newItem];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Added "${product.title}" to cart!` },
        })
      );
    }

    saveCart(updatedCart);
    setCartItems(updatedCart);
  };

  // Wishlist Actions (Guest Allowed)
  const toggleWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const existingIndex = wishlist.findIndex((item) => item.id === product.id);

    let updatedWishlist;
    if (existingIndex > -1) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${product.title}" from wishlist.` },
        })
      );
    } else {
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img,
      };
      updatedWishlist = [...wishlist, newItem];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Added "${product.title}" to wishlist!` },
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  // Category Selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (category === "All Creations") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }
    setSearchParams(nextParams);
  };

  // Search input handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.trim()) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory("All Creations");
    setSearchQuery("");
    setSelectedPriceRange(0);
    setSelectedRating(0);
    setOnlyInStock(false);
    setSortBy("featured");
    setCurrentPage(1);
    searchParams.delete("category");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  const hasActiveFilters =
    selectedCategory !== "All Creations" ||
    searchQuery.trim() !== "" ||
    selectedPriceRange !== 0 ||
    selectedRating !== 0 ||
    onlyInStock ||
    sortBy !== "featured";

  const activeFiltersCount =
    (selectedCategory !== "All Creations" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    (selectedRating !== 0 ? 1 : 0) +
    (onlyInStock ? 1 : 0);

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

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Open Lightbox
  const openLightbox = (product) => {
    const gallery =
      product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.img || "/uploads/products/decor/sunflower.png"];
    setLightboxImages(gallery);
    setIsLightboxOpen(true);
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        if (selectedCategory !== "All Creations") {
          if (!product.category) return false;
          const matchesCat =
            product.category.toLowerCase() === selectedCategory.toLowerCase() ||
            (selectedCategory === "Personalized" &&
              product.category.toLowerCase().includes("personalized"));
          if (!matchesCat) return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesTitle = product.title?.toLowerCase().includes(query);
          const matchesCategory = product.category?.toLowerCase().includes(query);
          const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(query));
          const matchesMaterial = product.material?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesCategory && !matchesTags && !matchesMaterial) {
            return false;
          }
        }

        // Price Range Filter
        const priceRange = PRICE_RANGES[selectedPriceRange];
        if (product.price < priceRange.min || product.price > priceRange.max) {
          return false;
        }

        // Rating Filter
        if (selectedRating > 0 && (product.rating || 4.8) < selectedRating) {
          return false;
        }

        // In Stock Filter
        if (onlyInStock && product.stock === 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "rating-desc":
            return (b.rating || 0) - (a.rating || 0);
          case "name-asc":
            return a.title.localeCompare(b.title);
          case "featured":
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedPriceRange,
    selectedRating,
    onlyInStock,
    sortBy,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const el = document.getElementById("shop-products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = { "All Creations": products.length };
    categories.forEach((cat) => {
      if (cat !== "All Creations") {
        counts[cat] = products.filter(
          (p) => p.category && p.category.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [products, categories]);

  // Reusable Filter Content Component (Shared between Left Sidebar and Left Drawer)
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Search Input Widget */}
      <div>
        <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
          Search Items
        </label>
        <div className="relative">
          <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search creations..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#EADFD4] bg-white text-xs focus:outline-none focus:border-[#6C2C12] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                searchParams.delete("search");
                setSearchParams(searchParams);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C2C12] cursor-pointer"
            >
              <BsX className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Category List Widget */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider">
            Categories
          </h4>
          <span className="text-[10px] text-gray-400 font-semibold">
            {categories.length} Topics
          </span>
        </div>
        <div className="space-y-1">
          {categories.map((category) => {
            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
            const count = categoryCounts[category] || 0;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#6C2C12] text-white shadow-xs"
                    : "text-[#6C2C12] hover:bg-white border border-transparent hover:border-[#EADFD4]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{getCategoryIcon(category)}</span>
                  <span className="truncate">{category}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter Widget */}
      <div>
        <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, idx) => {
            const isSelected = selectedPriceRange === idx;
            return (
              <label
                key={range.label}
                onClick={() => setSelectedPriceRange(idx)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white border-[#6C2C12] text-[#6C2C12] shadow-2xs"
                    : "bg-[#FAF6F0] border-[#EADFD4] text-gray-600 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? "border-[#6C2C12] bg-[#6C2C12]" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </div>
                  <span>{range.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating Filter Widget */}
      <div>
        <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = selectedRating === opt.min;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelectedRating(opt.min)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#6C2C12] text-white shadow-xs"
                    : "text-[#6C2C12] hover:bg-white border border-transparent hover:border-[#EADFD4]"
                }`}
              >
                <span>{opt.label}</span>
                {opt.min > 0 && (
                  <div className="flex items-center gap-0.5">
                    <BsStarFill className={isSelected ? "text-amber-200" : "text-[#f59e0b]"} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5">
          Availability
        </h4>
        <label
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
            onlyInStock
              ? "bg-white border-[#6C2C12] text-[#6C2C12]"
              : "bg-[#FAF6F0] border-[#EADFD4] text-gray-600 hover:bg-white"
          }`}
        >
          <span>In Stock Only</span>
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              onlyInStock ? "bg-[#6C2C12] border-[#6C2C12] text-white" : "border-gray-300 bg-white"
            }`}
          >
            {onlyInStock && <BsCheck2 className="text-xs font-bold" />}
          </div>
        </label>
      </div>

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-[#EADFD4]">
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <LuRotateCcw className="text-sm" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#6C2C12]">
      {/* Lightbox Component */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxImages}
        title={quickViewProduct?.title || "Creation Preview"}
      />

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={closeQuickView}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-[#EADFD4] shadow-2xl max-w-3xl w-full p-6 sm:p-8 overflow-hidden relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeQuickView}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] text-[#6C2C12] hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <BsX className="text-2xl" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Image & Lightbox Trigger */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EADFD4] group">
                  <img
                    src={quickViewProduct.img}
                    alt={quickViewProduct.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/uploads/products/decor/sunflower.png";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => openLightbox(quickViewProduct)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <span>Zoom in Lightbox</span>
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52] bg-[#FAF3EB] px-2.5 py-1 rounded-md">
                      {quickViewProduct.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#6C2C12] mt-2 mb-1">
                      {quickViewProduct.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">{renderStars(quickViewProduct.rating || 4.8)}</div>
                      <span className="text-xs text-gray-500">
                        ({quickViewProduct.reviewsCount || 42} artisan reviews)
                      </span>
                    </div>
                  </div>

                  <div className="text-2xl font-extrabold text-[#6C2C12]">
                    ₹{quickViewProduct.price?.toLocaleString("en-IN")}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {quickViewProduct.description ||
                      "Each crochet piece is hand-stitched with love using premium cotton-acrylic blend yarns for maximum durability, softness, and heirloom quality."}
                  </p>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs font-bold uppercase text-[#6C2C12]">Quantity:</span>
                    <div className="flex items-center border border-[#EADFD4] rounded-xl bg-[#FAF6F0] p-1">
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-[#6C2C12] hover:text-white transition-colors cursor-pointer text-xs"
                      >
                        <BsDash />
                      </button>
                      <span className="w-10 text-center text-xs font-bold">{modalQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-[#6C2C12] hover:text-white transition-colors cursor-pointer text-xs"
                      >
                        <BsPlus />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          toggleCart(quickViewProduct, modalQuantity);
                          closeQuickView();
                        }}
                        className="py-2.5 px-4 bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <BsHandbag /> Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleCart(quickViewProduct, modalQuantity);
                          closeQuickView();
                          navigate("/checkout");
                        }}
                        className="py-2.5 px-4 bg-[#F88897] hover:bg-[#6C2C12] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <BsLightningCharge /> Buy Now
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeQuickView();
                        navigate(`/product/${quickViewProduct.id}`);
                      }}
                      className="w-full py-2 text-center text-xs font-bold text-[#6C2C12] hover:text-[#F88897] hover:underline cursor-pointer"
                    >
                      View Full Product Details & Reviews →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SLIDE-OUT LEFT DRAWER FILTER (Option 2 / Mobile Drawer)  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Left Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-[#FAF6F0] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-r border-[#EADFD4]"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#EADFD4] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#FAF3EB] text-[#F88897] flex items-center justify-center">
                    <BsSliders2 className="text-base" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#6C2C12] text-sm sm:text-base">Filter Creations</h3>
                    <p className="text-[10px] text-gray-500">Refine catalog by price, topic, or ratings</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-colors text-[#6C2C12] cursor-pointer"
                >
                  <BsX className="text-2xl" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5">{renderFilterContent()}</div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#EADFD4] bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADFD4] text-xs font-bold text-[#6C2C12] hover:bg-[#FAF6F0] transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Apply ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Banner Section */}
      <div className="relative h-100 sm:h-110 md:h-120 bg-gray-100 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center w-full h-full bg-[url('/uploads/hero/shop-hero.jpg')]"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-white/25 sm:bg-transparent" />

        <div className="relative container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="w-full sm:w-[85%] md:w-[70%] lg:w-[55%] xl:w-[48%] py-8">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[2px] text-[#6C2C12] bg-[#FAF3EB]/90 px-3 py-1 rounded-full mb-3 inline-block">
              Artisan Catalog
            </span>

            <h1 className="my-2 sm:my-3 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl text-[#6C2C12]">
              Made With Care, <br />
              <span className="text-[#F88897]">Stitched With Love</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 max-w-lg">
              Explore our complete collection of handmade crochet creations, from adorable amigurumi plushies to everlasting floral stems.
            </p>
          </div>
        </div>
      </div>

      {/* Main Shop Container */}
      <div
        id="shop-products"
        className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 sm:pt-10 pb-16 scroll-mt-24"
      >
        {/* Style 1: Original Top Category Pills Bar (visible when filterMode === 'top') */}
        {filterMode === "top" && (
          <div className="mb-6 pb-2 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
            {categories.map((category) => {
              const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#6C2C12] text-white shadow-md shadow-[#6C2C12]/20 scale-102"
                      : "bg-white text-gray-600 border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white"
                  }`}
                >
                  <span className="text-sm opacity-90">{getCategoryIcon(category)}</span>
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
        )}

        {/* ======================================================== */}
        {/* TOP TOOLBAR: FILTERBAR MODE SWITCHER & SORTING           */}
        {/* ======================================================== */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADFD4] mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left Controls: Filter Button (in Drawer mode or mobile) + Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Button (Opens Left Drawer) - Visible when in Drawer mode, or on mobile */}
              {(filterMode === "drawer" || filterMode === "sidebar") && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                    filterMode === "drawer"
                      ? "bg-[#6C2C12] hover:bg-[#F88897] text-white"
                      : "lg:hidden bg-[#6C2C12] text-white"
                  }`}
                >
                  <BsFunnel className="text-sm" />
                  <span>Filter Creations</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#F88897] text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}

              {/* Search Input */}
              <div className="relative min-w-[200px] max-w-xs flex-1">
                <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search creations..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#EADFD4] rounded-xl text-xs sm:text-sm text-[#6C2C12] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C2C12] cursor-pointer"
                  >
                    <BsX className="text-base" />
                  </button>
                )}
              </div>

              {/* Price Range selector (Quick filter in Top mode) */}
              {filterMode === "top" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 hidden xl:inline">
                    Price:
                  </span>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => {
                      setSelectedPriceRange(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
                  >
                    {PRICE_RANGES.map((range, idx) => (
                      <option key={range.label} value={idx}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Controls: Filter Style Dropdown + Sort + Grid/List View Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                <strong className="text-[#6C2C12]">{filteredProducts.length}</strong> items
              </span>



              {/* Sorters */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[#EADFD4] bg-white text-xs sm:text-sm font-medium text-[#6C2C12] focus:outline-none focus:border-[#6C2C12] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Layout Mode Toggles */}
              <div className="flex items-center bg-white rounded-xl border border-[#EADFD4] p-1">
                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`p-2 rounded-lg text-sm transition-all cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-[#6C2C12] text-white"
                      : "text-gray-500 hover:text-[#6C2C12]"
                  }`}
                  title="Grid View"
                >
                  <BsGrid3X3Gap />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("list")}
                  className={`p-2 rounded-lg text-sm transition-all cursor-pointer ${
                    layoutMode === "list"
                      ? "bg-[#6C2C12] text-white"
                      : "text-gray-500 hover:text-[#6C2C12]"
                  }`}
                  title="List View"
                >
                  <BsListUl />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-[#EADFD4] flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">Active:</span>

              {selectedCategory !== "All Creations" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => handleCategorySelect("All Creations")}
                    className="hover:text-red-500"
                  >
                    <BsX />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchParams.delete("search");
                      setSearchParams(searchParams);
                    }}
                    className="hover:text-red-500"
                  >
                    <BsX />
                  </button>
                </span>
              )}

              {selectedPriceRange !== 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>{PRICE_RANGES[selectedPriceRange].label}</span>
                  <button onClick={() => setSelectedPriceRange(0)} className="hover:text-red-500">
                    <BsX />
                  </button>
                </span>
              )}

              {selectedRating !== 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <BsStarFill className="text-amber-400 text-xs" />
                  <span>{selectedRating} & above</span>
                  <button onClick={() => setSelectedRating(0)} className="hover:text-red-500">
                    <BsX />
                  </button>
                </span>
              )}

              {onlyInStock && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>In Stock</span>
                  <button onClick={() => setOnlyInStock(false)} className="hover:text-red-500">
                    <BsX />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearFilters}
                className="ml-auto text-xs font-bold text-[#F88897] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LuRotateCcw /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: OPTION 1 (LEFT SIDEBAR) vs OPTION 2 (DRAWER)  */}
        {/* ======================================================== */}
        <div
          className={
            filterMode === "sidebar"
              ? "flex flex-col lg:flex-row gap-8 items-start"
              : "w-full"
          }
        >
          {/* OPTION 1: Fixed Left Sidebar (visible on lg+ when filterMode === 'sidebar') */}
          {filterMode === "sidebar" && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 bg-[#FAF6F0] p-6 rounded-3xl border border-[#EADFD4] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EADFD4]">
                <div className="flex items-center gap-2">
                  <BsLayoutSidebarInset className="text-base text-[#F88897]" />
                  <h3 className="font-bold text-[#6C2C12] text-sm uppercase tracking-wider">
                    Filters
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-[#F88897] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              {renderFilterContent()}
            </aside>
          )}

          {/* Main Products Grid Container */}
          <div className="flex-1 w-full min-w-0">
            {/* Loading Spinner */}
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-[#6C2C12] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#6C2C12]">
                  Gathering handmade creations...
                </p>
              </div>
            )}

            {/* Empty Search / Filter Results */}
            {!loading && paginatedProducts.length === 0 && (
              <div className="text-center py-16 bg-[#FAF6F0] rounded-3xl border border-[#EADFD4] p-8">
                <GiYarn className="text-5xl text-[#F88897] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-[#6C2C12]">No Creations Found</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  We couldn&apos;t find any items matching your selected criteria. Try resetting
                  filters or adjusting your search keyword.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-[#6C2C12] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#F88897] transition-all cursor-pointer shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Product Display: List View */}
            {!loading && paginatedProducts.length > 0 && layoutMode === "list" && (
              <div className="space-y-4">
                {paginatedProducts.map((product) => {
                  const inCart = isProductInCart(product.id);
                  const inWishlist = isProductInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#EADFD4] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center justify-between hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#EADFD4] shrink-0 cursor-pointer"
                        >
                          <img
                            src={product.img}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/uploads/products/decor/sunflower.png";
                            }}
                          />
                          {product.badge && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F88897] text-white">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C52]">
                            {product.category}
                          </span>
                          <h3
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="font-bold text-base text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                          >
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {renderStars(product.rating || 4.8)}
                            <span className="text-xs text-gray-500">
                              ({product.reviewsCount || 42})
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE4]">
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-bold text-[#6C2C12]">
                            ₹{product.price?.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            Free Shipping
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openQuickView(product)}
                            className="p-2.5 rounded-xl bg-[#FAF6F0] text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] transition-all cursor-pointer"
                            title="Quick View"
                          >
                            <BsEye className="text-sm" />
                          </button>

                          <button
                            onClick={() => toggleWishlist(product)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              inWishlist
                                ? "bg-[#F88897] text-white border-[#F88897]"
                                : "bg-[#FAF6F0] text-[#6C2C12] border-[#EADFD4] hover:border-[#6C2C12]"
                            }`}
                            title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                          >
                            {inWishlist ? (
                              <BsHeartFill className="text-sm" />
                            ) : (
                              <BsHeart className="text-sm" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleCart(product)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                              inCart
                                ? "bg-gray-200 text-gray-500"
                                : "bg-[#6C2C12] hover:bg-[#F88897] text-white"
                            }`}
                          >
                            {inCart ? (
                              <BsCheck2 className="text-sm font-bold" />
                            ) : (
                              <BsHandbag className="text-xs" />
                            )}
                            <span>{inCart ? "In Cart" : "Add"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Product Display: Grid View (Adapts columns depending on filterMode) */}
            {!loading && paginatedProducts.length > 0 && layoutMode === "grid" && (
              <div
                className={`grid gap-5 sm:gap-6 ${
                  filterMode === "sidebar"
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {paginatedProducts.map((product) => {
                  const inCart = isProductInCart(product.id);
                  const inWishlist = isProductInWishlist(product.id);

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-[#EADFD4] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top: Product Image */}
                      <div
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="aspect-square w-full bg-[#FAF6F0] overflow-hidden relative cursor-pointer"
                      >
                        <img
                          src={product.img}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "/uploads/products/decor/sunflower.png";
                          }}
                        />

                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-[#F88897] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs z-10 pointer-events-none">
                            {product.badge}
                          </span>
                        )}

                        {/* Action Hover Buttons */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                              inWishlist
                                ? "bg-[#F88897] text-white scale-105"
                                : "bg-white text-[#F88897] hover:bg-[#F88897] hover:text-white"
                            }`}
                            title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                          >
                            {inWishlist ? (
                              <BsHeartFill className="text-sm" />
                            ) : (
                              <BsHeart className="text-sm" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickView(product);
                            }}
                            className="w-9 h-9 rounded-full bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 delay-75 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                            title="Quick View Modal"
                          >
                            <BsEye className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[11px] text-[#A67C52]">
                              {product.category}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                              <BsStarFill className="text-[#f59e0b] text-[11px]" />
                              <span className="font-bold text-[#6C2C12] text-xs">
                                {product.rating || 4.8}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({product.reviewsCount || 42})
                              </span>
                            </div>
                          </div>

                          <h3
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="font-bold text-sm sm:text-base text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer line-clamp-1 mb-1"
                          >
                            {product.title}
                          </h3>

                          {product.material && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 mb-3">
                              {product.material}
                            </p>
                          )}
                        </div>

                        {/* Price and Cart Button */}
                        <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-base sm:text-lg font-extrabold text-[#6C2C12]">
                              ₹{product.price?.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleCart(product)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 shadow-2xs cursor-pointer ${
                              inCart
                                ? "bg-gray-200 text-gray-500"
                                : "bg-[#6C2C12] hover:bg-[#F88897] text-white"
                            }`}
                          >
                            {inCart ? (
                              <BsCheck2 className="text-sm font-bold" />
                            ) : (
                              <BsHandbag className="text-xs" />
                            )}
                            <span>{inCart ? "In Cart" : "Add"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 sm:mt-12 pt-6 border-t border-[#EADFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-[#6C2C12]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#6C2C12]">
                    {filteredProducts.length}
                  </span>{" "}
                  creations
                </p>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <BsChevronLeft className="text-xs" /> Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-[#6C2C12] text-white shadow-xs"
                          : "bg-white text-[#6C2C12] hover:bg-[#FAF3EB] border border-[#EADFD4]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <BsChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
