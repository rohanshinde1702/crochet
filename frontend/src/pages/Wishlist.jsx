import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsHeart, BsTrash, BsHandbag, BsListUl, BsGrid, BsWhatsapp, BsTelephone, BsCheck2 } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

import { saveCart, saveWishlist, syncWithDB } from "../utils/syncHelper";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [layoutMode, setLayoutMode] = useState("list"); // "list", "grid"
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  // Sync cart items for in-cart detection
  useEffect(() => {
    const loadCart = () => {
      const items = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(items);
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  const isProductInCart = (id) => cartItems.some((item) => item.id === id);

  // Load wishlist items on mount and listen to updates
  useEffect(() => {
    const loadWishlist = () => {
      const items = JSON.parse(localStorage.getItem("wishlist")) || [];
      const sanitizedItems = items.map((item, idx) => ({
        ...item,
        id: item.id || idx + 1,
        title: item.title || item.category || "Handcrafted Crochet Item",
        price: item.price || 0,
      }));
      setWishlistItems(sanitizedItems);
    };

    loadWishlist();
    window.addEventListener("wishlistUpdated", loadWishlist);
    return () => window.removeEventListener("wishlistUpdated", loadWishlist);
  }, []);

  // Update localStorage and trigger custom event
  const updateWishlist = (newWishlist) => {
    setWishlistItems(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    syncWithDB(undefined, newWishlist);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Remove from wishlist
  const handleRemoveItem = (id) => {
    const itemToRemove = wishlistItems.find((item) => item.id === id);
    const newWishlist = wishlistItems.filter((item) => item.id !== id);
    updateWishlist(newWishlist);
    if (itemToRemove) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: `Removed "${itemToRemove.title || itemToRemove.category}" from wishlist.`,
            type: "wishlist_remove"
          }
        })
      );
    }
  };

  // Move item to cart
  const handleMoveToCart = (product) => {
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
    const productTitle = product.title || product.category;

    if (inCartAlready) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: `"${productTitle}" is already in your cart.` 
          }
        })
      );
      return;
    }

    const updatedCart = [...cart, { ...product, title: productTitle, quantity: 1 }];
    saveCart(updatedCart);
    setCartItems(updatedCart);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { 
          message: `Added "${productTitle}" to cart! 🧶`,
          type: "cart_add"
        }
      })
    );
  };

  // Clear entire wishlist
  const handleClearWishlist = () => {
    updateWishlist([]);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { 
          message: "Cleared your wishlist.",
          type: "wishlist_remove"
        }
      })
    );
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
    exit: { opacity: 0, scale: 0.9, x: -30, transition: { duration: 0.2 } }
  };

  // Empty Wishlist view
  if (wishlistItems.length === 0) {
    return (
      <section className="w-full min-h-[70vh] flex items-center justify-center px-5 py-16">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F7EEE8] flex items-center justify-center">
            <BsHeart className="text-3xl text-[#F88897]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#6C2C12] mt-6">
            Your Wishlist is Empty
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-md mx-auto">
            Looks like you haven't saved any items yet.
            Explore our handmade collection and build your dream list.
          </p>

          <Link to="/shop">
            <button className="mt-6 px-7 py-3 bg-[#6C2C12] text-white rounded-lg text-sm font-semibold uppercase
              border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] transition-all duration-300 cursor-pointer">
              Continue Shopping
            </button>
          </Link>
        </motion.div>
      </section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-[80vh] py-12 md:py-16 px-5 sm:px-8 lg:px-12 xl:px-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-[#eadfd4] gap-4">
          <h1 className="text-3xl font-bold text-[#6C2C12]">
            My Wishlist
          </h1>
          
          <div className="flex items-center gap-4 self-start sm:self-auto">
            {/* Layout Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#F7EEE8] p-1 rounded-lg border border-[#eadfd4]">
              <button
                onClick={() => setLayoutMode("list")}
                className={`p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  layoutMode === "list" ? "bg-[#6C2C12] text-white shadow-sm" : "text-[#6C2C12] hover:bg-[#eadfd4]"
                }`}
                title="List View"
              >
                <BsListUl className="text-base" />
              </button>
              <button
                onClick={() => setLayoutMode("grid")}
                className={`p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  layoutMode === "grid" ? "bg-[#6C2C12] text-white shadow-sm" : "text-[#6C2C12] hover:bg-[#eadfd4]"
                }`}
                title="Grid View"
              >
                <BsGrid className="text-base" />
              </button>
            </div>

            <button
              onClick={handleClearWishlist}
              className="text-sm font-semibold text-gray-400 hover:text-[#6C2C12] transition-colors cursor-pointer"
            >
              Clear Wishlist
            </button>
          </div>
        </div>

        <div className="w-full space-y-6">
          {layoutMode === "list" ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#eadfd4] overflow-hidden">
              {/* Desktop Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F7EEE8] text-[#6C2C12] font-semibold text-sm uppercase tracking-wider">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Inquire</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Items List */}
              <motion.div 
                variants={containerVariants}
                initial={hasAnimated ? "show" : "hidden"}
                animate="show"
                className="divide-y divide-[#eadfd4]"
              >
                <AnimatePresence>
                  {wishlistItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.25 } }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-6 items-center bg-white"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                        <Link to={`/product/${item.id}`} className="aspect-square w-20 rounded-lg overflow-hidden shrink-0 border border-[#eadfd4] bg-white cursor-pointer group">
                          <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                        <div>
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-bold text-[#6C2C12] transition-colors text-base cursor-pointer">{item.title || item.category}</h3>
                          </Link>
                          <p className="text-xs text-gray-400 mt-1">Product ID: #{item.id}</p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="mt-2 text-xs text-[#F88897] hover:text-[#6C2C12] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <BsTrash /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center text-sm">
                        <span className="sm:hidden text-gray-500 font-medium">Price:</span>
                        <span className="text-[#6C2C12] font-semibold">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Inquire Buttons (WhatsApp and Call) */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center gap-2">
                        <span className="sm:hidden text-gray-500 font-medium">Inquire:</span>
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20for%20₹${(item.price || 0).toLocaleString('en-IN')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-[#25D366] hover:bg-transparent text-white hover:text-[#25D366] border-2 border-[#25D366] rounded-full flex items-center 
                            justify-center transition-colors shadow-sm cursor-pointer duration-300"
                            title="WhatsApp Inquiry"
                          >
                            <BsWhatsapp className="text-base" />
                          </a>
                          <a
                            href="tel:+919876543210"
                            className="w-9 h-9 bg-[#6C2C12] hover:bg-transparent text-white border-2 border-[#6C2C12] hover:text-[#6C2C12] rounded-full flex items-center 
                            justify-center transition-colors shadow-sm cursor-pointer duration-300"
                            title="Call Inquiry"
                          >
                            <BsTelephone className="text-base" />
                          </a>
                        </div>
                      </div>

                      {/* Action button (Add to Cart) */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-end items-center">
                        <span className="sm:hidden text-gray-500 font-medium">Action:</span>
                        {(() => {
                          const inCart = isProductInCart(item.id);
                          return (
                            <button
                              onClick={() => {
                                if (!inCart) handleAddToCart(item);
                              }}
                              disabled={inCart}
                              className={`px-4 py-2 rounded flex items-center gap-2 text-xs font-semibold transition-all duration-300 ${
                                inCart
                                  ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                                  : "bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] cursor-pointer"
                              }`}
                            >
                              {inCart ? <BsCheck2 className="text-sm font-bold" /> : <BsHandbag className="text-sm" />}
                              <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial={hasAnimated ? "show" : "hidden"}
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={cardVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-sm border border-[#eadfd4] flex flex-col relative group p-0 sm:p-5"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-[#F88897] hover:text-[#6C2C12] transition-colors bg-[#F7EEE8] rounded-full p-1.5 shadow-sm cursor-pointer border border-[#eadfd4] z-10"
                      title="Remove from wishlist"
                    >
                      <BsTrash className="text-sm" />
                    </button>

                    {/* Product Image */}
                    <Link to={`/product/${item.id}`} className="aspect-square w-full rounded-t-xl sm:rounded-lg overflow-hidden border-b sm:border border-[#eadfd4] sm:mb-4 bg-[#FFF9F5] group block">
                      <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </Link>

                    <div className="p-4 sm:p-0 flex flex-col flex-1">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-bold text-[#6C2C12] transition-colors text-base cursor-pointer">{item.title || item.category}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Product ID: #{item.id}</p>

                      <div className="flex justify-between items-center mt-2 mb-3 text-sm">
                        <span className="text-gray-500">Price:</span>
                        <span className="text-[#6C2C12] font-semibold">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Inquiry buttons and Total */}
                      <div className="mt-auto pt-2 space-y-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20for%20₹${(item.price || 0).toLocaleString('en-IN')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-[#25D366] hover:bg-transparent text-white hover:text-[#25D366] border-2 border-[#25D366] rounded 
                            flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer duration-300"
                          >
                            <BsWhatsapp className="text-base" /> Inquiry
                          </a>
                          <a
                            href="tel:+919876543210"
                            className="px-3 py-2 bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] rounded 
                            flex items-center justify-center transition-colors cursor-pointer duration-300"
                            title="Call Inquiry"
                          >
                            <BsTelephone className="text-base" />
                          </a>
                        </div>
                        {(() => {
                          const inCart = isProductInCart(item.id);
                          return (
                            <button
                              onClick={() => {
                                if (!inCart) handleAddToCart(item);
                              }}
                              disabled={inCart}
                              className={`w-full py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                                inCart
                                  ? "bg-gray-400 text-white border-2 border-gray-400 cursor-not-allowed"
                                  : "bg-[#6C2C12] hover:bg-transparent text-white hover:text-[#6C2C12] border-2 border-[#6C2C12] cursor-pointer"
                              }`}
                            >
                              {inCart ? <BsCheck2 className="text-base font-bold" /> : <BsHandbag className="text-base" />}
                              <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="mt-8">
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#6C2C12] hover:underline flex items-center gap-2 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default Wishlist;
