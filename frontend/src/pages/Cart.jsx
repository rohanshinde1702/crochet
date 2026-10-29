import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsHandbag,
  BsTrash,
  BsPlus,
  BsDash,
  BsWhatsapp,
  BsTelephone,
  BsListUl,
  BsGrid,
  BsArrowRight,
  BsShieldCheck,
  BsTruck,
  BsLightningCharge
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { LuSparkles, LuHandHeart } from "react-icons/lu";
import { syncWithDB } from "../utils/syncHelper";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [layoutMode, setLayoutMode] = useState("list"); // "list", "grid"
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Load cart items on mount and listen to updates
  useEffect(() => {
    const loadCart = () => {
      const items = JSON.parse(localStorage.getItem("cart")) || [];
      const sanitizedItems = items.map((item, idx) => ({
        ...item,
        id: item.id || idx + 1,
        title: item.title || item.category || "Handcrafted Crochet Item",
        price: item.price || 0,
      }));
      setCartItems(sanitizedItems);
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  // Update localStorage and trigger custom event
  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem("cart", JSON.stringify(newCartItems));
    syncWithDB(newCartItems, undefined);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Quantity Change Handler
  const handleQuantityChange = (id, amount) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = (item.quantity || 1) + amount;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    updateCart(updatedCart);
  };

  // Remove Item Handler
  const handleRemoveItem = (id) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    const updatedCart = cartItems.filter((item) => item.id !== id);
    updateCart(updatedCart);
    if (itemToRemove) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { 
            message: `Removed "${itemToRemove.title || itemToRemove.category}" from cart.`,
            type: "cart_remove"
          }
        })
      );
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    updateCart([]);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Your shopping cart has been cleared." }
      })
    );
  };

  // Calculate Order Total
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
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

  // Empty Cart Screen
  if (cartItems.length === 0) {
    return (
      <section className="w-full min-h-[70vh] bg-white flex items-center justify-center px-5 py-16">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F7EEE8] flex items-center justify-center">
            <BsHandbag className="text-3xl text-[#6C2C12]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#6C2C12] mt-6">
            Your Cart is Empty
          </h1>

          <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-md mx-auto">
            Looks like you haven&apos;t added any handmade creations yet.
            Explore our artisan collection and discover cozy handcrafted loops!
          </p>

          <Link to="/shop">
            <button className="mt-6 px-7 py-3 bg-[#6C2C12] text-white rounded-xl text-sm font-semibold uppercase
              border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] transition-all duration-300 cursor-pointer shadow-sm">
              Explore Creations
            </button>
          </Link>
        </motion.div>
      </section>
    );
  }

  const subtotal = calculateTotal();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-[80vh] bg-[#FAF6F0]/30 py-10 md:py-14 px-4 sm:px-6 lg:px-12 xl:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Free Shipping Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-full bg-emerald-600 text-white text-xs">
              <BsTruck />
            </span>
            <span>
              <strong>Complimentary Free Shipping:</strong> Your handcrafted items qualify for free standard delivery!
            </span>
          </div>
          <span className="hidden sm:inline text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200 uppercase">
            Active
          </span>
        </div>

        {/* Cart Page Title and Layout Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-[#eadfd4] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">
              Shopping Cart
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              You have {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items waiting for checkout.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCart}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BsTrash /> Clear Cart
            </button>

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
          </div>
        </div>

        {/* Cart Items Area */}
        <div className="w-full space-y-6">
          {layoutMode === "list" ? (
            <div className="bg-white rounded-2xl shadow-xs border border-[#eadfd4] overflow-hidden">
              {/* Desktop Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F7EEE8] text-[#6C2C12] font-semibold text-xs sm:text-sm uppercase tracking-wider">
                <div className="col-span-5">Creation</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Inquire</div>
                <div className="col-span-1 text-right">Total</div>
              </div>

              {/* Items List */}
              <motion.div 
                variants={containerVariants}
                initial={hasAnimated ? "show" : "hidden"}
                animate="show"
                className="divide-y divide-[#eadfd4]"
              >
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, x: -50, transition: { duration: 0.25 } }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center bg-white"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-5 flex items-center gap-4">
                        <Link to={`/product/${item.id}`} className="aspect-square w-20 rounded-xl overflow-hidden shrink-0 border border-[#eadfd4] bg-[#FAF6F0] cursor-pointer group">
                          <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </Link>
                        <div>
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-bold text-[#6C2C12] hover:text-[#F88897] transition-colors text-sm sm:text-base cursor-pointer">{item.title || item.category}</h3>
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">Product ID: #{item.id}</p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <BsTrash className="text-xs" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center text-sm font-semibold text-gray-700">
                        <span className="sm:hidden text-gray-500 font-medium">Price:</span>
                        <span>₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center">
                        <span className="sm:hidden text-gray-500 font-medium">Quantity:</span>
                        <div className="flex items-center border border-[#eadfd4] rounded-lg bg-[#F7EEE8] overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-2.5 py-1.5 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsDash className="text-xs" />
                          </button>
                          <span className="px-3 py-1 text-xs font-semibold text-[#6C2C12] min-w-8 text-center bg-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-2.5 py-1.5 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Inquiry Option */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center gap-2">
                        <span className="sm:hidden text-gray-500 font-medium">Artisan:</span>
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20(Qty:%20${item.quantity || 1})%20for%20₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                            title="WhatsApp Inquiry"
                          >
                            <BsWhatsapp className="text-sm" />
                          </a>
                          <a
                            href="tel:+919876543210"
                            className="w-8 h-8 bg-[#FAF6F0] text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white border border-[#EADFD4] rounded-full flex items-center justify-center transition-colors cursor-pointer"
                            title="Call Inquiry"
                          >
                            <BsTelephone className="text-xs" />
                          </a>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="col-span-1 sm:col-span-1 flex justify-between sm:justify-end items-center text-sm">
                        <span className="sm:hidden text-gray-500 font-medium">Total:</span>
                        <span className="text-[#6C2C12] font-bold">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
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
                {cartItems.map((item) => (
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
                        <h3 className="font-bold text-[#6C2C12] transition-colors text-sm cursor-pointer line-clamp-1">{item.title || item.category}</h3>
                      </Link>
                      <p className="text-[11px] text-gray-400 mt-0.5">#{item.id}</p>

                      <div className="flex justify-between items-center mt-2 mb-3 text-xs">
                        <span className="text-gray-500">Unit Price:</span>
                        <span className="text-[#6C2C12] font-semibold">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between border-t border-b border-[#eadfd4] py-2.5 mb-3">
                        <span className="text-xs text-gray-500 font-medium">Quantity:</span>
                        <div className="flex items-center border border-[#eadfd4] rounded-lg bg-[#F7EEE8] overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-2 py-1 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsDash className="text-xs" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-semibold text-[#6C2C12] min-w-6 text-center bg-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-2 py-1 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-between items-center text-sm pt-1">
                        <span className="text-gray-500 font-medium text-xs">Total:</span>
                        <span className="text-[#6C2C12] font-bold text-base">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Cart Bottom Summary & PRIMARY Checkout Button */}
        <div className="mt-8 bg-white rounded-3xl border border-[#EADFD4] shadow-xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <Link
                to="/shop"
                className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] flex items-center gap-1.5 transition-colors"
              >
                ← Continue Shopping
              </Link>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <BsShieldCheck className="text-[#F88897]" /> 256-bit Secure Checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <LuHandHeart className="text-[#F88897]" /> 100% Handcrafted
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <div className="text-right sm:text-right">
                <div className="text-xs text-gray-500">Order Subtotal:</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  Taxes included • Free Standard Delivery
                </div>
              </div>

              {/* Prominent Proceed to Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="px-8 py-4 bg-[#6C2C12] hover:bg-[#F88897] text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <BsArrowRight className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Cart;
