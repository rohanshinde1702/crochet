import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsShieldLock,
  BsCreditCard,
  BsCashCoin,
  BsPhone,
  BsTag,
  BsTruck,
  BsLightningCharge,
  BsInfoCircle,
  BsTrash,
  BsPlus,
  BsDash,
  BsCheckCircleFill,
  BsQrCodeScan,
  BsX
} from "react-icons/bs";
import { LuHandHeart, LuLeaf, LuShoppingBag, LuSparkles } from "react-icons/lu";
import { saveCart } from "../utils/syncHelper";

const AVAILABLE_COUPONS = [
  {
    code: "COZY15",
    label: "15% OFF",
    desc: "15% artisan boutique discount",
    type: "percent",
    value: 0.15
  },
  {
    code: "COZY10",
    label: "10% OFF",
    desc: "10% handcrafted discount",
    type: "percent",
    value: 0.10
  },
  {
    code: "HANDMADE",
    label: "₹150 OFF",
    desc: "₹150 flat maker discount",
    type: "flat",
    value: 150
  },
  {
    code: "FREESHIP",
    label: "FREE SHIP",
    desc: "100% Free standard shipping",
    type: "shipping",
    value: 0
  }
];

const SAMPLE_DEMO_ITEMS = [
  {
    id: 1,
    title: "Handcrafted Baby Booties & Socks",
    price: 199,
    quantity: 1,
    img: "/uploads/products/kids/category-1.png"
  },
  {
    id: 2,
    title: "Radiant Sunshine Sunflower Stem",
    price: 399,
    quantity: 2,
    img: "/uploads/products/decor/category-1.png"
  },
  {
    id: 11,
    title: "Heirloom Hearts Woven Basket",
    price: 1199,
    quantity: 1,
    img: "/uploads/others/contact_hearts_basket.jpg"
  }
];

const generateOrderNumber = () => {
  return `CL-${Math.floor(100000 + (Date.now() % 900000))}`;
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join(" ");
};

const formatCardExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
};

const getCardBrand = (cardNumber) => {
  const clean = (cardNumber || "").replace(/\D/g, "");
  if (clean.startsWith("4")) return { name: "Visa", color: "bg-blue-600 text-white" };
  if (clean.startsWith("5") || clean.startsWith("2")) return { name: "Mastercard", color: "bg-amber-600 text-white" };
  if (clean.startsWith("6")) return { name: "RuPay", color: "bg-emerald-600 text-white" };
  if (clean.startsWith("3")) return { name: "Amex", color: "bg-cyan-600 text-white" };
  return null;
};

const Checkout = () => {
  const navigate = useNavigate();

  // Dynamic Cart state loaded from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      if (storedCart.length > 0) return storedCart;
      return SAMPLE_DEMO_ITEMS.slice(0, 2);
    } catch {
      return SAMPLE_DEMO_ITEMS.slice(0, 2);
    }
  });

  const [shippingMethod, setShippingMethod] = useState("standard"); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'cod' | 'upi'
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState({ type: "", message: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // UPI payment simulation states
  const [upiId, setUpiId] = useState("");
  const [showUpiQr, setShowUpiQr] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    orderNotes: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: ""
  });

  const [errors, setErrors] = useState({});

  // Pricing calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
  }, [cartItems]);

  const freeShippingUnlocked = subtotal >= 999 || appliedCoupon?.type === "shipping";
  const standardCost = freeShippingUnlocked ? 0 : 79;
  const expressCost = freeShippingUnlocked ? 49 : 129;
  const shippingCost = shippingMethod === "express" ? expressCost : standardCost;

  const appliedDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return Math.round(subtotal * appliedCoupon.value);
    }
    if (appliedCoupon.type === "flat") {
      return Math.min(subtotal, appliedCoupon.value);
    }
    return 0;
  }, [subtotal, appliedCoupon]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - appliedDiscount + shippingCost);
  }, [subtotal, appliedDiscount, shippingCost]);

  // Sync cart from window events
  useEffect(() => {
    const handleCartSync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(stored);
      } catch {
        // ignore
      }
    };
    window.addEventListener("cartUpdated", handleCartSync);
    return () => window.removeEventListener("cartUpdated", handleCartSync);
  }, []);

  // Update cart state and persistence
  const updateCartState = (newItems) => {
    setCartItems(newItems);
    saveCart(newItems);
  };

  const handleQuantityChange = (id, delta) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const nextQty = (item.quantity || 1) + delta;
        return { ...item, quantity: Math.max(1, nextQty) };
      }
      return item;
    });
    updateCartState(updated);
  };

  const handleRemoveItem = (id) => {
    const removed = cartItems.find((i) => i.id === id);
    const updated = cartItems.filter((i) => i.id !== id);
    updateCartState(updated);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: `Removed ${removed?.title || "item"} from checkout.`
        }
      })
    );
  };

  const handleLoadSampleCart = () => {
    updateCartState(SAMPLE_DEMO_ITEMS);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: {
          message: "Loaded sample handcrafted pieces into your checkout!"
        }
      })
    );
  };

  // Prefill address/contact from localStorage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const savedAddress = JSON.parse(localStorage.getItem("cozyloops_saved_address"));
      const user = JSON.parse(localStorage.getItem("user"));

      const timer = setTimeout(() => {
        if (savedAddress) {
          setFormData((prev) => ({ ...prev, ...savedAddress }));
        } else if (user && user.email) {
          setFormData((prev) => ({
            ...prev,
            email: user.email,
            firstName: user.name ? user.name.split(" ")[0] : "Artisan",
            lastName: user.name ? user.name.split(" ").slice(1).join(" ") : "Collector"
          }));
        }
      }, 0);
      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "cardExpiry") {
      formattedValue = formatCardExpiry(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Instant 1-Click Demo Fill for reviewers & testing
  const handleAutoFillDemo = () => {
    setFormData({
      firstName: "Aarav",
      lastName: "Patel",
      email: "aarav.patel@example.com",
      phone: "+91 98765 43210",
      address: "42 Lotus Blossom Lane, Bandra West",
      apartment: "Apartment 4B, Sunflower Residency",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400050",
      country: "India",
      orderNotes: "Please gift wrap with rustic brown paper and a sprig of dried lavender!",
      cardNumber: "4532 8920 1142 8842",
      cardExpiry: "08/28",
      cardCvv: "842",
      cardName: "Aarav Patel"
    });
    setUpiId("aarav.patel@okhdfcbank");
    setErrors({});
    if (cartItems.length === 0) {
      updateCartState(SAMPLE_DEMO_ITEMS.slice(0, 2));
    }
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Demo shipping & payment details populated!" }
      })
    );
  };

  // Apply Coupon Logic
  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      setCouponStatus({ type: "error", message: "Please enter a promo code." });
      return;
    }

    const matched = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (matched) {
      setAppliedCoupon(matched);
      setCouponStatus({
        type: "success",
        message: `Coupon '${matched.code}' applied: ${matched.desc}!`
      });
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Coupon ${matched.code} applied successfully!` }
        })
      );
    } else {
      setCouponStatus({
        type: "error",
        message: "Invalid code. Try 'COZY15', 'COZY10', or 'HANDMADE'."
      });
    }
  };

  const handleQuickApplyCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setAppliedCoupon(coupon);
    setCouponStatus({
      type: "success",
      message: `Coupon '${coupon.code}' applied: ${coupon.desc}!`
    });
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: `Applied coupon ${coupon.code}!` }
      })
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponStatus({ type: "", message: "" });
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Coupon removed." }
      })
    );
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "PIN / Postal code is required";

    if (paymentMethod === "card") {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number required";
      if (!formData.cardExpiry.trim()) newErrors.cardExpiry = "Expiry required";
      if (!formData.cardCvv.trim()) newErrors.cardCvv = "CVV required";
      if (!formData.cardName.trim()) newErrors.cardName = "Cardholder name required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place Order Action
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Your cart is empty. Please add pieces before ordering." }
        })
      );
      return;
    }

    if (!validateForm()) {
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Please fill in all required shipping fields." }
        })
      );
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const orderNumber = generateOrderNumber();
    const cardBrand = getCardBrand(formData.cardNumber);

    const newOrder = {
      orderId: orderNumber,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      createdAt: new Date().toISOString(),
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.apartment ? formData.apartment + ", " : ""}${formData.city}, ${formData.state} - ${formData.zipCode}, ${formData.country}`
      },
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        img: item.img
      })),
      pricing: {
        subtotal,
        discount: appliedDiscount,
        shipping: shippingCost,
        total: grandTotal
      },
      shippingMethod:
        shippingMethod === "express"
          ? "Priority Craft Express Delivery"
          : "Standard Artisan Delivery",
      paymentMethod:
        paymentMethod === "card"
          ? `Credit/Debit Card (${cardBrand?.name || "Card"} •••• ${formData.cardNumber.slice(-4) || "8842"})`
          : paymentMethod === "cod"
          ? "Cash on Delivery"
          : `UPI (${upiId || "user@upi"})`,
      status: "Processing",
      notes: formData.orderNotes || ""
    };

    // Save order in localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem("cozyloops_orders")) || [];
      const userOrders = JSON.parse(localStorage.getItem("customer_orders")) || [];
      localStorage.setItem("cozyloops_orders", JSON.stringify([newOrder, ...existingOrders]));
      localStorage.setItem("customer_orders", JSON.stringify([newOrder, ...userOrders]));
      localStorage.setItem("last_order", JSON.stringify(newOrder));

      // Persist address if enabled
      if (saveAddressForFuture) {
        localStorage.setItem(
          "cozyloops_saved_address",
          JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          })
        );
      }

      // Prepend dynamic alert into Admin Panel notifications
      const existingNotifs = JSON.parse(localStorage.getItem("cozyloops_admin_notifications")) || [];
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: "order",
        title: `New Order #${orderNumber}`,
        description: `${formData.firstName} ${formData.lastName} placed order for ${cartItems.length} items (₹${grandTotal.toLocaleString("en-IN")}).`,
        time: "Just now",
        read: false,
        link: "/admin/orders",
        badge: "New Order",
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      };
      localStorage.setItem("cozyloops_admin_notifications", JSON.stringify([newNotif, ...existingNotifs]));

      // Clear Cart
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("ordersUpdated"));
    } catch (err) {
      console.error(err);
    }

    setIsProcessing(false);
    navigate(`/order-success/${orderNumber}`, { state: { order: newOrder } });
  };

  const cardBrand = getCardBrand(formData.cardNumber);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#6C2C12] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#6C2C12] transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#6C2C12]">Checkout</span>
        </div>

        {/* Header with Title & Quick Demo Fill Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-[#EADFD4] gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6C2C12]">
              Handcrafted Checkout
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Dynamic real-time checkout for lovingly stitched artisan creations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {cartItems.length === 0 && (
              <button
                type="button"
                onClick={handleLoadSampleCart}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] hover:bg-[#FAF3EB] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LuSparkles className="text-[#F88897]" />
                <span>Load Sample Items</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F88897]/15 text-[#6C2C12] hover:bg-[#F88897] hover:text-white border border-[#F88897]/40 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer group"
              title="Auto-fill with sample address & payment data"
            >
              <BsLightningCharge className="text-[#F88897] group-hover:text-white transition-colors" />
              <span>Fill Demo Details</span>
            </button>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left 7 Columns: Checkout Details Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Section 1: Customer Contact */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#6C2C12] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6C2C12] text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Contact Information
                  </h2>
                  <Link
                    to="/signin"
                    className="text-xs font-semibold text-[#F88897] hover:underline"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                        errors.email
                          ? "border-red-500 bg-red-50/30"
                          : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                        errors.phone
                          ? "border-red-500 bg-red-50/30"
                          : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs">
                <h2 className="text-lg font-bold text-[#6C2C12] flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#6C2C12] text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Aarav"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.firstName
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Patel"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.lastName
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="42 Lotus Blossom Lane, Bandra West"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                        errors.address
                          ? "border-red-500 bg-red-50/30"
                          : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Apartment 4B, Sunflower Residency"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40 text-sm focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Mumbai"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.city
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Maharashtra"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.state
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.state && (
                        <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        PIN / Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="400050"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.zipCode
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Save address toggle */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="accent-[#6C2C12] w-4 h-4 rounded"
                    />
                    <span>Save this address for future handcrafted orders</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Delivery Method */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#6C2C12] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6C2C12] text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Delivery Method
                  </h2>
                  {freeShippingUnlocked && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Free Standard Delivery Qualified
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingMethod === "standard"
                        ? "border-[#6C2C12] bg-[#FAF6F0]/60 shadow-xs"
                        : "border-[#EADFD4] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="accent-[#6C2C12] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-[#6C2C12] text-sm">
                          Standard Artisan Delivery
                        </div>
                        <div className="text-xs text-gray-500">
                          Carefully packaged in kraft paper · 4–6 business days
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {standardCost === 0 ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          Free
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-[#6C2C12]">₹{standardCost}</span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingMethod === "express"
                        ? "border-[#6C2C12] bg-[#FAF6F0]/60 shadow-xs"
                        : "border-[#EADFD4] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="accent-[#6C2C12] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-[#6C2C12] text-sm flex items-center gap-1.5">
                          Priority Craft Express
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F88897] text-white">
                            Faster
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Dispatched within 24 hours with priority tracking · 2–3 business days
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#6C2C12]">₹{expressCost}</span>
                      {freeShippingUnlocked && (
                        <span className="block text-[10px] text-emerald-700 font-semibold line-through">
                          ₹129
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 4: Payment Details */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs">
                <h2 className="text-lg font-bold text-[#6C2C12] flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#6C2C12] text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Payment Method
                </h2>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#FAF6F0] rounded-xl border border-[#EADFD4] mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === "card"
                        ? "bg-white text-[#6C2C12] shadow-xs"
                        : "text-gray-500 hover:text-[#6C2C12]"
                    }`}
                  >
                    <BsCreditCard className="text-base" /> Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === "cod"
                        ? "bg-white text-[#6C2C12] shadow-xs"
                        : "text-gray-500 hover:text-[#6C2C12]"
                    }`}
                  >
                    <BsCashCoin className="text-base" /> COD
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === "upi"
                        ? "bg-white text-[#6C2C12] shadow-xs"
                        : "text-gray-500 hover:text-[#6C2C12]"
                    }`}
                  >
                    <BsPhone className="text-base" /> UPI
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="4532 8920 1142 8842"
                          maxLength={19}
                          className={`w-full px-3.5 py-2.5 pr-22 rounded-lg border text-sm focus:outline-none transition-all ${
                            errors.cardNumber
                              ? "border-red-500 bg-red-50/30"
                              : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                          {cardBrand ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cardBrand.color}`}>
                              {cardBrand.name}
                            </span>
                          ) : (
                            <BsCreditCard className="text-gray-400 text-base" />
                          )}
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          name="cardExpiry"
                          maxLength={5}
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="08/28"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                            errors.cardExpiry
                              ? "border-red-500 bg-red-50/30"
                              : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                          }`}
                        />
                        {errors.cardExpiry && (
                          <p className="text-xs text-red-500 mt-1">{errors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          name="cardCvv"
                          maxLength={4}
                          value={formData.cardCvv}
                          onChange={handleChange}
                          placeholder="•••"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                            errors.cardCvv
                              ? "border-red-500 bg-red-50/30"
                              : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                          }`}
                        />
                        {errors.cardCvv && (
                          <p className="text-xs text-red-500 mt-1">{errors.cardCvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Aarav Patel"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition-all ${
                          errors.cardName
                            ? "border-red-500 bg-red-50/30"
                            : "border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40"
                        }`}
                      />
                      {errors.cardName && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* COD Info */}
                {paymentMethod === "cod" && (
                  <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADFD4] text-xs sm:text-sm text-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#6C2C12] flex items-center gap-1.5">
                        <BsCashCoin className="text-base text-emerald-600" />
                        <span>Cash on Delivery</span>
                      </p>
                      <span className="text-xs font-bold text-[#6C2C12]">
                        Payable at Door: ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      No advance payment needed. Hand cash or scan courier&apos;s UPI QR upon receiving your parcel.
                    </p>
                  </div>
                )}

                {/* UPI Info */}
                {paymentMethod === "upi" && (
                  <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADFD4] text-xs sm:text-sm text-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#6C2C12] flex items-center gap-1.5">
                        <BsPhone className="text-base text-[#F88897]" />
                        <span>Instant UPI Payment</span>
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Simulated Live
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#EADFD4] focus:border-[#6C2C12] bg-white text-xs sm:text-sm focus:outline-none"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-gray-500 font-medium">Quick handles:</span>
                        {["@okhdfcbank", "@okaxis", "@paytm", "@ybl"].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const prefix = upiId.includes("@") ? upiId.split("@")[0] : upiId || "artisan";
                              setUpiId(`${prefix}${suffix}`);
                            }}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#EADFD4] text-[10px] font-bold text-[#6C2C12] hover:bg-[#FAF0E8] transition-colors cursor-pointer"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic QR Code toggle */}
                    <div className="pt-2 border-t border-[#EADFD4]">
                      <button
                        type="button"
                        onClick={() => setShowUpiQr(!showUpiQr)}
                        className="text-xs font-bold text-[#6C2C12] hover:text-[#F88897] flex items-center gap-1.5 cursor-pointer"
                      >
                        <BsQrCodeScan className="text-sm" />
                        <span>{showUpiQr ? "Hide QR Code" : "Or Click to Scan Dynamic QR Code"}</span>
                      </button>

                      {showUpiQr && (
                        <div className="mt-3 p-4 bg-white rounded-xl border border-[#EADFD4] text-center space-y-2 max-w-xs mx-auto shadow-xs">
                          <div className="w-36 h-36 mx-auto bg-[#FAF6F0] rounded-xl border-2 border-dashed border-[#D8C2B0] flex flex-col items-center justify-center p-2">
                            <BsQrCodeScan className="text-5xl text-[#6C2C12] mb-1" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              UPI Demo QR
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[#6C2C12]">
                            Scan & Pay ₹{grandTotal.toLocaleString("en-IN")}
                          </div>
                          <p className="text-[10px] text-gray-500">
                            Accepts Google Pay, PhonePe, Paytm, and BHIM UPI.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Special Notes for the Artisan (Optional)
                </label>
                <textarea
                  name="orderNotes"
                  rows={3}
                  value={formData.orderNotes}
                  onChange={handleChange}
                  placeholder="e.g. Please include a gift card saying 'Happy Birthday Mom!' or specific yarn color preference."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADFD4] focus:border-[#6C2C12] bg-[#FAF6F0]/40 text-sm focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Right 5 Columns: Dynamic Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-[#6C2C12] pb-4 border-b border-[#EADFD4] flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items)
                  </span>
                </h2>

                {/* Free Shipping Dynamic Meter */}
                <div className="my-4 p-3 rounded-xl bg-[#FAF0E8] border border-[#EADFD4] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#6C2C12] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <BsTruck className="text-[#F88897]" />
                      {freeShippingUnlocked ? (
                        <span className="text-emerald-700">Free Standard Delivery Unlocked!</span>
                      ) : (
                        <span>
                          Add <strong className="text-[#F88897]">₹{Math.max(0, 999 - subtotal)}</strong> more for Free Shipping
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      {Math.min(100, Math.round((subtotal / 999) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EADFD4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F88897] to-[#6C2C12] transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                {cartItems.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-3 bg-[#FAF6F0]/60 rounded-xl border border-dashed border-[#D8C2B0]">
                    <div className="w-10 h-10 rounded-full bg-[#FAF0E8] text-[#F88897] mx-auto flex items-center justify-center text-lg">
                      <LuShoppingBag />
                    </div>
                    <p className="text-xs font-bold text-[#6C2C12]">Your Checkout Cart is Empty</p>
                    <button
                      type="button"
                      onClick={handleLoadSampleCart}
                      className="px-3.5 py-1.5 rounded-lg bg-[#6C2C12] text-white text-xs font-bold hover:bg-[#F88897] transition-colors cursor-pointer shadow-xs"
                    >
                      Load Sample Items
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2ECE4] max-h-72 overflow-y-auto py-2 pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-center gap-3.5 py-3">
                        <div className="relative w-14 h-14 rounded-lg bg-[#FAF6F0] border border-[#EADFD4] shrink-0 overflow-hidden">
                          <img
                            src={item.img}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/uploads/products/decor/category-1.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#6C2C12] truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ₹{item.price?.toLocaleString("en-IN")} each
                          </p>

                          {/* Dynamic Quantity Controls */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center border border-[#EADFD4] rounded-md bg-[#FAF6F0] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="px-2 py-0.5 hover:bg-[#EADFD4] text-[#6C2C12] transition-colors cursor-pointer text-xs"
                                title="Decrease quantity"
                              >
                                <BsDash />
                              </button>
                              <span className="px-2 py-0.5 text-xs font-bold text-[#6C2C12] bg-white min-w-5 text-center">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="px-2 py-0.5 hover:bg-[#EADFD4] text-[#6C2C12] transition-colors cursor-pointer text-xs"
                                title="Increase quantity"
                              >
                                <BsPlus />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <BsTrash className="text-xs" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-[#6C2C12]">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Promo Code Input & Quick Apply Chips */}
                <div className="pt-4 pb-2 border-t border-[#EADFD4]">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <BsTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#EADFD4] bg-[#FAF6F0]/40 text-xs sm:text-sm uppercase focus:outline-none focus:border-[#6C2C12]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-[#6C2C12] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#F88897] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Available Coupon Chips */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Available Artisan Coupons:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_COUPONS.map((coupon) => {
                        const isApplied = appliedCoupon?.code === coupon.code;
                        return (
                          <button
                            key={coupon.code}
                            type="button"
                            onClick={() => handleQuickApplyCoupon(coupon)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                              isApplied
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-[#FAF6F0] hover:bg-[#FAF0E8] text-[#6C2C12] border-[#EADFD4]"
                            }`}
                          >
                            <span>{coupon.code}</span>
                            <span className="text-[9px] opacity-75 font-normal">({coupon.label})</span>
                            {isApplied && <BsCheckCircleFill className="text-[9px]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Applied Coupon Badge */}
                  {appliedCoupon && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                      <span className="flex items-center gap-1.5 font-bold">
                        <BsTag className="text-emerald-600" />
                        <span>{appliedCoupon.code} applied ({appliedCoupon.desc})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-700 hover:text-red-500 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                      >
                        <BsX className="text-sm" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}

                  {couponStatus.message && !appliedCoupon && (
                    <p
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        couponStatus.type === "success"
                          ? "text-emerald-700 font-semibold"
                          : "text-red-500"
                      }`}
                    >
                      <BsInfoCircle /> {couponStatus.message}
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-[#EADFD4] text-xs sm:text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#6C2C12]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({appliedCoupon?.code})</span>
                      <span>-₹{appliedDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-semibold uppercase text-xs">
                          Free
                        </span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Estimated Taxes (Included)</span>
                    <span>₹0</span>
                  </div>

                  <div className="flex justify-between text-base sm:text-lg font-bold text-[#6C2C12] pt-3 border-t border-[#EADFD4]">
                    <span>Total</span>
                    <span className="text-xl sm:text-2xl text-[#6C2C12]">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full mt-6 py-3.5 px-6 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Handcrafted Order...</span>
                    </>
                  ) : (
                    <>
                      <BsShieldLock className="text-base" />
                      <span>Place Order • ₹{grandTotal.toLocaleString("en-IN")}</span>
                    </>
                  )}
                </button>

                {/* Guarantees */}
                <div className="mt-6 pt-5 border-t border-[#EADFD4] space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <LuHandHeart className="text-base text-[#F88897] shrink-0" />
                    <span>100% Handcrafted by verified artisan knitters</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <LuLeaf className="text-base text-emerald-600 shrink-0" />
                    <span>Eco-friendly, plastic-free biodegradable packing</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <BsTruck className="text-base text-[#6C2C12] shrink-0" />
                    <span>Free shipping on orders ₹999 and above</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
