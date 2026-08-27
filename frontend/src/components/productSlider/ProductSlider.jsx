import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { BsHeart, BsHeartFill, BsHandbag, BsEye, BsCheck2, BsStarFill, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { saveCart, saveWishlist } from "../../utils/syncHelper";
import { API_ENDPOINTS } from "../../config/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductSlider = () => {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    fetch(API_ENDPOINTS.PRODUCTS)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch((err) => console.error("Error fetching slider products:", err));
  }, []);

  // Exactly 10 products (2 from each of the 5 categories), interleaved so categories are not placed together
  const sliderProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    // 2 Pet (#6, #14), 2 Decor (#2, #11), 2 Home (#15, #4), 2 Kids (#8, #1), 2 Personalized (#18, #5)
    const interleavedIds = [6, 2, 15, 8, 18, 14, 11, 4, 1, 5];
    const picked = interleavedIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean);
    return picked.length > 0 ? picked : allProducts.slice(0, 10);
  }, [allProducts]);

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const loadStorage = () => {
      setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
      setWishlistItems(JSON.parse(localStorage.getItem("wishlist")) || []);
    };
    loadStorage();

    window.addEventListener("cartUpdated", loadStorage);
    window.addEventListener("wishlistUpdated", loadStorage);

    return () => {
      window.removeEventListener("cartUpdated", loadStorage);
      window.removeEventListener("wishlistUpdated", loadStorage);
    };
  }, []);

  const isProductInCart = (id) => cartItems.some((item) => item.id === id);
  const isProductInWishlist = (id) => wishlistItems.some((item) => item.id === id);

  // Toggle Cart Handler
  const toggleCart = (product, e) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: "Please sign in to add items to your cart! 🧶",
            type: "cart_add"
          }
        })
      );
      navigate("/signin");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const inCartAlready = cart.some((item) => item.id === product.id);

    if (inCartAlready) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: `"${product.title}" is already in your cart.` 
          }
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
        detail: { 
          message: `Added "${product.title}" to cart! 🧶`,
          type: "cart_add"
        }
      })
    );
  };

  // Toggle Wishlist Handler
  const toggleWishlist = (product, e) => {
    e.stopPropagation();
    if (!localStorage.getItem("token")) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: "Please sign in to save items to your wishlist! ♥",
            type: "wishlist_add"
          }
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
          detail: { 
            message: `Removed "${product.title}" from wishlist.`,
            type: "wishlist_remove"
          }
        })
      );
    } else {
      updatedWishlist = [...wishlist, product];
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: `Saved "${product.title}" to wishlist! ♥`,
            type: "wishlist_add"
          }
        })
      );
    }

    saveWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
  };

  return (
    <section className="w-full py-12 sm:py-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs sm:text-sm font-semibold tracking-[2px] text-[#6C2C12] uppercase"
            >
              - Featured Handcrafted Treasures -
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#6C2C12] mt-1.5"
            >
              Popular Handmade <span className="text-[#F88897]">Creations</span>
            </motion.h2>
          </div>

          {/* Navigation Controls & View All Link */}
          <div className="flex items-center gap-3">
            <Link 
              to="/shop" 
              className="text-xs sm:text-sm font-semibold text-[#6C2C12] hover:underline transition-colors mr-2"
            >
              Explore All Items →
            </Link>
            <button
              ref={prevRef}
              className="product-prev-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EADFD4] bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
              title="Previous Products"
            >
              <BsChevronLeft className="text-sm" />
            </button>
            <button
              ref={nextRef}
              className="product-next-btn w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#EADFD4] bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer"
              title="Next Products"
            >
              <BsChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* Product Swiper Carousel */}
        <div className="relative">
          {sliderProducts.length > 0 && (
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1.2}
              loop={sliderProducts.length >= 6}
              speed={800}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              480: {
                slidesPerView: 1.8,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 2.2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2.8,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3.5,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="product-slider-swiper pb-2"
          >
            {sliderProducts.map((product) => {
              const inCart = isProductInCart(product.id);
              const inWishlist = isProductInWishlist(product.id);

              return (
                <SwiperSlide key={product.id} className="h-auto">
                  <div className="group h-full bg-white rounded-2xl border border-[#EADFD4] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
                    {/* Image Area */}
                    <div 
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="aspect-square w-full bg-[#FFF9F5] overflow-hidden relative cursor-pointer"
                    >
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                        onError={(e) => {
                          e.target.src = "/uploads/products/decor/sunflower.png";
                        }}
                      />

                      {/* Badge / Category Tag */}
                      {(product.badge || product.category) && (
                        <span className="absolute top-3 left-3 bg-[#F88897] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                          {product.badge || product.category}
                        </span>
                      )}

                      {/* Floating Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {/* Wishlist Button */}
                        <button
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

                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                          title="View Details"
                          className="w-9 h-9 rounded-full bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white flex items-center justify-center shadow-md transition-all duration-300 delay-75 cursor-pointer opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        >
                          <BsEye className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category & Rating */}
                        <div className="flex items-center justify-between gap-1 mb-1.5 text-xs">
                          <span className="font-bold uppercase tracking-wider text-[11px] text-[#A67C52]">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500">
                            <BsStarFill className="text-[#f59e0b] text-[11px]" />
                            <span className="font-bold text-[#6C2C12] text-xs">{product.rating}</span>
                            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="font-bold text-sm sm:text-base text-[#6C2C12] hover:underline transition-colors cursor-pointer line-clamp-1 mb-1"
                        >
                          {product.title}
                        </h3>

                        {/* Material Note */}
                        {product.material && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 mb-3">
                            {product.material}
                          </p>
                        )}
                      </div>

                      {/* Bottom Row: Price & Add to Cart */}
                      <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2 mt-auto">
                        <span className="text-base sm:text-lg font-bold text-[#6C2C12]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>

                        <button
                          onClick={(e) => toggleCart(product, e)}
                          disabled={inCart}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all duration-300 shadow-2xs ${
                            inCart
                              ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                              : "bg-[#6C2C12] text-white border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] cursor-pointer"
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
