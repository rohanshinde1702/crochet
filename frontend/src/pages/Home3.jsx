import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import {
  BsHeart,
  BsHeartFill,
  BsHandbag,
  BsCheckCircleFill,
  BsPlayCircleFill,
  BsX,
  BsArrowRight,
  BsChevronDown,
  BsFeather,
  BsFlower1,
  BsHouseHeart,
  BsPersonHeart,
  BsShieldCheck,
  BsInstagram
} from "react-icons/bs";
import { getProducts } from "../services/dataService";
import { saveCart, saveWishlist } from "../utils/syncHelper";
import ImageLightbox from "../components/common/ImageLightbox";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const STUDIO_SLIDERS = [
  {
    img: "/uploads/hero/slider-3.png",
    subTitle: "Slow Craft Studio & Workshop",
    badge: "Made By Human Hands",
    titleFirst: "Quiet Afternoons,",
    titleSecond: "Patient Stitches.",
    desc: "CozyLoops is a quiet gathering of independent home knitters.\nEvery single loop is guided by human fingers — never a machine.",
    primaryBtn: { text: "Browse Lookbook", link: "#lookbook", isAnchor: true },
    secondaryBtn: { text: "Watch Studio Film", action: "video" }
  },
  {
    img: "/uploads/hero/slider-2.png",
    subTitle: "Heirloom Nursery Collection",
    badge: "GOTS Organic Fibers",
    titleFirst: "Gentle Cuddles For",
    titleSecond: "Little Hands.",
    desc: "Hypoallergenic wool, safety-locked eyes, and heirloom plushies\ncrafted for delicate baby cheeks and tender bedtime snuggles.",
    primaryBtn: { text: "Explore Nursery", link: "/shop?category=Kids", isAnchor: false },
    secondaryBtn: { text: "Our Commitments", link: "#commitments", isAnchor: true }
  },
  {
    img: "/uploads/hero/slider-1.png",
    subTitle: "The Artisan Cooperative",
    badge: "Kitchen Table Collective",
    titleFirst: "Crafted With Care At",
    titleSecond: "Kitchen Tables.",
    desc: "Empowering independent women artisans across the valley.\nFair living wages, plastic-free packaging, and timeless heirloom warmth.",
    primaryBtn: { text: "Meet Our Makers", link: "#artisan-story", isAnchor: true },
    secondaryBtn: { text: "Visit Our Shop", link: "/shop", isAnchor: false }
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

const LOOKBOOK_COLLECTIONS = [
  {
    id: "nursery",
    title: "The Sunny Nursery",
    subtitle: "Hypoallergenic wool, safety-locked eyes, and heirloom plushies crafted for delicate baby hands.",
    lifestyleImg: "/uploads/others/contact_bunny.jpg",
    hotspots: [
      { id: "h1", top: "42%", left: "48%", title: "Amigurumi Bunny Keepsake", price: "₹999", productId: 6 },
      { id: "h2", top: "72%", left: "30%", title: "Organic Merino Baby Bonnet", price: "₹699", productId: 2 }
    ],
    productIds: [6, 2, 8]
  },
  {
    id: "botanical",
    title: "The Plant Lover's Desk",
    subtitle: "Everlasting hand-hooked sunflowers, wild daisies, and potted greens that never drop a petal.",
    lifestyleImg: "/uploads/others/contact_flowers.jpg",
    hotspots: [
      { id: "h3", top: "35%", left: "55%", title: "Sunburst Artisan Sunflower", price: "₹899", productId: 1 },
      { id: "h4", top: "65%", left: "40%", title: "Floral Keepsake Charm", price: "₹349", productId: 15 }
    ],
    productIds: [1, 15, 14]
  },
  {
    id: "living",
    title: "The Cozy Reading Corner",
    subtitle: "Chunky ribbed cotton baskets, thick coasters, and warm table accents hand-woven with recycled cord.",
    lifestyleImg: "/uploads/others/contact_hearts_basket.jpg",
    hotspots: [
      { id: "h5", top: "50%", left: "50%", title: "Heirloom Hearts Woven Basket", price: "₹1,199", productId: 11 },
      { id: "h6", top: "25%", left: "68%", title: "Cozy Cotton Coaster Set", price: "₹499", productId: 4 }
    ],
    productIds: [11, 4, 18]
  }
];

const COMMUNITY_PHOTOS = [
  {
    id: 1,
    img: "/uploads/others/contact_bunny.jpg",
    author: "@tanvi_reads",
    caption: "Bunny found its permanent spot next to the bedtime story stack.",
    tag: "Nursery Corner"
  },
  {
    id: 2,
    img: "/uploads/others/contact_flowers.jpg",
    author: "@botanical_cozy",
    caption: "Never needing to water this sunflower on my windowsill is pure joy.",
    tag: "Desk Flora"
  },
  {
    id: 3,
    img: "/uploads/others/contact_hearts_basket.jpg",
    author: "@the_cozy_hearth",
    caption: "The texture on this cotton basket is unbelievable in person.",
    tag: "Living Room"
  },
  {
    id: 4,
    img: "/uploads/hero/shop-hero.jpg",
    author: "@monsoon_tea",
    caption: "Warm tea, quiet rain outside, and soft handmade crochet at home.",
    tag: "Quiet Moments"
  },
  {
    id: 5,
    img: "/uploads/others/ourStory.png",
    author: "@slow_living_diary",
    caption: "Opening a CozyLoops parcel feels like receiving a gift from an old friend.",
    tag: "Maker Mail"
  },
  {
    id: 6,
    img: "/uploads/others/madeByHand.png",
    author: "@maya_knits",
    caption: "Blocking finished blankets at our wooden workshop table.",
    tag: "Workbench"
  }
];

const FAQS = [
  {
    question: "How do I wash my crochet piece without ruining it?",
    answer:
      "Hand washing is always best! Submerge your piece in cool or lukewarm water with a drop of gentle wool detergent or baby shampoo. Gently press the water through without wringing or twisting. Roll it inside a clean towel to soak up excess moisture, then lay it flat on a dry towel in the shade to dry."
  },
  {
    question: "Can I request custom colors, dimensions, or embroidered names?",
    answer:
      "Yes, absolutely! Over a third of our pieces are custom-made. Send us a message on our Contact page with your nursery color palette or the baby's initials, and Maya will personally reply with yarn swatch photos before we begin hooking."
  },
  {
    question: "Are your toys and blankets truly safe for newborn babies?",
    answer:
      "Yes. We take safety very seriously. We use 100% GOTS certified organic cotton yarns and non-mulesed wool with zero harsh chemical dyes. Amigurumi eyes are locked with internal safety washers, and our stuffing is clean, hypoallergenic cotton scraps."
  },
  {
    question: "How long does a handcrafted order take to reach me?",
    answer:
      "In-stock pieces from our weekly Friday batch ship within 24 to 48 hours. Custom orders typically take between 4 to 6 business days for our knitters to hand-make, after which express courier takes 2 to 3 days."
  }
];

const Home3 = () => {
  const [products, setProducts] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState("nursery");
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("wishlist")) || [];
      return list.map((i) => i.id);
    } catch {
      return [];
    }
  });

  // Modals state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Lightbox
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Newsletter
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Load products
  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));

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

  // Active Lookbook Collection data
  const currentCollection = useMemo(() => {
    return (
      LOOKBOOK_COLLECTIONS.find((c) => c.id === activeCollectionId) ||
      LOOKBOOK_COLLECTIONS[0]
    );
  }, [activeCollectionId]);

  // Products belonging to the active collection
  const collectionProducts = useMemo(() => {
    if (!products.length) return [];
    const matched = products.filter((p) =>
      currentCollection.productIds.includes(p.id)
    );
    return matched.length ? matched : products.slice(0, 3);
  }, [products, currentCollection]);

  // Cart helper
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

  // Wishlist toggle
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

  // Open Lightbox for product or community photo
  const handleOpenLightbox = (imgSrcList, startIndex = 0, e) => {
    if (e) e.stopPropagation();
    setLightboxImages(imgSrcList);
    setLightboxIndex(startIndex);
    setIsLightboxOpen(true);
  };

  // Newsletter submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: "Welcome to our craft circle! Check your email for your free pattern guide.",
          type: "cart_add"
        }
      })
    );
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#4A2B1D]">
      {/* Top Banner Notice */}
      <div className="bg-[#FAF0E8] border-b border-[#EADFD4] px-4 py-2 text-center text-xs font-semibold text-[#6C2C12] flex items-center justify-center gap-1.5">
        <BsFeather className="text-[#F88897] text-xs shrink-0" />
        <span>Notes from the workbench · Handcrafted at kitchen tables with pure wool & cotton</span>
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
          {STUDIO_SLIDERS.map((slider, index) => (
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
                        <BsFeather className="text-[#F88897] text-xs" />
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
                      {slider.primaryBtn.isAnchor ? (
                        <a
                          href={slider.primaryBtn.link}
                          className="w-full sm:w-auto"
                        >
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold
                              uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto shadow-xs flex items-center justify-center gap-2"
                          >
                            <span>{slider.primaryBtn.text}</span>
                            <BsArrowRight className="text-xs" />
                          </motion.button>
                        </a>
                      ) : (
                        <Link
                          to={slider.primaryBtn.link}
                          className="w-full sm:w-auto"
                        >
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold
                              uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto shadow-xs flex items-center justify-center gap-2"
                          >
                            <span>{slider.primaryBtn.text}</span>
                            <BsArrowRight className="text-xs" />
                          </motion.button>
                        </Link>
                      )}

                      {slider.secondaryBtn.action === "video" ? (
                        <motion.button
                          type="button"
                          onClick={() => setIsVideoModalOpen(true)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full cursor-pointer rounded-sm border-2 border-[#F88897] bg-[#F88897] px-6 py-3 text-sm font-semibold
                            uppercase text-white transition-all duration-300 hover:bg-[#6C2C12] hover:border-[#6C2C12] sm:w-auto shadow-xs flex items-center justify-center gap-2"
                        >
                          <BsPlayCircleFill className="text-base" />
                          <span>{slider.secondaryBtn.text}</span>
                        </motion.button>
                      ) : slider.secondaryBtn.isAnchor ? (
                        <a
                          href={slider.secondaryBtn.link}
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
                        </a>
                      ) : (
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
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. THE 4 COMMITMENTS AT THE WORKBENCH */}
      <section id="commitments" className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-[#F88897] uppercase tracking-widest">
            Our Maker Commitments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            How We Work at the Workbench
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Four quiet promises that shape every skein, stitch, and parcel leaving our hands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-[#EADFD4] text-left space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center text-2xl font-bold">
              <BsFlower1 />
            </div>
            <h3 className="font-extrabold text-base text-[#6C2C12]">
              Pure Natural Fibers
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Zero scratchy polyester or acrylic blends. We only use certified organic cotton, botanical dyes, and gentle merino wool safe for baby cheeks.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-[#EADFD4] text-left space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center text-2xl font-bold">
              <BsHouseHeart />
            </div>
            <h3 className="font-extrabold text-base text-[#6C2C12]">
              No Scraps Left Behind
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Nothing goes to waste. Every single yarn clipping from our projects is saved and repurposed as cloud-soft stuffing inside our amigurumi plushes.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-[#EADFD4] text-left space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center text-2xl font-bold">
              <BsShieldCheck />
            </div>
            <h3 className="font-extrabold text-base text-[#6C2C12]">
              Double-Reinforced Seams
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We double-knot and reinforce every color transition so our blankets and toys survive toddler tugs, car rides, and decades of gentle washes.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-[#EADFD4] text-left space-y-3 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E8] text-[#F88897] flex items-center justify-center text-2xl font-bold">
              <BsPersonHeart />
            </div>
            <h3 className="font-extrabold text-base text-[#6C2C12]">
              Fair Wages & Calm Hours
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our 12 independent women knitters work in the comfort of their own homes at their own natural pace, earning honest, dignified living wages.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE STUDIO LOOKBOOK (ROOM STYLING) */}
      <section id="lookbook" className="py-16 sm:py-20 bg-white border-y border-[#EADFD4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#F88897] uppercase tracking-wider">
                Interactive Studio Lookbook
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
                Styled in Cozy Nooks
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
                Hover or click on the glowing pins in the photo to discover the exact handcrafted pieces styled in real home corners.
              </p>
            </div>

            {/* Collection Switchers */}
            <div className="flex flex-wrap items-center gap-2">
              {LOOKBOOK_COLLECTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCollectionId(c.id);
                    setActiveHotspot(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCollectionId === c.id
                      ? "bg-[#6C2C12] text-white shadow-xs"
                      : "bg-[#FAF7F2] text-[#6C2C12] hover:bg-[#FAF0E8] border border-[#EADFD4]"
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Lookbook Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Lifestyle Photo with Interactive Pins */}
            <div className="lg:col-span-7 relative rounded-3xl overflow-hidden shadow-lg border border-[#EADFD4] bg-[#FAF3EB] aspect-4/3 sm:aspect-16/10">
              <img
                src={currentCollection.lifestyleImg}
                alt={currentCollection.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />

              {/* Hotspot Pins */}
              {currentCollection.hotspots.map((h) => {
                const isSelected = activeHotspot?.id === h.id;
                return (
                  <div
                    key={h.id}
                    style={{ top: h.top, left: h.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(isSelected ? null : h)}
                      className="relative flex items-center justify-center cursor-pointer group"
                      title={h.title}
                    >
                      <span className="absolute w-8 h-8 rounded-full bg-[#F88897]/50 animate-ping" />
                      <span className="w-7 h-7 rounded-full bg-[#6C2C12] border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md group-hover:bg-[#F88897] transition-colors">
                        +
                      </span>
                    </button>

                    {/* Popover Card */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white rounded-xl shadow-xl p-3 border border-[#EADFD4] text-left z-30"
                        >
                          <div className="font-bold text-xs text-[#6C2C12] line-clamp-1">
                            {h.title}
                          </div>
                          <div className="text-xs font-extrabold text-[#F88897] mt-0.5">
                            {h.price}
                          </div>
                          <Link
                            to={`/product/${h.productId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6C2C12] hover:text-[#F88897] mt-2"
                          >
                            <span>View Creation</span>
                            <BsArrowRight className="text-[9px]" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#EADFD4] text-left">
                <h4 className="font-bold text-sm text-[#6C2C12]">
                  {currentCollection.title}
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {currentCollection.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Featured Pieces in this Lookbook */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-left mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Pieces in this setting ({collectionProducts.length})
                </span>
              </div>

              {collectionProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADFD4] hover:shadow-md transition-all flex items-center gap-4 text-left group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center overflow-hidden border border-[#EADFD4]">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#F88897]">
                        {product.category || "Handcrafted"}
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="font-bold text-xs sm:text-sm text-[#6C2C12] hover:text-[#F88897] line-clamp-1 block transition-colors"
                      >
                        {product.title}
                      </Link>
                      <div className="text-sm font-extrabold text-[#6C2C12]">
                        ₹{product.price?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, 1, e)}
                        className="p-2.5 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white transition-colors cursor-pointer shadow-xs"
                        title="Add to Bag"
                      >
                        <BsHandbag className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className={`p-2.5 rounded-xl bg-white border border-[#EADFD4] transition-colors cursor-pointer ${
                          isWishlisted ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
                        }`}
                        title="Wishlist"
                      >
                        {isWishlisted ? <BsHeartFill className="text-xs" /> : <BsHeart className="text-xs" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <Link
                to="/shop"
                className="w-full py-3.5 rounded-2xl bg-white border border-[#EADFD4] text-[#6C2C12] hover:bg-[#FAF3EB] font-bold text-xs block text-center transition-colors shadow-xs"
              >
                <span className="inline-flex items-center gap-1.5 justify-center">
                  <span>Browse Entire Catalog</span>
                  <BsArrowRight className="text-xs" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET THE MAKER: Maya & The Knitting Circle */}
      <section id="artisan-story" className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Maker Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-dashed border-[#D8C2B0] bg-[#F2E7DC] max-w-md mx-auto aspect-4/5">
              <img
                src="/uploads/others/maker.png"
                alt="Maya, Lead Artisan & Founder"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A2B1D]/85 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left">
                <span className="text-xs font-bold text-[#F88897] uppercase">Lead Artisan & Founder</span>
                <h3 className="text-xl font-bold">Maya Sharma</h3>
                <p className="text-xs text-white/80">"Every loop is an invitation to slow down and breathe."</p>
              </div>
            </div>
          </div>

          {/* Story Narrative */}
          <div className="lg:col-span-7 text-left space-y-5">
            <span className="text-xs font-bold text-[#F88897] uppercase tracking-widest">
              From Our Kitchen Table
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12] leading-tight">
              A Quiet Rebellion Against Mass-Produced Decor
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed">
              I learned to crochet when I was seven, sitting beside my grandmother on the porch on rainy monsoon afternoons. What began as gifting small beanies to newborn cousins has grown into a small collective of 12 women across the valley who find peace and financial independence in the rhythm of the stitch.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed">
              When you welcome a CozyLoops creation into your home, you are not receiving a factory-stamped object. You are holding hours of quiet, patient work, made by someone whose handwritten name is signed on your parcel tag.
            </p>

            {/* Signature & Metrics */}
            <div className="pt-4 border-t border-[#EADFD4] flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="font-serif italic text-2xl text-[#6C2C12] font-semibold">
                  Maya & The Craft Circle
                </div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wider">
                  Handmade in Small Batches
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-black text-[#6C2C12]">12</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Home Knitters</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#6C2C12]">100%</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Organic Cotton</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F88897]">0%</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Factory Machines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY INSTAGRAM & LIVING GALLERY */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#EADFD4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-12 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F88897] uppercase tracking-wider">
              <BsInstagram /> #CozyLoopsAtHome
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
              Crafted By Us, Styled in Your Sanctuaries
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Click any photo to zoom in our community gallery lightbox.
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {COMMUNITY_PHOTOS.map((item, idx) => (
              <div
                key={item.id}
                onClick={(e) =>
                  handleOpenLightbox(
                    COMMUNITY_PHOTOS.map((p) => p.img),
                    idx,
                    e
                  )
                }
                className="relative rounded-2xl overflow-hidden aspect-square bg-[#FAF6F0] border border-[#EADFD4] group cursor-pointer shadow-xs hover:shadow-md transition-all"
              >
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white text-left">
                  <span className="text-[10px] font-bold text-[#F88897] flex items-center gap-1">
                    <BsInstagram className="text-[9px]" />
                    <span>{item.author}</span>
                  </span>
                  <p className="text-[10px] text-white/90 line-clamp-2 leading-tight mt-0.5">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HONEST CRAFT QUESTIONS (FAQ) */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-5 sm:px-8 text-left">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-[#F88897] uppercase tracking-widest">
            Care & Crafting
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            Questions You Might Have
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#EADFD4] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left text-sm sm:text-base font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <BsChevronDown
                    className={`text-xs transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#F88897]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-[#FAF3EB] pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. SLOW CRAFT LETTER NEWSLETTER */}
      <section className="py-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="bg-[#FAF0E8] rounded-3xl p-8 sm:p-14 border-2 border-dashed border-[#D8C2B0] text-center max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-white text-[#F88897] flex items-center justify-center mx-auto text-xl shadow-xs">
            <BsFeather />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            Join Our Quiet Craft Circle
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Every month, we send one quiet letter with a free beginner-friendly crochet pattern PDF, seasonal yarn dyeing recipes, and workbench updates.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
              <BsCheckCircleFill className="text-base text-emerald-600" />
              <span>Welcome to our craft circle! Check your email for your free pattern guide.</span>
            </div>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                className="w-full sm:flex-1 px-4 py-3 rounded-full bg-white border border-[#EADFD4] text-xs text-[#6C2C12] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Join Our Circle
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400">
            Delivered without haste or clutter. Unsubscribe at any time with one click.
          </p>
        </div>
      </section>

      {/* STUDIO TOUR VIDEO MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EADFD4] text-left"
            >
              <div className="p-4 sm:p-6 border-b border-[#EADFD4] flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#6C2C12]">
                    Inside Our Home Workshop
                  </h3>
                  <p className="text-xs text-gray-500">
                    A short visual documentary on the rhythm of mindful hand-weaving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                >
                  <BsX className="text-2xl" />
                </button>
              </div>

              {/* Video preview / player */}
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                <img
                  src="/uploads/hero/shop-hero.jpg"
                  alt="Studio Craft Process"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#F88897] flex items-center justify-center text-white text-2xl shadow-xl animate-pulse">
                    <BsPlayCircleFill />
                  </div>
                  <h4 className="font-bold text-lg">The Craft Process</h4>
                  <p className="text-xs text-white/80 max-w-sm">
                    Watch Maya and our home knitters hand-block finished blankets, block botanical stems, and stitch amigurumi friends.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#FAF7F2] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6C2C12]">
                  Filmed in our small home studio
                </span>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-[#6C2C12] text-white text-xs font-bold hover:bg-[#F88897] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
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
        title="Community Gallery"
      />
    </div>
  );
};

export default Home3;
