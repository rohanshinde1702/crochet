import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsSearch,
  BsTruck,
  BsCheckCircleFill,
  BsClockHistory,
  BsBoxSeam,
  BsGeoAlt,
  BsArrowLeft,
  BsWhatsapp,
  BsTelephone,
  BsShieldCheck
} from "react-icons/bs";
import { GiYarn, GiSewingNeedle } from "react-icons/gi";
import { LuHandHeart, LuLeaf, LuPackageCheck } from "react-icons/lu";

const SAMPLE_ORDERS = {
  "CL-284910": {
    orderId: "CL-284910",
    date: "26 Oct 2026",
    status: "In Transit",
    currentStep: 4, // 1 to 5
    estimatedDelivery: "30 Oct 2026",
    carrier: "Artisan Express Logistics",
    trackingNumber: "AEL-IN-984210",
    customer: {
      name: "Aarav Patel",
      city: "Mumbai, Maharashtra"
    },
    items: [
      {
        title: "Handmade Baby Booties & Socks",
        quantity: 1,
        img: "/uploads/products/kids/category-1.png"
      },
      {
        title: "Radiant Sunshine Sunflower Stem",
        quantity: 2,
        img: "/uploads/products/decor/sunflower.png"
      }
    ],
    timeline: [
      {
        title: "Order Placed & Confirmed",
        time: "26 Oct 2026, 10:30 AM",
        desc: "Order verified and assigned to master crochet artisan.",
        completed: true
      },
      {
        title: "Artisan Stitching & Handcrafting",
        time: "27 Oct 2026, 02:15 PM",
        desc: "Each stitch hand-knitted using 100% premium soft cotton yarn.",
        completed: true
      },
      {
        title: "Quality Check & Eco Packaging",
        time: "28 Oct 2026, 09:45 AM",
        desc: "Passed softness test and wrapped in biodegradable rustic packaging.",
        completed: true
      },
      {
        title: "Dispatched & In Transit",
        time: "28 Oct 2026, 04:30 PM",
        desc: "Package handed over to courier partner. On its way to your hub.",
        completed: true,
        current: true
      },
      {
        title: "Out for Delivery",
        time: "Expected by 30 Oct 2026",
        desc: "Artisan courier agent will deliver to your doorstep.",
        completed: false
      }
    ]
  },
  "CL-782910": {
    orderId: "CL-782910",
    date: "27 Oct 2026",
    status: "Artisan Stitching",
    currentStep: 2,
    estimatedDelivery: "02 Nov 2026",
    carrier: "Artisan Express Logistics",
    trackingNumber: "AEL-IN-773192",
    customer: {
      name: "Meera Sen",
      city: "Bengaluru, Karnataka"
    },
    items: [
      {
        title: "Custom Monogram Letter Keychain",
        quantity: 1,
        img: "/uploads/products/custom/letter-r.png"
      }
    ],
    timeline: [
      {
        title: "Order Placed & Confirmed",
        time: "27 Oct 2026, 11:00 AM",
        desc: "Custom order details and yarn shade finalized.",
        completed: true
      },
      {
        title: "Artisan Stitching & Handcrafting",
        time: "28 Oct 2026, 11:30 AM",
        desc: "Artisan currently crocheting monogram details.",
        completed: true,
        current: true
      },
      {
        title: "Quality Check & Eco Packaging",
        time: "Expected 29 Oct 2026",
        desc: "Double-stitch inspection & branded tag application.",
        completed: false
      },
      {
        title: "Dispatched & In Transit",
        time: "Expected 30 Oct 2026",
        desc: "Courier pickup and dispatch.",
        completed: false
      },
      {
        title: "Delivered With Love",
        time: "Expected 02 Nov 2026",
        desc: "Delivered to recipient address.",
        completed: false
      }
    ]
  }
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState(searchParams.get("id") || "");
  const [emailInput, setEmailInput] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = useCallback((idToSearch) => {
    const cleanId = (idToSearch || orderIdInput).trim().toUpperCase();
    if (!cleanId) return;

    // Check sample orders first
    if (SAMPLE_ORDERS[cleanId]) {
      setSearchedOrder(SAMPLE_ORDERS[cleanId]);
      setSearched(true);
      return;
    }

    // Check localStorage created orders
    try {
      const storedOrders = JSON.parse(localStorage.getItem("cozyloops_orders")) || [];
      const found = storedOrders.find(
        (o) => o.orderId?.toUpperCase() === cleanId || o.id?.toString() === cleanId
      );
      if (found) {
        // Synthesize timeline for custom created order
        const synthetic = {
          orderId: found.orderId,
          date: found.date,
          status: found.status || "In Production",
          currentStep: 3,
          estimatedDelivery: "5–7 Business Days",
          carrier: "Artisan Express Logistics",
          trackingNumber: `AEL-IN-${Math.floor(100000 + Math.random() * 900000)}`,
          customer: {
            name: found.customer?.name || "Customer",
            city: found.customer?.address || "Delivery Address"
          },
          items: found.items || [],
          timeline: [
            {
              title: "Order Placed & Verified",
              time: `${found.date}, 10:00 AM`,
              desc: "Payment confirmed. Artisan notified.",
              completed: true
            },
            {
              title: "Yarn Preparation & Knitting",
              time: `${found.date}, 02:00 PM`,
              desc: "Handcrafted stitches being assembled.",
              completed: true
            },
            {
              title: "Quality Check & Eco-Packaging",
              time: "In Progress",
              desc: "Checking dimensions, texture, and seam durability.",
              completed: true,
              current: true
            },
            {
              title: "Handed over to Courier",
              time: "Upcoming",
              desc: "Dispatched via Express Artisan Logistics.",
              completed: false
            },
            {
              title: "Delivered to Doorstep",
              time: "Upcoming",
              desc: "Package delivered to your home.",
              completed: false
            }
          ]
        };
        setSearchedOrder(synthetic);
        setSearched(true);
        return;
      }
    } catch {
      // Fallback
    }

    // Not found
    setSearchedOrder(null);
    setSearched(true);
  }, [orderIdInput]);

  // Auto search if id is in query params
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const idParam = searchParams.get("id");
    if (idParam) {
      setOrderIdInput(idParam);
      handleLookup(idParam);
    } else {
      // Default to sample order so page looks immediately interactive
      setSearchedOrder(SAMPLE_ORDERS["CL-284910"]);
      setSearched(true);
    }
  }, [searchParams, handleLookup]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleLookup(orderIdInput);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#6C2C12] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#6C2C12]">Track Order</span>
        </div>

        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-2">
            Real-Time Shipment Status
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
            Track Your Handcrafted Package
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Follow the journey of your crochet piece from the artisan&apos;s knitting needles to your doorstep.
          </p>

          {/* Quick Demo Order Chips for Reviewers */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-gray-500 font-semibold">Try sample orders:</span>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput("CL-284910");
                handleLookup("CL-284910");
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-[#EADFD4] text-[#6C2C12] font-mono font-bold hover:bg-[#F88897] hover:text-white transition-all cursor-pointer"
            >
              #CL-284910 (In Transit)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput("CL-782910");
                handleLookup("CL-782910");
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-[#EADFD4] text-[#6C2C12] font-mono font-bold hover:bg-[#F88897] hover:text-white transition-all cursor-pointer"
            >
              #CL-782910 (Stitching)
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#EADFD4] shadow-xs mb-10">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Order Number
              </label>
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. CL-284910"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADFD4] bg-[#FAF6F0]/40 text-sm uppercase focus:outline-none focus:border-[#6C2C12]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email / Phone (Optional)
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADFD4] bg-[#FAF6F0]/40 text-sm focus:outline-none focus:border-[#6C2C12]"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#6C2C12] hover:bg-[#F88897] text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <BsSearch /> Track
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        {searched && searchedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-[#EADFD4] shadow-sm p-6 sm:p-10 space-y-8"
          >
            {/* Shipment Summary Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFD4] gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Tracking Order
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#6C2C12] font-mono mt-0.5">
                  #{searchedOrder.orderId}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Recipient: <strong className="text-gray-700">{searchedOrder.customer?.name}</strong> • Destination: {searchedOrder.customer?.city}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  {searchedOrder.status}
                </span>
                <div className="text-xs text-gray-500">
                  Est. Delivery:{" "}
                  <strong className="text-[#6C2C12] font-bold">
                    {searchedOrder.estimatedDelivery}
                  </strong>
                </div>
              </div>
            </div>

            {/* Courier Info Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#EADFD4] text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Shipping Partner
                </span>
                <p className="font-bold text-[#6C2C12] mt-0.5">
                  {searchedOrder.carrier}
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  AWB Tracking Number
                </span>
                <p className="font-mono font-bold text-gray-800 mt-0.5">
                  {searchedOrder.trackingNumber}
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Packaging Type
                </span>
                <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <LuLeaf /> 100% Biodegradable
                </p>
              </div>
            </div>

            {/* Step Timeline */}
            <div>
              <h3 className="text-base font-bold text-[#6C2C12] mb-6 flex items-center gap-2">
                <BsClockHistory /> Tracking Milestones
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EADFD4]">
                {searchedOrder.timeline?.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <span
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step.current
                          ? "bg-[#F88897] border-[#F88897] text-white ring-4 ring-[#F88897]/20"
                          : step.completed
                          ? "bg-[#6C2C12] border-[#6C2C12] text-white"
                          : "bg-white border-[#EADFD4] text-gray-400"
                      }`}
                    >
                      {step.completed ? <BsCheckCircleFill className="text-[10px]" /> : idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-sm font-bold ${
                            step.current
                              ? "text-[#F88897]"
                              : step.completed
                              ? "text-[#6C2C12]"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <span className="text-xs text-gray-400 font-mono">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Contents */}
            {searchedOrder.items?.length > 0 && (
              <div className="pt-6 border-t border-[#EADFD4]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Enclosed Items ({searchedOrder.items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#EADFD4] bg-[#FAF6F0]/40"
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg border border-[#EADFD4]"
                        onError={(e) => {
                          e.target.src = "/uploads/products/decor/sunflower.png";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#6C2C12] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Not Found State */}
        {searched && !searchedOrder && (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#EADFD4] p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mb-4">
              <BsBoxSeam />
            </div>
            <h3 className="text-lg font-bold text-[#6C2C12]">
              Order Not Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find an order matching #{orderIdInput}. Please verify your order number or test with one of the sample orders above.
            </p>
          </div>
        )}

        {/* Need Help Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 space-y-2">
          <p>Questions about your shipment?</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/contact" className="font-semibold text-[#6C2C12] hover:underline">
              Contact Support
            </Link>
            <span>•</span>
            <Link to="/faq" className="font-semibold text-[#6C2C12] hover:underline">
              Shipping FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
