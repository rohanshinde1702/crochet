import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsHeart, BsHeartFill, BsHandbag, BsStarFill, BsStarHalf, BsStar, BsWhatsapp, BsTelephone, BsChevronRight,
  BsArrowLeft, BsInstagram, BsFacebook, BsTwitterX, BsCheck2, BsShare, BsEye
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuHandHeart, LuLeaf } from "react-icons/lu";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import TopBar from "../components/topBar/TopBar";
import { useSettings } from "../context/SettingsContext";
import { API_ENDPOINTS } from "../config/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Sync cart and wishlist from localStorage
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

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Fetch product and related products from API
  useEffect(() => {
    setLoading(true);
    fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setLoading(false);
      });

    fetch(API_ENDPOINTS.PRODUCTS)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRelatedProducts(data.filter((p) => p.id !== parseInt(id, 10)).slice(0, 4));
        }
      })
      .catch((err) => {
        console.error("Failed to load related products:", err);
      });
  }, [id]);

  const inCart = product ? cartItems.some((item) => item.id === product.id) : false;
  const inWishlist = product ? wishlistItems.some((item) => item.id === product.id) : false;

  // Cart actions
  const handleAddToCart = () => {
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Please sign in to add items to your cart! 🧶" }
        })
      );
      navigate("/signin");
      return;
    }

    if (inCart) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const newItem = {
      id: product.id,
      category: product.category,
      title: product.title,
      price: product.price,
      img: product.img,
      quantity: 1
    };

    const updatedCart = [...cart, newItem];
    saveCart(updatedCart);
    setCartItems(updatedCart);

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Added "${product.title}" to cart! 🧶` }
      })
    );
  };

  // Wishlist actions
  const handleToggleWishlist = () => {
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
    const exists = wishlist.some((item) => item.id === product.id);

    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${product.title}" from wishlist.` }
        })
      );
    } else {
      updatedWishlist = [...wishlist, product];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Saved "${product.title}" to wishlist! ♥` }
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  // Copy product link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Product link copied to clipboard! 📋" }
      })
    );
  };

  // Related product wishlist toggle
  const toggleRelatedWishlist = (relProduct, e) => {
    e.stopPropagation();
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
    const exists = wishlist.some((item) => item.id === relProduct.id);

    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter((item) => item.id !== relProduct.id);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Removed "${relProduct.title}" from wishlist.` }
        })
      );
    } else {
      updatedWishlist = [...wishlist, relProduct];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Saved "${relProduct.title}" to wishlist! ♥` }
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  // Related product Add to Cart handler
  const handleAddRelatedToCart = (relProduct, e) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Please sign in to add items to your cart! 🧶" }
        })
      );
      navigate("/signin");
      return;
    }

    const inCartAlready = cartItems.some((item) => item.id === relProduct.id);
    if (inCartAlready) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const newItem = {
      id: relProduct.id,
      category: relProduct.category,
      title: relProduct.title,
      price: relProduct.price,
      img: relProduct.img,
      quantity: 1
    };

    const updatedCart = [...cart, newItem];
    saveCart(updatedCart);
    setCartItems(updatedCart);

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Added "${relProduct.title}" to cart! 🧶` }
      })
    );
  };

  // Render Stars
  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating || 5);
    const hasHalf = (rating || 5) % 1 >= 0.4;

    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        stars.push(<BsStarFill key={i} className="text-amber-500 text-sm" />);
      } else if (i === full + 1 && hasHalf) {
        stars.push(<BsStarHalf key={i} className="text-amber-500 text-sm" />);
      } else {
        stars.push(<BsStar key={i} className="text-gray-300 text-sm" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#6C2C12] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#6C2C12] font-semibold text-sm">Loading handcrafted creation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-[#6C2C12]">Product Not Found</h2>
        <p className="text-gray-500">The product you are looking for could not be found.</p>
        <Link to="/shop" className="bg-[#6C2C12] text-white px-6 py-2.5 rounded font-bold uppercase text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#6C2C12] lg:pb-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF6F0] border-b border-[#EADFD4]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-[#6C2C12] transition-colors">Home</Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link to="/shop" className="hover:text-[#6C2C12] transition-colors">Shop</Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#6C2C12] transition-colors">
              {product.category}
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <span className="text-[#6C2C12] font-semibold truncate max-w-xs">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-6 sm:pt-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer mb-6"
        >
          <BsArrowLeft /> Back to products
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column: Product Image Gallery */}
          <div className="w-full lg:w-[40%] space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#FAF6F0] border border-[#EADFD4] shadow-xs group"
            >
              <img
                src={product.img}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src = "/uploads/products/decor/sunflower.png";
                }}
              />

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F88897] text-white shadow-xs">
                  {product.badge}
                </span>
              )}

              {/* Floating Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-[#EADFD4] flex items-center justify-center text-[#6C2C12] hover:scale-110 shadow-xs transition-all cursor-pointer z-10"
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {inWishlist ? <BsHeartFill className="text-lg text-[#F88897]" /> : <BsHeart className="text-lg" />}
              </button>
            </motion.div>

            {/* Quality Promise Badges below Image */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <LuHandHeart className="text-lg text-[#F88897] mx-auto mb-1" />
                <p className="text-[10px] sm:text-[11px] font-bold text-[#6C2C12]">100% Handmade</p>
              </div>
              <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <GiYarn className="text-lg text-[#6C2C12] mx-auto mb-1" />
                <p className="text-[10px] sm:text-[11px] font-bold text-[#6C2C12]">Soft Yarn</p>
              </div>
              <div className="p-2.5 rounded bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <LuLeaf className="text-lg text-emerald-600 mx-auto mb-1" />
                <p className="text-[10px] sm:text-[11px] font-bold text-[#6C2C12]">Eco Packed</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions in One Row */}
          <div className="w-full lg:w-1/2 space-y-5">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[2px] text-[#F88897] mb-1">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#6C2C12]">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating || 4.8)}
                </div>
                <span className="text-xs font-bold text-[#6C2C12]">{product.rating || 4.8}</span>
                <span className="text-xs text-gray-400">({product.reviewsCount || 42} reviews)</span>
              </div>
            </div>

            {/* Price Section - Only Product Price */}
            <div className="flex items-center gap-3 py-3 border-t border-b border-[#F2ECE4]">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                In Stock
              </span>
            </div>

            {/* Material Highlight */}
            {product.material && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 bg-[#FAF6F0] p-3 rounded-xl border border-[#EADFD4]">
                <GiYarn className="text-base text-[#6C2C12] shrink-0" />
                <span><strong>Material:</strong> {product.material}</span>
              </div>
            )}

            {/* Short Description */}
            <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>

            {/* Single Row: Add to Cart, WhatsApp, and Call Buttons with identical width & height */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
                {/* 1. Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className={`flex-1 w-full h-11 py-1.5 rounded font-bold text-xs sm:text-sm uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-xs ${inCart
                      ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                      : "bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] cursor-pointer"
                    }`}
                >
                  {inCart ? (
                    <>
                      <BsCheck2 className="text-base font-bold" /> In Cart
                    </>
                  ) : (
                    <>
                      <BsHandbag className="text-base" /> Add to Cart
                    </>
                  )}
                </button>

                {/* 2. Inquire on WhatsApp */}
                <a
                  href={`https://wa.me/919876543210?text=Hi%20CozyLoops!%20I'm%20interested%20in%20ordering%20"${encodeURIComponent(product.title)}"%20(Product%20ID:%20%23${product.id},%20Price:%20₹${product.price?.toLocaleString('en-IN')}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 w-full h-11 py-1.5 bg-[#25D366] hover:bg-transparent text-white hover:text-[#25D366] border-2 border-[#25D366] rounded font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xs cursor-pointer"
                >
                  <BsWhatsapp className="text-base" /> WhatsApp
                </a>

                {/* 3. Call Button */}
                <a
                  href="tel:+919876543210"
                  className="flex-1 w-full h-11 py-1.5 bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] rounded font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xs cursor-pointer"
                  title="Call Artisan"
                >
                  <BsTelephone className="text-base" /> Call
                </a>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="pt-4 border-t border-[#F2ECE4]">
              <div className="flex border-b border-[#EADFD4] gap-6 text-xs sm:text-sm font-bold">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "details"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                    }`}
                >
                  Care & Craft
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "shipping"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                    }`}
                >
                  Shipping & Gifting
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${activeTab === "custom"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                    }`}
                >
                  Custom Orders
                </button>
              </div>

              <div className="py-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {activeTab === "details" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Gently hand-wash in cool water using mild yarn detergent.</li>
                    <li>Reshape and dry flat in the shade to preserve weave structure.</li>
                    <li>Avoid bleach, rigorous scrubbing, or machine tumble drying.</li>
                    <li>Every creation is 100% handmade and stitch-tension tested.</li>
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Packaged in plastic-free sustainable craft boxes with twine and dried flowers.</li>
                    <li>Dispatches within 24-48 hours across India.</li>
                    <li>Personalized gift messages and gift wrapping available on checkout inquiry.</li>
                  </ul>
                )}
                {activeTab === "custom" && (
                  <p>
                    Looking for a specific color palette, size variation, or name tag embroidery? Connect directly with us on WhatsApp for tailored bespoke requests.
                  </p>
                )}
              </div>
            </div>

            {/* Share Options */}
            <div className="pt-4 border-t border-[#F2ECE4] flex flex-col flex-wrap gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C2C12] flex items-center gap-1.5">
                <BsShare className="text-sm text-[#F88897]" /> Share:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this handmade "${product.title}" on CozyLoops! ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#25D366]/30 shadow-2xs cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <BsWhatsapp className="text-sm" />
                </a>

                {/* Instagram */}
                <a
                  href={settings?.socialLinks?.instagram || "https://www.instagram.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#E1306C]/30 shadow-2xs cursor-pointer"
                  title="Visit our Instagram"
                >
                  <BsInstagram className="text-sm" />
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this handmade "${product.title}" on CozyLoops!`
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-black/5 text-gray-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 border border-gray-300 shadow-2xs cursor-pointer"
                  title="Share on Twitter / X"
                >
                  <BsTwitterX className="text-xs" />
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#1877F2]/30 shadow-2xs cursor-pointer"
                  title="Share on Facebook"
                >
                  <BsFacebook className="text-sm" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations Section */}
        <div className="mt-14 sm:mt-20 pt-8 border-t border-[#EADFD4]">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[2px] text-[#F88897]">
              - Discover More -
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#6C2C12] mt-1">
              You May Also Love
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => {
              const relInCart = cartItems.some((item) => item.id === relProduct.id);
              const relInWishlist = wishlistItems.some((item) => item.id === relProduct.id);

              return (
                <div
                  key={relProduct.id}
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  className="bg-white rounded-lg shadow-sm border border-[#EADFD4] overflow-hidden group cursor-pointer transition-all flex flex-col justify-between"
                >
                  {/* Top: Product Image with Hover Actions */}
                  <div className="aspect-square w-full bg-[#FAF6F0] overflow-hidden relative">
                    <img
                      src={relProduct.img}
                      alt={relProduct.title}
                      className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/uploads/products/decor/sunflower.png";
                      }}
                    />

                    {/* Top-Left Badge (appears on hover) */}
                    {relProduct.badge && (
                      <span className="absolute top-3 left-3 bg-[#F88897] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                        {relProduct.badge}
                      </span>
                    )}

                    {/* Floating Action Buttons: Wishlist & View (appear from right on hover) */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleRelatedWishlist(relProduct, e)}
                        title={relInWishlist ? "In Wishlist" : "Add to Wishlist"}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${relInWishlist
                            ? "bg-[#F88897] text-white scale-105"
                            : "bg-white text-[#F88897] hover:bg-[#F88897] hover:text-white"
                          }`}
                      >
                        {relInWishlist ? <BsHeartFill className="text-sm" /> : <BsHeart className="text-sm" />}
                      </button>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${relProduct.id}`);
                        }}
                        title="View Product Details"
                        className="w-9 h-9 rounded-full bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 delay-75 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      >
                        <BsEye className="text-sm" />
                      </button>
                    </div>

                    {/* Add to Cart Button (appears from bottom of image on hover) */}
                    <div className="absolute bottom-0 inset-x-0 p-2.5 z-10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                      <button
                        onClick={(e) => handleAddRelatedToCart(relProduct, e)}
                        disabled={relInCart}
                        className={`w-full py-2 px-3 rounded font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all duration-300 ${relInCart
                            ? "bg-gray-400 text-white cursor-not-allowed border-2 border-gray-400"
                            : "bg-[#6C2C12] hover:bg-[#601f04] text-white hover:text-white border-2 border-[#6C2C12] hover:border-[#601f04] cursor-pointer"
                          }`}
                      >
                        {relInCart ? (
                          <>
                            <BsCheck2 className="text-sm font-bold" /> In Cart
                          </>
                        ) : (
                          <>
                            <BsHandbag className="text-xs" /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[12px] font-bold uppercase text-black tracking-wider mb-1 block">
                        {relProduct.category}
                      </span>
                      <h3 className="font-bold text-base text-[#6C2C12] transition-colors line-clamp-1 mb-2">
                        {relProduct.title}
                      </h3>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-[#F2ECE4]">
                      <span className="text-lg font-bold text-black">
                        ₹{relProduct.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-[#6C2C12] hover:underline transition-colors flex items-center gap-1">
                        View Item →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
