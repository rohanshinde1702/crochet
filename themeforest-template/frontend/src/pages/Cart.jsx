import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsHandbag, BsTrash, BsPlus, BsDash, BsWhatsapp, BsTelephone, BsListUl, BsGrid } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

import { syncWithDB } from "../utils/syncHelper";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [layoutMode, setLayoutMode] = useState("list"); // "list", "grid"
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setHasAnimated(true);
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
            Looks like you haven't added anything to your cart yet.
            Explore our handmade collection and discover cozy loops!
          </p>

          <Link to="/shop">
            <button className="mt-6 px-7 py-3 bg-[#6C2C12] text-white rounded-lg text-sm font-semibold uppercase
              border-2 border-[#6C2C12] hover:bg-transparent hover:text-[#6C2C12] transition-all duration-300 cursor-pointer">
              Shop Now
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
      className="w-full min-h-[80vh] bg-white py-12 md:py-16 px-5 sm:px-8 lg:px-12 xl:px-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cart Page Title and Layout Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-[#eadfd4] gap-4">
          <h1 className="text-3xl font-bold text-[#6C2C12]">
            Shopping Cart
          </h1>
          
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F7EEE8] p-1 rounded-lg border border-[#eadfd4] self-start sm:self-auto">
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
        </div>

        <div className="w-full space-y-6">
          {layoutMode === "list" ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#eadfd4] overflow-hidden">
              {/* Desktop Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-[#F7EEE8] text-[#6C2C12] font-semibold text-sm uppercase tracking-wider">
                <div className="col-span-5">Product Details</div>
                <div className="col-span-2 text-center">Price</div>
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
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-6 items-center bg-white"
                    >
                      {/* Product Info */}
                      <div className="col-span-1 sm:col-span-5 flex items-center gap-4">
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

                      {/* Quantity */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center">
                        <span className="sm:hidden text-gray-500 font-medium">Quantity:</span>
                        <div className="flex items-center border border-[#eadfd4] rounded-lg bg-[#F7EEE8] overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-2 py-1 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsDash className="text-xs" />
                          </button>
                          <span className="px-3 py-0.5 text-xs font-semibold text-[#6C2C12] min-w-8 text-center bg-white">
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

                      {/* WhatsApp and Call Buttons inside list columns */}
                      <div className="col-span-1 sm:col-span-2 flex justify-between sm:justify-center items-center gap-2">
                        <span className="sm:hidden text-gray-500 font-medium">Inquire:</span>
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20(Qty:%20${item.quantity || 1})%20for%20₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`}
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
            <motion.div 
              variants={containerVariants}
              initial={hasAnimated ? "show" : "hidden"}
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
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
                      title="Remove item"
                    >
                      <BsTrash className="text-sm" />
                    </button>

                    {/* Product Info */}
                    <Link to={`/product/${item.id}`} className="aspect-square w-full rounded-t-xl sm:rounded-lg overflow-hidden border-b sm:border border-[#eadfd4] sm:mb-4 bg-[#FFF9F5] group block">
                      <img src={item.img} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </Link>

                    <div className="p-4 sm:p-0 flex flex-col flex-1">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-bold text-[#6C2C12] transition-colors text-base cursor-pointer">{item.title || item.category}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Product ID: #{item.id}</p>

                      <div className="flex justify-between items-center mt-2 mb-3 text-sm">
                        <span className="text-gray-500">Unit Price:</span>
                        <span className="text-[#6C2C12] font-semibold">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between border-t border-b border-[#eadfd4] py-3 mb-4">
                        <span className="text-sm text-gray-500 font-medium">Quantity:</span>
                        <div className="flex items-center border border-[#eadfd4] rounded-lg bg-[#F7EEE8] overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-2.5 py-1.5 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsDash className="text-sm" />
                          </button>
                          <span className="px-3 py-1 text-sm font-semibold text-[#6C2C12] min-w-8 text-center bg-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-2.5 py-1.5 hover:bg-[#eadfd4] text-[#6C2C12] transition-colors cursor-pointer"
                          >
                            <BsPlus className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Inquiry buttons and Total */}
                      <div className="mt-auto pt-2 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Total:</span>
                          <span className="text-[#6C2C12] font-bold text-lg">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/919876543210?text=Hi,%20I'm%20interested%20in%20buying%20${encodeURIComponent(item.title || item.category)}%20(Qty:%20${item.quantity || 1})%20for%20₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`}
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Cart Bottom Actions & Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-[#eadfd4] mt-6 px-2">
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#6C2C12] hover:underline flex items-center gap-2 transition-colors order-2 sm:order-1"
          >
            ← Continue Shopping
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto order-1 sm:order-2">
            <div className="flex items-center gap-4 text-[#6C2C12]">
              <span className="text-base font-semibold">Subtotal:</span>
              <span className="text-2xl font-bold">₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Cart;