import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsHeart,
  BsHeartFill,
  BsHandbag,
  BsStarFill,
  BsStarHalf,
  BsStar,
  BsWhatsapp,
  BsTelephone,
  BsChevronRight,
  BsArrowLeft,
  BsInstagram,
  BsFacebook,
  BsTwitterX,
  BsCheck2,
  BsShare,
  BsZoomIn,
  BsArrowsFullscreen,
  BsTruck,
  BsShieldCheck,
  BsPlus,
  BsDash,
  BsLightningCharge,
  BsChatSquareHeart
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuHandHeart, LuLeaf, LuSparkles } from "react-icons/lu";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import { useSettings } from "../context/SettingsContext";
import { getProductById, getProducts } from "../services/dataService";
import ImageLightbox from "../components/common/ImageLightbox";

const ProductDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'shipping' | 'reviews' | 'custom'
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Pooja Sharma",
      rating: 5,
      date: "14 Oct 2026",
      comment: "The stitch quality is unbelievably soft! The attention to detail is truly artisan grade. Came in gorgeous plastic-free packaging with dried flowers.",
      verified: true
    },
    {
      id: 2,
      name: "Sneha Mukherjee",
      rating: 5,
      date: "02 Oct 2026",
      comment: "Ordered as a newborn baby gift. The mother loved it! Very gentle on baby skin and no harsh chemical smell.",
      verified: true
    },
    {
      id: 3,
      name: "Rahul Verma",
      rating: 4.5,
      date: "22 Sep 2026",
      comment: "Looks exactly like the preview pictures. Super cute desk decor and well-made.",
      verified: true
    }
  ]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

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
    setActiveImageIndex(0);
    setQuantity(1);
  }, [id]);

  // Derive gallery images
  const buildGallery = (prod) => {
    if (prod.images && Array.isArray(prod.images) && prod.images.length > 1) {
      return prod.images;
    }
    const mainImg = prod.img || "/uploads/products/decor/sunflower.png";
    const cat = (prod.category || "").toLowerCase();
    let extras;

    if (cat.includes("kids") || cat.includes("baby")) {
      extras = [
        "/uploads/products/kids/hat.png",
        "/uploads/products/kids/category-1.png",
        "/uploads/others/contact_bunny.jpg"
      ];
    } else if (cat.includes("decor") || cat.includes("gift")) {
      extras = [
        "/uploads/products/decor/flower keychain.png",
        "/uploads/products/decor/Cornus florida.png",
        "/uploads/products/decor/category-1.png"
      ];
    } else if (cat.includes("home") || cat.includes("living")) {
      extras = [
        "/uploads/products/home/category-1.png",
        "/uploads/products/home/category-2.png",
        "/uploads/others/contact_hearts_basket.jpg"
      ];
    } else if (cat.includes("pet") || cat.includes("animal")) {
      extras = [
        "/uploads/products/pet/bee.png",
        "/uploads/products/pet/frog.png",
        "/uploads/products/pet/panda.png"
      ];
    } else {
      extras = [
        "/uploads/products/custom/letter-r.png",
        "/uploads/products/custom/category-1.png",
        "/uploads/others/madeByHand.png"
      ];
    }

    const unique = [mainImg, ...extras.filter((x) => x !== mainImg)];
    return unique.slice(0, 4);
  };

  // Fetch product and related products
  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((data) => {
        if (data) {
          setProduct(data);
          const gallery = buildGallery(data);
          setGalleryImages(gallery);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setLoading(false);
      });

    getProducts()
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

  // Add to Cart handler (Guest allowed!)
  const handleAddToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: (item.quantity || 1) + quantity }
          : item
      );
    } else {
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img,
        quantity: quantity
      };
      updatedCart = [...cart, newItem];
    }

    saveCart(updatedCart);
    setCartItems(updatedCart);

    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Added ${quantity} × "${product.title}" to cart!` }
      })
    );
  };

  // Instant Buy Now: adds to cart & redirects to /checkout
  const handleBuyNow = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: (item.quantity || 1) + quantity }
          : item
      );
    } else {
      const newItem = {
        id: product.id,
        category: product.category,
        title: product.title,
        price: product.price,
        img: product.img,
        quantity: quantity
      };
      updatedCart = [...cart, newItem];
    }

    saveCart(updatedCart);
    setCartItems(updatedCart);
    navigate("/checkout");
  };

  // Wishlist actions (Guest allowed)
  const handleToggleWishlist = () => {
    if (!product) return;

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
          detail: { message: `Saved "${product.title}" to wishlist!` }
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  // Submit Review Handler
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    setSubmittingReview(true);
    setTimeout(() => {
      const createdReview = {
        id: Date.now(),
        name: newReview.name.trim(),
        rating: Number(newReview.rating),
        date: "Just now",
        comment: newReview.comment.trim(),
        verified: true
      };

      setReviews((prev) => [createdReview, ...prev]);
      setNewReview({ name: "", rating: 5, comment: "" });
      setSubmittingReview(false);

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Thank you for your handcrafted review!" }
        })
      );
    }, 400);
  };

  // Render Stars helper
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
        <h2 className="text-2xl font-bold text-[#6C2C12]">Creation Not Found</h2>
        <p className="text-gray-500">The product you are looking for does not exist or has been archived.</p>
        <Link to="/shop" className="bg-[#6C2C12] text-white px-6 py-2.5 rounded font-bold uppercase text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const currentMainImage = galleryImages[activeImageIndex] || product.img;

  return (
    <div className="min-h-screen bg-white text-[#6C2C12] pb-16">
      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={galleryImages}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        title={product.title}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF6F0] border-b border-[#EADFD4]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-[#6C2C12] transition-colors">
              Home
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link to="/shop" className="hover:text-[#6C2C12] transition-colors">
              Shop
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#6C2C12] transition-colors"
            >
              {product.category}
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <span className="text-[#6C2C12] font-semibold truncate max-w-xs">
              {product.title}
            </span>
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Image Gallery & Thumbnails */}
          <div className="w-full lg:w-[48%] space-y-4">
            {/* Main Image Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EADFD4] shadow-sm group cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                key={currentMainImage}
                src={currentMainImage}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src = "/uploads/products/decor/sunflower.png";
                }}
              />

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F88897] text-white shadow-xs pointer-events-none z-10">
                  {product.badge}
                </span>
              )}

              {/* Floating Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {/* Fullscreen Lightbox Zoom Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-[#EADFD4] flex items-center justify-center text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white hover:scale-110 shadow-xs transition-all cursor-pointer"
                  title="Open Fullscreen Lightbox"
                >
                  <BsArrowsFullscreen className="text-sm" />
                </button>

                {/* Floating Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist();
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-[#EADFD4] flex items-center justify-center text-[#6C2C12] hover:scale-110 shadow-xs transition-all cursor-pointer"
                  title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {inWishlist ? (
                    <BsHeartFill className="text-lg text-[#F88897]" />
                  ) : (
                    <BsHeart className="text-lg" />
                  )}
                </button>
              </div>

              {/* Hover Click to Enlarge Pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <BsZoomIn className="text-sm" /> Click to view full lightbox
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {galleryImages.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#FAF6F0] ${
                      activeImageIndex === idx
                        ? "border-[#6C2C12] ring-2 ring-[#6C2C12]/20 scale-105"
                        : "border-[#EADFD4] opacity-70 hover:opacity-100 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Promise Badges below Image */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <LuHandHeart className="text-xl text-[#F88897] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#6C2C12]">100% Handmade</p>
                <p className="text-[10px] text-gray-500">Stitch by stitch</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <GiYarn className="text-xl text-[#6C2C12] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#6C2C12]">Premium Yarn</p>
                <p className="text-[10px] text-gray-500">Soft milk cotton</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EADFD4]/70 text-center">
                <LuLeaf className="text-xl text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-[#6C2C12]">Eco Packed</p>
                <p className="text-[10px] text-gray-500">Zero plastic waste</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="w-full lg:w-[52%] space-y-5">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[2px] text-[#F88897] mb-1.5">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-[#6C2C12]">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating || 4.8)}
                </div>
                <span className="text-xs font-bold text-[#6C2C12]">
                  {product.rating || 4.8}
                </span>
                <span className="text-xs text-gray-400">
                  ({reviews.length} customer reviews)
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center gap-3.5 py-3.5 border-t border-b border-[#F2ECE4]">
              <span className="text-3xl font-extrabold text-[#6C2C12]">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock • Dispatches in 24–48h
              </span>
            </div>

            {/* Material Highlight */}
            {product.material && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 bg-[#FAF6F0] p-3 rounded-xl border border-[#EADFD4]">
                <GiYarn className="text-base text-[#6C2C12] shrink-0" />
                <span>
                  <strong>Material:</strong> {product.material}
                </span>
              </div>
            )}

            {/* Short Description */}
            <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#EADFD4] rounded-xl bg-[#FAF6F0] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2.5 hover:bg-[#EADFD4] text-[#6C2C12] transition-colors cursor-pointer"
                  >
                    <BsDash className="text-base" />
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-[#6C2C12] min-w-10 text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-2.5 hover:bg-[#EADFD4] text-[#6C2C12] transition-colors cursor-pointer"
                  >
                    <BsPlus className="text-base" />
                  </button>
                </div>
              </div>

              {/* Primary Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <BsHandbag className="text-base" /> Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#F88897] hover:bg-[#6C2C12] text-white border-2 border-transparent font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <BsLightningCharge className="text-base" /> Buy Now
                </button>
              </div>

              {/* Artisan WhatsApp & Call Contact Options */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://wa.me/919876543210?text=Hi%20CozyLoops!%20I'm%20interested%20in%20customizing%20"${encodeURIComponent(
                    product.title
                  )}"%20(Product%20ID:%20%23${product.id}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-[#25D366] hover:bg-transparent text-white hover:text-[#25D366] border-2 border-[#25D366] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs cursor-pointer"
                >
                  <BsWhatsapp className="text-sm" /> WhatsApp Inquiry
                </a>

                <a
                  href="tel:+919876543210"
                  className="py-2.5 px-4 bg-[#FAF6F0] hover:bg-[#6C2C12] text-[#6C2C12] hover:text-white border-2 border-[#EADFD4] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs cursor-pointer"
                >
                  <BsTelephone className="text-sm" /> Call Studio
                </a>
              </div>
            </div>

            {/* Delivery Promise Card */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#EADFD4] text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#6C2C12]">
                <BsTruck className="text-base text-[#F88897]" />
                <span>Complimentary Free Standard Shipping</span>
              </div>
              <p className="leading-relaxed">
                Packaged securely in plastic-free recyclable cartons with dried botanical accents. Order tracking provided upon dispatch.
              </p>
            </div>

            {/* Information Tabs */}
            <div className="pt-4 border-t border-[#F2ECE4]">
              <div className="flex border-b border-[#EADFD4] gap-6 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 shrink-0 ${
                    activeTab === "details"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                  }`}
                >
                  Care & Craft
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 shrink-0 ${
                    activeTab === "shipping"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                  }`}
                >
                  Shipping & Packaging
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 shrink-0 ${
                    activeTab === "reviews"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                  }`}
                >
                  Customer Reviews ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("custom")}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 shrink-0 ${
                    activeTab === "custom"
                      ? "border-[#6C2C12] text-[#6C2C12]"
                      : "border-transparent text-gray-400 hover:text-[#6C2C12]"
                  }`}
                >
                  Custom Requests
                </button>
              </div>

              <div className="py-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                {activeTab === "details" && (
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Gently hand-wash in cool water using mild yarn-friendly detergent.</li>
                    <li>Reshape and dry flat in the shade to preserve weave structure.</li>
                    <li>Avoid bleach, aggressive wringing, or machine tumble drying.</li>
                    <li>Every creation is 100% handmade and stitch-tension tested for durability.</li>
                  </ul>
                )}

                {activeTab === "shipping" && (
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Dispatches within 24–48 hours across India via verified couriers.</li>
                    <li>Standard Delivery takes 3–7 business days; Priority Express is 2–3 days.</li>
                    <li>Packaged in plastic-free sustainable craft boxes with twine and dried flowers.</li>
                    <li>Personalized gift messages and gift wrapping available at checkout.</li>
                  </ul>
                )}

                {activeTab === "custom" && (
                  <div className="space-y-3">
                    <p>
                      Looking for custom colors, larger sizes, or personalized monogram tags? Connect directly with our knitters on WhatsApp or specify in the order notes during checkout.
                    </p>
                    <Link
                      to="/contact"
                      className="inline-block text-xs font-bold text-[#6C2C12] underline"
                    >
                      Inquire About Custom Orders →
                    </Link>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl bg-[#FAF6F0]/60 border border-[#EADFD4] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#6C2C12] text-xs sm:text-sm">
                                {rev.name}
                              </span>
                              {rev.verified && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {rev.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {renderStars(rev.rating)}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Write a Review Form */}
                    <form
                      onSubmit={handleAddReview}
                      className="p-5 rounded-2xl bg-white border border-[#EADFD4] shadow-xs space-y-3"
                    >
                      <h4 className="font-bold text-[#6C2C12] text-xs sm:text-sm flex items-center gap-1.5">
                        <BsChatSquareHeart className="text-[#F88897]" /> Write a Review
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newReview.name}
                          onChange={(e) =>
                            setNewReview({ ...newReview, name: e.target.value })
                          }
                          placeholder="Your Name *"
                          required
                          className="px-3 py-2 rounded-lg border border-[#EADFD4] text-xs focus:outline-none focus:border-[#6C2C12]"
                        />

                        <select
                          value={newReview.rating}
                          onChange={(e) =>
                            setNewReview({ ...newReview, rating: e.target.value })
                          }
                          className="px-3 py-2 rounded-lg border border-[#EADFD4] text-xs focus:outline-none focus:border-[#6C2C12]"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 / 5 Stars)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 / 5 Stars)</option>
                          <option value={3}>⭐⭐⭐ (3 / 5 Stars)</option>
                          <option value={2}>⭐⭐ (2 / 5 Stars)</option>
                          <option value={1}>⭐ (1 / 5 Star)</option>
                        </select>
                      </div>

                      <textarea
                        rows={2}
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({ ...newReview, comment: e.target.value })
                        }
                        placeholder="Share your thoughts about this handcrafted item..."
                        required
                        className="w-full px-3 py-2 rounded-lg border border-[#EADFD4] text-xs focus:outline-none focus:border-[#6C2C12] resize-none"
                      />

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-2 bg-[#6C2C12] hover:bg-[#F88897] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Share Options */}
            <div className="pt-4 border-t border-[#F2ECE4] flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C2C12] flex items-center gap-1.5">
                <BsShare className="text-sm text-[#F88897]" /> Share Creation:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this handmade "${product.title}" on CozyLoops! ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#25D366]/30 shadow-2xs"
                  title="Share on WhatsApp"
                >
                  <BsWhatsapp className="text-sm" />
                </a>

                <a
                  href={settings?.socialLinks?.instagram || "https://www.instagram.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#E1306C]/30 shadow-2xs"
                  title="Instagram"
                >
                  <BsInstagram className="text-sm" />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this handmade "${product.title}" on CozyLoops!`
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-black/5 text-gray-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 border border-gray-300 shadow-2xs"
                  title="Twitter / X"
                >
                  <BsTwitterX className="text-xs" />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#1877F2]/30 shadow-2xs"
                  title="Facebook"
                >
                  <BsFacebook className="text-sm" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-20 pt-8 border-t border-[#EADFD4]">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[2px] text-[#F88897]">
                - More Handcrafted Treasures -
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#6C2C12] mt-1">
                You May Also Love
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-[#EADFD4] overflow-hidden group cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square w-full bg-[#FAF6F0] overflow-hidden relative">
                    <img
                      src={relProduct.img}
                      alt={relProduct.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/uploads/products/decor/sunflower.png";
                      }}
                    />
                    {relProduct.badge && (
                      <span className="absolute top-3 left-3 bg-[#F88897] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {relProduct.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C52] block mb-1">
                        {relProduct.category}
                      </span>
                      <h4 className="font-bold text-sm text-[#6C2C12] line-clamp-1 group-hover:text-[#F88897] transition-colors">
                        {relProduct.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F2ECE4]">
                      <span className="font-extrabold text-[#6C2C12] text-sm">
                        ₹{relProduct.price?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-[#F88897] group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
