import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsHeart,
  BsTrash,
  BsHandbag,
  BsListUl,
  BsGrid,
  BsWhatsapp,
  BsTelephone,
  BsCheck2,
  BsArrowRight,
  BsLightningCharge
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { saveCart, syncWithDB } from "../utils/syncHelper";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [layoutMode, setLayoutMode] = useState("list"); // "list", "grid"
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Add to cart handler (Guest allowed)
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const inCartAlready = cart.some((item) => item.id === product.id);
    const productTitle = product.title || product.category || "Creation";

    if (inCartAlready) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `"${productTitle}" is already in your cart.` }
        })
      );
      return;
    }

    const updatedCart = [...cart, { ...product, title: productTitle, quantity: 1 }];
    saveCart(updatedCart);
    setCartItems(updatedCart);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Added "${productTitle}" to cart!` }
      })
    );
  };

  // Add all wishlist items to cart
  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let addedCount = 0;
    const newCart = [...cart];

    wishlistItems.forEach((wItem) => {
      if (!newCart.some((c) => c.id === wItem.id)) {
        newCart.push({ ...wItem, quantity: 1 });
        addedCount++;
      }
    });

    saveCart(newCart);
    setCartItems(newCart);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message:
            addedCount > 0
              ? `Added ${addedCount} wishlist items to your cart!`
              : "All wishlist items are already in your cart."
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
      <section className="w-full min-h-[70vh] flex items-center justify-center px-5 py-16 bg-[#FAF6F0]/20">
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
            Looks like you haven&apos;t saved any favorites yet.
            Explore our handcrafted collection and save the pieces you cherish.
          </p>

          <Link to="/shop">
            <button className="mt-6 px-7 py-3 bg-[#6C2C12] text-white rounded-xl text-sm font-semibold uppercase
              border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] transition-all duration-300 cursor-pointer shadow-sm">
              Discover Creations
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
      className="w-full min-h-[80vh] py-10 md:py-14 px-4 sm:px-6 lg:px-12 xl:px-20 bg-[#FAF6F0]/20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-[#eadfd4] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">
              My Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              You have {wishlistItems.length} handcrafted pieces saved.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <BsHandbag /> Add All to Cart
            </button>

            {/* Layout Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#F7EEE8] p-1 rounded-lg border border-[#eadfd4]">
              <button
                onClick={() => setLayoutMode("list")}
                className={`p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  layoutMode === "list" ? "bg-[#6C2C12] text-white shadow-xs" : "text-[#6C2C12] hover:bg-[#eadfd4]"
                }`}
                title="List View"
              >
                <BsListUl className="text-base" />
              </button>
              <button
                onClick={() => setLayoutMode("grid")}
                className={`p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  layoutMode === "grid" ? "bg-[#6C2C12] text-white shadow-xs" : "text-[#6C2C12] hover:bg-[#eadfd4]"
                }`}
                title="Grid View"
              >
                <BsGrid className="text-base" />
              </button>
            </div>

            <button
              onClick={handleClearWishlist}
              className="text-xs font-semibold text-gray-400 hover:text-[#6C2C12] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full space-y-6">
          {layoutMode === "list" ? (
            <div className="bg-white rounded-2xl shadow-xs border border-[#eadfd4] overflow-hidden">
              {/* Desktop Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F7EEE8] text-[#6C2C12] font-semibold text-xs sm:text-sm uppercase tracking-wider">
                <div className="col-span-6">Creation Details</div>
                <div className="col-span-2 text-center">Unit Price</div>
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
                  {wishlistItems.map((item) => {
                    const inCart = isProductInCart(item.id);
                    return (
                      <motion.div 
                        key={item.id} 
                        variants={cardVariants}
                        layout
                        exit={{ opacity: 0, x: -50, transition: { duration: 0.25 } }}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center bg-white"
                      >
                        {/* Product Info */}
                        <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                          <Link to={`/product/${item.id}`} className="aspect-square w-20 rounded-xl overflow-hidden shrink-0 border border-[#eadfd4] bg-[#FAF6F0] cursor-pointer group">
                            <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </Link>
                          <div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors text-sm sm:text-base cursor-pointer">{item.title || item.category}</h3>
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5">#{item.id}</p>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <BsTrash className="text-xs" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center text-sm font-semibold text-[#6C2C12]">
                          <span className="sm:hidden text-gray-500 font-medium">Price:</span>
                          <span>₹{(item.price || 0).toLocaleString('en-IN')}</span>
                        </div>

                        {/* Inquiry Buttons */}
                        <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center gap-2">
                          <span className="sm:hidden text-gray-500 font-medium">Inquire:</span>
                          <div className="flex gap-2">
                            <a
                              href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20for%20₹${(item.price || 0).toLocaleString('en-IN')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 rounded-full flex items-center justify-center transition-colors shadow-2xs"
                              title="WhatsApp Inquiry"
                            >
                              <BsWhatsapp className="text-sm" />
                            </a>
                            <a
                              href="tel:+919876543210"
                              className="w-8 h-8 bg-[#FAF6F0] text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] rounded-full flex items-center justify-center transition-colors shadow-2xs"
                              title="Call Inquiry"
                            >
                              <BsTelephone className="text-xs" />
                            </a>
                          </div>
                        </div>

                        {/* Action: Add to Cart */}
                        <div className="col-span-1 sm:col-span-2 flex justify-end">
                          <button
                            onClick={() => {
                              if (!inCart) handleAddToCart(item);
                            }}
                            disabled={inCart}
                            className={`w-full sm:w-auto px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              inCart
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#6C2C12] hover:bg-[#F88897] text-white shadow-xs"
                            }`}
                          >
                            {inCart ? <BsCheck2 className="text-sm font-bold" /> : <BsHandbag className="text-xs" />}
                            <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            /* Grid View */
            <motion.div 
              variants={containerVariants}
              initial={hasAnimated ? "show" : "hidden"}
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {wishlistItems.map((item) => {
                  const inCart = isProductInCart(item.id);
                  return (
                    <motion.div 
                      key={item.id}
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                      className="bg-white rounded-2xl shadow-xs border border-[#eadfd4] overflow-hidden flex flex-col p-4 relative group"
                    >
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 text-red-500 hover:bg-red-50 flex items-center justify-center shadow-xs transition-all z-10 cursor-pointer"
                        title="Remove Item"
                      >
                        <BsTrash className="text-xs" />
                      </button>

                      <Link to={`/product/${item.id}`} className="aspect-square w-full rounded-xl overflow-hidden border border-[#eadfd4] mb-3 bg-[#FFF9F5] group block">
                        <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>

                      <div className="flex flex-col flex-1">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors text-sm cursor-pointer line-clamp-1">{item.title || item.category}</h3>
                        </Link>
                        <p className="text-[11px] text-gray-400 mt-0.5">#{item.id}</p>

                        <div className="flex justify-between items-center mt-2 mb-4 text-xs">
                          <span className="text-gray-500">Price:</span>
                          <span className="text-[#6C2C12] font-bold text-sm">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="mt-auto space-y-2">
                          <button
                            onClick={() => {
                              if (!inCart) handleAddToCart(item);
                            }}
                            disabled={inCart}
                            className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              inCart
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#6C2C12] hover:bg-[#F88897] text-white shadow-xs"
                            }`}
                          >
                            {inCart ? <BsCheck2 className="text-sm font-bold" /> : <BsHandbag className="text-xs" />}
                            <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Wishlist Bottom Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EADFD4]">
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] flex items-center gap-1.5 transition-colors"
          >
            ← Continue Exploring Creations
          </Link>

          <Link
            to="/cart"
            className="px-6 py-3 rounded-xl bg-[#FAF6F0] hover:bg-[#6C2C12] text-[#6C2C12] hover:text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 border border-[#EADFD4]"
          >
            <span>View Shopping Cart ({cartItems.length})</span>
            <BsArrowRight />
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default Wishlist;
