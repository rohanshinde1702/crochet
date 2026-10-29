import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsCheckCircleFill,
  BsPrinter,
  BsTruck,
  BsBagCheck,
  BsArrowRight,
  BsGeoAlt,
  BsEnvelope,
  BsTelephone,
  BsShieldCheck
} from "react-icons/bs";
import { LuHeart, LuSparkles } from "react-icons/lu";

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Retrieve order from route state or localStorage
    if (location.state?.order) {
      setOrder(location.state.order);
      return;
    }

    try {
      const lastOrder = JSON.parse(localStorage.getItem("last_order"));
      if (lastOrder && (!id || lastOrder.orderId === id)) {
        setOrder(lastOrder);
        return;
      }

      // Check in orders array
      const allOrders = JSON.parse(localStorage.getItem("cozyloops_orders")) || [];
      const found = allOrders.find((o) => o.orderId === id || o.id === id);
      if (found) {
        setOrder(found);
        return;
      }
    } catch {
      // Fallback
    }

    // Default demo order if visited directly without state
    setOrder({
      orderId: id || "CL-284910",
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      customer: {
        name: "Aarav Patel",
        email: "aarav.patel@example.com",
        phone: "+91 98765 43210",
        address: "42 Lotus Blossom Lane, Bandra West, Mumbai, Maharashtra - 400050, India"
      },
      items: [
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
          img: "/uploads/products/decor/sunflower.png"
        }
      ],
      pricing: {
        subtotal: 997,
        discount: 100,
        shipping: 0,
        total: 897
      },
      shippingMethod: "Standard Artisan Delivery",
      paymentMethod: "Credit Card (•••• 8842)",
      status: "Confirmed & In Production"
    });
  }, [id, location.state]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl">
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#EADFD4] shadow-sm p-6 sm:p-10 md:p-12 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="text-center pb-8 border-b border-[#EADFD4]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
              className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-4xl shadow-xs mb-5"
            >
              <BsCheckCircleFill />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F88897]/15 text-[#6C2C12] mb-3">
              <LuSparkles className="text-[#F88897]" /> Order Successfully Placed
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#6C2C12]">
              Thank You for Supporting Handcrafted!
            </h1>

            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
              We&apos;ve received your order. Our artisan knitters are carefully prepping the soft yarn to weave your pieces with love.
            </p>

            <div className="mt-4 text-xs sm:text-sm font-mono text-gray-500">
              Confirmation receipt sent to:{" "}
              <strong className="text-[#6C2C12]">{order.customer?.email}</strong>
            </div>
          </div>

          {/* Order Details Header Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-[#EADFD4] bg-[#FAF6F0]/40 rounded-2xl p-4 my-8">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Order Number
              </div>
              <div className="text-sm sm:text-base font-bold text-[#6C2C12] mt-0.5 font-mono">
                #{order.orderId}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Order Date
              </div>
              <div className="text-sm sm:text-base font-semibold text-[#6C2C12] mt-0.5">
                {order.date}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Payment Method
              </div>
              <div className="text-sm sm:text-base font-semibold text-[#6C2C12] mt-0.5 truncate">
                {order.paymentMethod || "Credit Card"}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                Status
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {order.status || "Confirmed"}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="space-y-4 mb-8">
            <h2 className="text-base font-bold text-[#6C2C12] flex items-center gap-2">
              <BsBagCheck /> Items in Your Package
            </h2>

            <div className="divide-y divide-[#F2ECE4] border-t border-b border-[#EADFD4]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3.5 gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-lg border border-[#EADFD4] bg-[#FAF6F0] shrink-0"
                      onError={(e) => {
                        e.target.src = "/uploads/products/decor/sunflower.png";
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#6C2C12] truncate">
                        {item.title}
                      </h4>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-[#6C2C12] shrink-0">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Columns: Delivery Address & Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-[#EADFD4]">
            {/* Delivery Details */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0]/60 border border-[#EADFD4] space-y-2 text-xs sm:text-sm text-gray-600">
              <h3 className="font-bold text-[#6C2C12] flex items-center gap-1.5 text-sm mb-2">
                <BsGeoAlt /> Shipping Address
              </h3>
              <p className="font-semibold text-gray-800">{order.customer?.name}</p>
              <p className="leading-relaxed">{order.customer?.address}</p>
              <p className="flex items-center gap-2 pt-1 text-gray-500">
                <BsTelephone /> {order.customer?.phone}
              </p>
              <div className="pt-2 text-xs text-[#6C2C12] font-semibold flex items-center gap-1.5">
                <BsTruck /> {order.shippingMethod || "Standard Delivery (5–7 Business Days)"}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0]/60 border border-[#EADFD4] space-y-2.5 text-xs sm:text-sm text-gray-600">
              <h3 className="font-bold text-[#6C2C12] text-sm mb-2">
                Payment Summary
              </h3>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#6C2C12]">
                  ₹{(order.pricing?.subtotal || order.pricing?.total || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.pricing.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.pricing?.shipping === 0 || !order.pricing?.shipping ? (
                    <span className="text-emerald-600 font-semibold uppercase text-xs">
                      Free
                    </span>
                  ) : (
                    `₹${order.pricing.shipping}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#6C2C12] pt-2 border-t border-[#EADFD4]">
                <span>Total Paid</span>
                <span className="text-lg">
                  ₹{(order.pricing?.total || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#EADFD4] hover:bg-[#FAF6F0] text-[#6C2C12] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <BsPrinter /> Print Receipt
              </button>

              <Link
                to={`/track-order?id=${order.orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                <BsTruck /> Track Order
              </Link>
            </div>

            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] flex items-center gap-1.5 transition-colors"
            >
              Continue Exploring Products <BsArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
