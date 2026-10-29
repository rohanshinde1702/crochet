import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsHeart,
  BsHeartFill,
  BsHandbag,
  BsEye,
  BsCheck2,
  BsStarFill,
  BsChevronLeft,
  BsChevronRight,
  BsX,
  BsArrowsFullscreen,
  BsPlus,
  BsDash,
  BsLightningCharge
} from "react-icons/bs";
import { saveCart, saveWishlist } from "../../utils/syncHelper";
import { getProducts } from "../../services/dataService";
import ImageLightbox from "../common/ImageLightbox";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductSlider = () => {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);

  // Quick View & Lightbox Modal state
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch((err) => console.error("Error loading slider products:", err));

    const handleUpdate = () => {
      getProducts().then((data) => setAllProducts(data || []));
    };
    window.addEventListener("productsUpdated", handleUpdate);
    return () => window.removeEventListener("productsUpdated", handleUpdate);
  }, []);

  // Interleaved selection for variety
  const sliderProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const interleavedIds = [6, 2, 15, 8, 18, 14, 11, 4, 1, 5];
    const picked = interleavedIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean);
    return picked.length > 0 ? picked : allProducts.slice(0, 10);
  }, [allProducts]);

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
      setWishlistItems(JSON.parse(localStorage.getItem("wishlist")) || []);
    };
    loadData();

    window.addEventListener("cartUpdated", loadData);
    window.addEventListener("wishlistUpdated", loadData);

    return () => {
      window.removeEventListener("cartUpdated", loadData);
      window.removeEventListener("wishlistUpdated", loadData);
    };
  }, []);

  const isProductInCart = (id) => cartItems.some((item) => item.id === id);
  const isProductInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  // Add to Cart (Guest Allowed)
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const inCartAlready = cart.some((item) => item.id === product.id);

    if (inCartAlready) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `"${product.title}" is already in your cart.` }
        })
      );
      return;
    }

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
        detail: { message: `Added "${product.title}" to cart!` }
      })
    );
  };

  // Toggle Wishlist (Guest Allowed)
  const toggleWishlist = (product, e) => {
    if (e) e.stopPropagation();

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

  const openQuickView = (product, e) => {
    if (e) e.stopPropagation();
    setQuickViewProduct(product);
    setModalQuantity(1);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const openLightbox = (product) => {
    const gallery =
      product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.img || "/uploads/products/decor/sunflower.png"];
    setLightboxImages(gallery);
    setIsLightboxOpen(true);
  };

  return (
    <section className="py-12 md:py-16 bg-[#FFF9F5] border-b border-[#EADDD5]">
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
              <button
                type="button"
                onClick={closeQuickView}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] text-[#6C2C12] hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <BsX className="text-2xl" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EADFD4] group">
                  <img
                    src={quickViewProduct.img}
                    alt={quickViewProduct.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/uploads/products/decor/sunflower.png";
                    }}
                  />
                  {quickViewProduct.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F88897] text-white">
                      {quickViewProduct.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => openLightbox(quickViewProduct)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    title="Open Fullscreen Lightbox"
                  >
                    <BsArrowsFullscreen className="text-sm" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-1">
                      {quickViewProduct.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#6C2C12]">
                      {quickViewProduct.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                      <BsStarFill className="text-amber-500" />
                      <span className="font-bold text-[#6C2C12]">
                        {quickViewProduct.rating || 4.8}
                      </span>
                      <span>({quickViewProduct.reviewsCount || 42} reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2 border-t border-b border-[#F2ECE4]">
                    <span className="text-2xl font-extrabold text-[#6C2C12]">
                      ₹{quickViewProduct.price?.toLocaleString("en-IN")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      In Stock
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {quickViewProduct.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase text-gray-500">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-[#EADFD4] rounded-lg bg-[#FAF6F0] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 hover:bg-[#EADFD4] text-[#6C2C12] cursor-pointer"
                      >
                        <BsDash />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold bg-white min-w-8 text-center text-[#6C2C12]">
                        {modalQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQuantity((q) => q + 1)}
                        className="px-2.5 py-1 hover:bg-[#EADFD4] text-[#6C2C12] cursor-pointer"
                      >
                        <BsPlus />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCart(quickViewProduct);
                          closeQuickView();
                        }}
                        className="py-2.5 px-4 bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <BsHandbag /> Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddToCart(quickViewProduct);
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h5 className="tracking-[1.5px] sm:tracking-[2px] font-semibold text-[#6C2C12] uppercase text-xs sm:text-sm">
              - Handcrafted Favorites -
            </h5>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#6C2C12] mt-1">
              Popular Handmade Creations
            </h2>
          </div>

          {/* Navigation Arrows and View All Link */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors"
            >
              View All Shop →
            </Link>

            <div className="flex items-center gap-2">
              <button
                ref={prevRef}
                className="w-9 h-9 rounded-full border border-[#EADDD5] bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer"
                title="Previous"
              >
                <BsChevronLeft className="text-xs -ml-0.5" />
              </button>
              <button
                ref={nextRef}
                className="w-9 h-9 rounded-full border border-[#EADDD5] bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer"
                title="Next"
              >
                <BsChevronRight className="text-xs -mr-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
          {sliderProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Loading featured creations...
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 }
              }}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              navigation={true}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              className="pb-10"
            >
              {sliderProducts.map((product) => {
                const inCart = isProductInCart(product.id);
                const inWishlist = isProductInWishlist(product.id);

                return (
                  <SwiperSlide key={product.id}>
                    <div
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-white rounded-2xl border border-[#EADFD4] overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md flex flex-col h-full"
                    >
                      <div className="aspect-square w-full bg-[#FAF6F0] overflow-hidden relative">
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

                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(product, e)}
                            title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                              inWishlist
                                ? "bg-[#F88897] text-white scale-105"
                                : "bg-white text-[#F88897] hover:bg-[#F88897] hover:text-white"
                            }`}
                          >
                            {inWishlist ? <BsHeartFill className="text-sm" /> : <BsHeart className="text-sm" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => openQuickView(product, e)}
                            title="Quick View"
                            className="w-9 h-9 rounded-full bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 delay-75 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                          >
                            <BsEye className="text-sm" />
                          </button>
                        </div>
                      </div>

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

                        <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2 mt-auto">
                          <span className="text-base sm:text-lg font-bold text-[#6C2C12]">
                            ₹{product.price?.toLocaleString("en-IN")}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={inCart}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-2xs cursor-pointer ${
                              inCart
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#6C2C12] text-white hover:bg-[#F88897]"
                            }`}
                          >
                            {inCart ? (
                              <>
                                <BsCheck2 className="text-sm font-bold" />
                                <span>In Cart</span>
                              </>
                            ) : (
                              <>
                                <BsHandbag className="text-xs" />
                                <span>Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
