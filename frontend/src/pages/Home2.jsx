import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import {
  BsStarFill,
  BsHeart,
  BsHeartFill,
  BsHandbag,
  BsEye,
  BsArrowsFullscreen,
  BsCheck2,
  BsCheckCircleFill,
  BsClockHistory,
  BsStars,
  BsShieldCheck,
  BsArrowRight,
  BsCopy,
  BsTruck,
  BsRecycle,
  BsAward,
  BsX,
  BsPlus,
  BsDash
} from "react-icons/bs";
import { getProducts, getBlogs, getProductGallery } from "../services/dataService";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import ImageLightbox from "../components/common/ImageLightbox";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const BOUTIQUE_SLIDERS = [
  {
    img: "/uploads/hero/slider-2.png",
    subTitle: "Modern Boutique Collection",
    badge: "Spring Batch 2026",
    titleFirst: "Soulful Crochet,",
    titleSecond: "Modern Living.",
    desc: "Clean contemporary aesthetics meet timeless hand-hooked warmth.\nDiscover our limited small-batch boutique creations.",
    primaryBtn: { text: "Shop The Batch", link: "#bestsellers" },
    secondaryBtn: { text: "Custom Orders", link: "/contact" }
  },
  {
    img: "/uploads/hero/slider-1.png",
    subTitle: "100% GOTS Organic Cotton",
    badge: "Zero Microplastics",
    titleFirst: "Pure Fibers,",
    titleSecond: "Lasting Comfort.",
    desc: "Lovingly crafted by hand using certified natural yarns,\nzero chemical dyes, and plastic-free packaging.",
    primaryBtn: { text: "Explore All Pieces", link: "/shop" },
    secondaryBtn: { text: "Our Story", link: "/about" }
  },
  {
    img: "/uploads/hero/slider-3.png",
    subTitle: "Handmade Desk & Home Flora",
    badge: "Never-Wilt Flora",
    titleFirst: "Desk Blooms That",
    titleSecond: "Never Fade.",
    desc: "Bring everlasting sunshine to your windowsill or workstation with our\nsignature hand-knitted botanical blooms.",
    primaryBtn: { text: "Shop Floral Decor", link: "/shop?category=Decor" },
    secondaryBtn: { text: "View Favorites", link: "#bestsellers" }
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.9,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const CATEGORY_TABS = [
  { id: "all", label: "All Pieces" },
  { id: "kids", label: "Plushies & Toys", query: "Kids" },
  { id: "decor", label: "Floral Decor", query: "Decor" },
  { id: "home", label: "Baskets & Living", query: "Home" },
  { id: "pet", label: "Pocket Companions", query: "Pet" }
];

const REVIEWS = [
  {
    id: 1,
    name: "Rhea Mehta",
    city: "Bangalore",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    product: "Sunburst Artisan Sunflower Bloom",
    comment:
      "I ordered this as a housewarming gift for my sister who can never keep indoor plants alive. She actually teared up! The weight and petal texture are so much nicer in person than photos can show. It sits happily on her sunny desk."
  },
  {
    id: 2,
    name: "David & Chloe",
    city: "Mumbai",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    product: "Amigurumi Bunny Keepsake",
    comment:
      "Our 18-month-old daughter hasn't let this bunny go since it arrived three months ago. It has survived spot cleans, tea spills, and bedtime cuddles without a single loose thread. Truly heirloom quality."
  },
  {
    id: 3,
    name: "Ananya Sharma",
    city: "Pune",
    role: "Verified Buyer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    product: "Hand-Knitted Cozy Beanie",
    comment:
      "The parcel was wrapped with brown kraft paper, tied with natural twine, and included a sprig of dried lavender with a handwritten note from Maya. You just don't get this level of care from regular retail brands anymore."
  }
];

const Home2 = () => {
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      return list.map((i) => i.id);
    } catch {
      return [];
    }
  });

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Natural Oatmeal");

  // Lightbox Modal
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Flash Deal Coupon Copy
  const [copied, setCopied] = useState(false);

  // Flash Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 48
  });

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Load Data
  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));

    getBlogs()
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data.slice(0, 3));
      })
      .catch((err) => console.error("Error loading blogs:", err));

    const handleProductsUpdated = () => {
      getProducts().then((data) => setProducts(data || []));
    };
    const handleWishlistUpdated = () => {
      try {
        const list = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlistIds(list.map((i) => i.id));
      } catch {
        setWishlistIds([]);
      }
    };

    window.addEventListener("productsUpdated", handleProductsUpdated);
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdated);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, []);

  // Flash deal countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 3, hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered Products for Bestsellers Grid
  const filteredBestsellers = useMemo(() => {
    if (!products.length) return [];
    if (activeTab === "all") return products.slice(0, 8);
    const tab = CATEGORY_TABS.find((t) => t.id === activeTab);
    if (!tab || !tab.query) return products.slice(0, 8);
    const matched = products.filter(
      (p) => p.category && p.category.toLowerCase().includes(tab.query.toLowerCase())
    );
    return matched.length ? matched.slice(0, 8) : products.slice(0, 8);
  }, [products, activeTab]);

  // Add to Cart handler
  const handleAddToCart = (product, quantity = 1, e) => {
    if (e) e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingIdx = cart.findIndex((i) => i.id === product.id);
      if (existingIdx > -1) {
        cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + quantity;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          img: product.img,
          category: product.category,
          quantity
        });
      }
      saveCart(cart);
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Added ${product.title} to your bag!`,
            type: "cart_add"
          }
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Wishlist handler
  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    try {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const exists = wishlist.some((i) => i.id === product.id);
      if (exists) {
        wishlist = wishlist.filter((i) => i.id !== product.id);
        saveWishlist(wishlist);
        setWishlistIds((prev) => prev.filter((id) => id !== product.id));
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: `Removed ${product.title} from wishlist.`,
              type: "wishlist_remove"
            }
          })
        );
      } else {
        wishlist.push({
          id: product.id,
          title: product.title,
          price: product.price,
          img: product.img,
          category: product.category
        });
        saveWishlist(wishlist);
        setWishlistIds((prev) => [...prev, product.id]);
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: `Saved ${product.title} to wishlist!`,
              type: "wishlist_add"
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Lightbox
  const handleOpenLightbox = (product, e) => {
    if (e) e.stopPropagation();
    const gallery = getProductGallery(product);
    setLightboxImages(gallery.length > 0 ? gallery : [product.img]);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  // Copy coupon code
  const handleCopyCoupon = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText("COZY15");
    }
    setCopied(true);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: "Voucher COZY15 copied to clipboard!",
          type: "cart_add"
        }
      })
    );
    setTimeout(() => setCopied(false), 2500);
  };

  // Newsletter submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: "Welcome to our craft circle! Check your inbox for your 10% welcome voucher.",
          type: "cart_add"
        }
      })
    );
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#4A2B1D]">
      {/* Top Quiet Craft Notice */}
      <div className="bg-[#FAF0E8] border-b border-[#EADFD4] px-4 py-2 text-center text-xs font-semibold text-[#6C2C12] flex items-center justify-center gap-1.5">
        <BsStars className="text-[#F88897] text-xs shrink-0" />
        <span>Every piece is lovingly hand-hooked with 100% natural organic cotton · Free shipping over ₹999</span>
      </div>

      {/* 1. HERO SLIDER SECTION (Like Home-1 Page) */}
      <section className="overflow-hidden">
        <Swiper
          className="hero-swiper"
          modules={[Autoplay, Pagination, EffectFade]}
          loop={true}
          effect="fade"
          speed={2000}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
        >
          {BOUTIQUE_SLIDERS.map((slider, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => (
                <div className="relative h-150 overflow-hidden sm:h-162.5 md:h-175 lg:h-170 bg-[#faf5f0]">
                  {/* Animated Background Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center w-full h-full"
                    style={{
                      backgroundImage: `url(${slider.img})`,
                    }}
                    initial={
                      index === 0
                        ? { opacity: 0, scale: 1.08 }
                        : index === 1
                        ? { y: "-100%" }
                        : { x: "100%" }
                    }
                    animate={
                      isActive
                        ? (index === 0
                            ? { opacity: 1, scale: 1 }
                            : index === 1
                            ? { y: 0 }
                            : { x: 0 })
                        : (index === 0
                            ? { opacity: 0, scale: 1.08 }
                            : index === 1
                            ? { y: "-100%" }
                            : { x: "100%" })
                    }
                    transition={{
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />

                  {/* Hero Content */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                    className="absolute left-5 top-1/2 w-[calc(100%-40px)] -translate-y-1/2 sm:left-10 sm:w-125 md:left-[12%] md:w-137.5
                        lg:left-[25%] lg:-translate-x-1/2 z-10 text-left"
                  >
                    {/* Badge & Subtitle */}
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#EADFD4] text-xs font-bold text-[#6C2C12]">
                        <BsStars className="text-[#F88897] text-xs" />
                        <span>{slider.badge}</span>
                      </span>
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#6C2C12]">
                        {slider.subTitle}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      variants={itemVariants}
                      className="my-2 text-4xl font-bold leading-tight sm:my-3 sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-[1.15] lg:leading-15"
                    >
                      <span className="text-[#6C2C12]">
                        {slider.titleFirst}
                      </span>
                      <br />
                      <span className="text-[#F88897]">
                        {slider.titleSecond}
                      </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      variants={itemVariants}
                      className="whitespace-pre-line text-sm leading-6 sm:text-base sm:leading-7 md:text-lg lg:text-xl text-gray-700"
                    >
                      {slider.desc}
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                      variants={itemVariants}
                      className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-5"
                    >
                      <a
                        href={slider.primaryBtn.link}
                        className="w-full sm:w-auto"
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold
                            uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto shadow-xs"
                        >
                          {slider.primaryBtn.text}
                        </motion.button>
                      </a>

                      <Link
                        to={slider.secondaryBtn.link}
                        className="w-full sm:w-auto"
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full cursor-pointer rounded-sm border-2 border-[#F88897] bg-[#F88897] px-6 py-3 text-sm font-semibold
                            uppercase text-white transition-all duration-300 hover:bg-[#6C2C12] hover:border-[#6C2C12] sm:w-auto shadow-xs"
                        >
                          {slider.secondaryBtn.text}
                        </motion.button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. PERKS: 4 Warm Studio Promises */}
      <section className="bg-white border-b border-[#EADFD4] py-7 sm:py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center shrink-0">
                <BsAward className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#6C2C12]">Every Loop by Hand</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">No factory looms. Pure yarn and skilled fingers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center shrink-0">
                <BsTruck className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#6C2C12]">Free Shipping Over ₹999</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Wrapped with kraft twine & dried lavender.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center shrink-0">
                <BsRecycle className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#6C2C12]">Zero Plastic Fibers</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">100% biodegradable natural cotton & wool.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center shrink-0">
                <BsShieldCheck className="text-lg" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#6C2C12]">Free Lifetime Mending</h4>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Snag a loop? Send it back and we'll fix it for free.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO CATEGORIES: Visual Curated Tiles */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#F88897] uppercase tracking-widest">
            Explore By Craft
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            What Would You Like to Bring Home?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Browse our small studio categories designed for baby nurseries, desk greenery, and mindful everyday comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-[240px] sm:auto-rows-[280px]">
          {/* Card 1: Large Amigurumi Nursery Friends */}
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden shadow-md group border border-[#EADFD4] bg-[#F7EFE7]">
            <img
              src="/uploads/others/contact_bunny.jpg"
              alt="Amigurumi Nursery Toys"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white text-left">
              <span className="px-3 py-1 rounded-full bg-[#F88897] text-white text-xs font-bold uppercase w-fit mb-2">
                18 Handcrafted Plushies
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Amigurumi Friends & Keepsakes
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-md mt-1 mb-4">
                Hypoallergenic cotton fill, child-safe locking eyes, and irresistibly sweet designs made to be cuddled for years.
              </p>
              <Link
                to="/shop?category=Kids"
                className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-white hover:text-[#F88897] transition-colors w-fit"
              >
                <span>Browse Nursery Friends</span>
                <BsArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: Botanical Blooms */}
          <div className="md:col-span-1 lg:col-span-2 relative rounded-3xl overflow-hidden shadow-md group border border-[#EADFD4] bg-[#FBF2E9]">
            <img
              src="/uploads/others/contact_flowers.jpg"
              alt="Botanical Blooms"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6 text-white text-left">
              <span className="text-xs font-bold text-[#F88897] uppercase">Never-Wilt Flora</span>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight mt-0.5 mb-2">
                Desk Blooms & Floral Pots
              </h3>
              <Link
                to="/shop?category=Decor"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-white hover:text-[#F88897] transition-colors"
              >
                <span>Explore Blooms</span>
                <BsArrowRight className="text-xs" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cozy Wearables */}
          <div className="relative rounded-3xl overflow-hidden shadow-md group border border-[#EADFD4] bg-[#F4EBE1]">
            <img
              src="/uploads/products/kids/hat.png"
              alt="Wearables & Beanies"
              className="w-full h-full object-contain p-6 bg-white/40 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A2B1D]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white text-left">
              <span className="text-[10px] font-bold text-[#F88897] uppercase">Soft Merino</span>
              <h4 className="text-base font-bold">Wearables & Hats</h4>
              <Link
                to="/shop?category=Decor"
                className="text-xs text-white/90 hover:text-[#F88897] font-semibold mt-1 inline-flex items-center gap-1"
              >
                <span>Browse</span> <BsArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

          {/* Card 4: Heirloom Baskets */}
          <div className="relative rounded-3xl overflow-hidden shadow-md group border border-[#EADFD4] bg-[#FDF5ED]">
            <img
              src="/uploads/others/contact_hearts_basket.jpg"
              alt="Home Living & Baskets"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5 text-white text-left">
              <span className="text-[10px] font-bold text-[#F88897] uppercase">Slow Hearth</span>
              <h4 className="text-base font-bold">Baskets & Coasters</h4>
              <Link
                to="/shop?category=Home"
                className="text-xs text-white/90 hover:text-[#F88897] font-semibold mt-1 inline-flex items-center gap-1"
              >
                <span>Browse</span> <BsArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED BESTSELLERS GRID */}
      <section id="bestsellers" className="py-16 bg-white border-y border-[#EADFD4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="text-left space-y-1">
              <span className="text-xs font-bold text-[#F88897] uppercase tracking-wider">
                From Our Workbenches
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
                Trending Studio Favorites
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Each piece is meticulously hooked in limited runs. If out of stock, pre-orders take 4 to 6 business days.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#6C2C12] text-white shadow-xs"
                        : "bg-[#FAF7F2] text-[#6C2C12] hover:bg-[#FAF0E8] border border-[#EADFD4]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBestsellers.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EADFD4] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Top Bar on Card */}
                  <div className="flex items-center justify-between z-10 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#6C2C12] border border-[#EADFD4]">
                      {product.category || "Handmade"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`p-2 rounded-full shadow-xs transition-transform active:scale-90 cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-50 text-rose-500"
                          : "bg-white text-gray-400 hover:text-rose-500"
                      }`}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isWishlisted ? <BsHeartFill className="text-xs" /> : <BsHeart className="text-xs" />}
                    </button>
                  </div>

                  {/* Image with quick actions */}
                  <div className="relative aspect-square w-full rounded-xl bg-white overflow-hidden flex items-center justify-center p-3 mb-4">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickViewProduct(product);
                          setModalQty(1);
                        }}
                        className="p-2.5 rounded-full bg-white text-[#6C2C12] hover:bg-[#F88897] hover:text-white transition-colors shadow-md cursor-pointer"
                        title="Quick View"
                      >
                        <BsEye className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenLightbox(product, e)}
                        className="p-2.5 rounded-full bg-white text-[#6C2C12] hover:bg-[#F88897] hover:text-white transition-colors shadow-md cursor-pointer"
                        title="Zoom Image"
                      >
                        <BsArrowsFullscreen className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="text-left space-y-2">
                    <div className="flex items-center gap-1 text-[#F88897]">
                      <BsStarFill className="text-[10px]" />
                      <span className="text-xs font-bold text-[#6C2C12]">
                        {product.rating || "4.9"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({product.reviewsCount || 28})
                      </span>
                    </div>

                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-sm text-[#6C2C12] hover:text-[#F88897] transition-colors line-clamp-1 block"
                    >
                      {product.title}
                    </Link>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EADFD4]">
                      <span className="text-base font-extrabold text-[#6C2C12]">
                        ₹{product.price?.toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, 1, e)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <BsHandbag className="text-xs" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#6C2C12] text-white font-bold text-xs sm:text-sm hover:bg-[#F88897] transition-all shadow-md group"
            >
              <span>Explore All Handcrafted Pieces</span>
              <BsArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. THE WEEKLY FRIDAY STUDIO DROP */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-r from-[#6C2C12] via-[#7E3517] to-[#6C2C12] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Drop Left */}
            <div className="lg:col-span-7 text-left space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F88897] text-xs font-bold uppercase tracking-wider border border-white/20">
                <BsClockHistory /> The Weekly Friday Drop
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Small-Batch Studio Releases
              </h2>

              <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed">
                Because every single row is hooked by human hands, our knitters only release 25 to 30 completed creations every Friday. Once a batch finds a home, the next one takes a full week of patient handcrafting.
              </p>

              {/* Countdown Ticker */}
              <div className="grid grid-cols-4 gap-3 max-w-sm pt-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/15">
                  <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</div>
                  <div className="text-[10px] uppercase font-bold text-white/60">Days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/15">
                  <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours}</div>
                  <div className="text-[10px] uppercase font-bold text-white/60">Hours</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/15">
                  <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.minutes}</div>
                  <div className="text-[10px] uppercase font-bold text-white/60">Mins</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/15">
                  <div className="text-xl sm:text-2xl font-black text-[#F88897]">{timeLeft.seconds}</div>
                  <div className="text-[10px] uppercase font-bold text-white/60">Secs</div>
                </div>
              </div>
            </div>

            {/* Drop Right: Voucher Tag */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#6C2C12] text-left shadow-2xl border-2 border-dashed border-[#D8C2B0] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F88897] uppercase tracking-wider">
                    Welcome Gift
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0E8] text-[#6C2C12]">
                    First Order Perk
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black">
                  Enjoy 15% Off Your First Piece
                </h3>
                <p className="text-xs text-gray-600">
                  Experience the warmth of real handmade craft in your home with this special introductory voucher.
                </p>

                {/* Coupon Code Pill */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#6C2C12]/20">
                  <div className="font-mono font-black text-lg text-[#6C2C12] tracking-wider pl-2">
                    COZY15
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="px-4 py-2 rounded-xl bg-[#6C2C12] text-white hover:bg-[#F88897] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <BsCheck2 className="text-sm font-bold text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <BsCopy className="text-xs" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <Link
                  to="/shop"
                  className="w-full py-3.5 rounded-xl bg-[#F88897] hover:bg-[#e26d7c] text-white font-bold text-xs uppercase tracking-wider text-center block shadow-md transition-colors"
                >
                  Shop This Week's Batch →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT OUR COMMUNITY IS SAYING */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#F88897] uppercase tracking-widest">
            Loved By Crafters
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            Stories From Real Homes
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Real notes from customers who chose mindful handcraft over mass factory decor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADFD4] shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#F88897]">
                  {[...Array(review.rating)].map((_, i) => (
                    <BsStarFill key={i} className="text-xs" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#FAF0E8] flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#EADFD4]"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#6C2C12] flex items-center gap-1.5">
                    {review.name}
                    <BsCheckCircleFill className="text-[#F88897] text-xs" title="Verified Order" />
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    {review.city} · Purchased <span className="font-semibold text-gray-600">{review.product}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CRAFT & CARE GUIDES (JOURNAL) */}
      <section className="py-16 bg-white border-t border-[#EADFD4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-left">
            <div>
              <span className="text-xs font-bold text-[#F88897] uppercase tracking-wider">
                From The Workbench
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
                Care Guides & Pattern Stories
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors flex items-center gap-1.5"
            >
              <span>Explore All Guides</span>
              <BsArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.length > 0 ? (
              blogs.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#EADFD4] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={b.image || "/uploads/hero/shop-hero.jpg"}
                      alt={b.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 text-[10px] font-bold text-[#6C2C12] shadow-xs">
                      {b.category || "Care Guide"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-[11px] text-gray-500 font-semibold">
                        {b.date || "March 2026"} · {b.readTime || "4 min read"}
                      </div>
                      <Link
                        to={`/blog/${b.id}`}
                        className="font-bold text-base text-[#6C2C12] hover:text-[#F88897] transition-colors line-clamp-2 block leading-snug"
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {b.excerpt || b.content}
                      </p>
                    </div>

                    <Link
                      to={`/blog/${b.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F88897] hover:text-[#6C2C12] transition-colors mt-4"
                    >
                      <span>Read Guide</span>
                      <BsArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 col-span-3 text-center py-6">
                Journal articles loading...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="py-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="bg-[#FAF0E8] rounded-3xl p-8 sm:p-12 border-2 border-dashed border-[#D8C2B0] text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-white text-[#F88897] text-xs font-bold uppercase tracking-wider border border-[#EADFD4] inline-block">
            Our Quiet Craft Letter
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            Join Our Handcrafted Circle
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            No daily marketing blasts. Just a monthly letter with free downloadable pattern charts, yarn experiments, and early access to Friday drops.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <BsCheckCircleFill className="text-base text-emerald-600" />
              <span>Thank you! Your 10% welcome voucher has been sent to your email.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full sm:flex-1 px-4 py-3 rounded-full bg-white border border-[#EADFD4] text-xs text-[#6C2C12] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Join Free
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400">
            We respect your inbox. Unsubscribe at any time with one click.
          </p>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EADFD4] overflow-hidden text-left"
            >
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <BsX className="text-xl" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Image */}
                <div className="aspect-square rounded-2xl bg-[#FAF7F2] p-4 flex items-center justify-center relative">
                  <img
                    src={quickViewProduct.img}
                    alt={quickViewProduct.title}
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleOpenLightbox(quickViewProduct, e)}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-white shadow text-[#6C2C12] hover:text-[#F88897] cursor-pointer"
                    title="Zoom Image"
                  >
                    <BsArrowsFullscreen className="text-xs" />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F88897] px-2 py-0.5 rounded bg-[#FAF0E8]">
                    {quickViewProduct.category || "Handcrafted"}
                  </span>

                  <h3 className="text-xl font-bold text-[#6C2C12]">
                    {quickViewProduct.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[#F88897]">
                    {[...Array(5)].map((_, i) => (
                      <BsStarFill key={i} className="text-xs" />
                    ))}
                    <span className="text-xs font-bold text-[#6C2C12] ml-1">
                      {quickViewProduct.rating || "4.9"}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-[#6C2C12]">
                    ₹{quickViewProduct.price?.toLocaleString()}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {quickViewProduct.description ||
                      "Each loop is handcrafted with certified natural cotton and zero harmful chemical dyes. Durable and soft."}
                  </p>

                  {/* Color Selector */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-[#6C2C12] block mb-1.5">
                      Artisan Yarn Shade: <span className="font-normal text-gray-500">{selectedColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {["Natural Oatmeal", "Blush Pink", "Sage Olive"].map((shade) => (
                        <button
                          key={shade}
                          type="button"
                          onClick={() => setSelectedColor(shade)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            selectedColor === shade
                              ? "border-[#6C2C12] bg-[#FAF3EB] text-[#6C2C12]"
                              : "border-[#EADFD4] text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {shade}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="pt-3 flex items-center gap-3">
                    <div className="flex items-center border border-[#EADFD4] rounded-xl bg-[#FAF7F2] p-1">
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        className="p-1.5 hover:text-[#F88897] transition-colors cursor-pointer"
                      >
                        <BsDash className="text-sm" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#6C2C12]">
                        {modalQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => q + 1)}
                        className="p-1.5 hover:text-[#F88897] transition-colors cursor-pointer"
                      >
                        <BsPlus className="text-sm" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        handleAddToCart(quickViewProduct, modalQty, e);
                        setQuickViewProduct(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BsHandbag className="text-xs" />
                      <span>Add to Bag</span>
                    </button>
                  </div>

                  <Link
                    to={`/product/${quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="block text-center text-xs font-semibold text-[#6C2C12] hover:text-[#F88897] transition-colors pt-1"
                  >
                    View Full Product Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title="Artisan Showcase Gallery"
      />
    </div>
  );
};

export default Home2;
