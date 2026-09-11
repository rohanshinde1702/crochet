import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  LuArrowLeft,
  LuShoppingBag,
  LuClock,
  LuPackage,
  LuTruck,
  LuCheck,
  LuX,
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCreditCard,
  LuPrinter,
  LuCopy,
  LuSave,
  LuExternalLink,
  LuFileText
} from "react-icons/lu";
import { BsCheckCircle, BsXCircle, BsExclamationCircle } from "react-icons/bs";
import { API_ENDPOINTS, getAssetUrl } from "../../config/api";

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
    step: 1,
    desc: "Order has been placed and awaiting payment confirmation or processing.",
    icon: LuClock
  },
  Processing: {
    label: "Processing",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    dot: "bg-blue-500",
    step: 2,
    desc: "Order is confirmed and items are being hand-crafted and packaged.",
    icon: LuPackage
  },
  Shipped: {
    label: "Shipped",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    dot: "bg-purple-500",
    step: 3,
    desc: "Package has been dispatched and is in transit with courier.",
    icon: LuTruck
  },
  Delivered: {
    label: "Delivered",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
    step: 4,
    desc: "Order has been successfully delivered to customer.",
    icon: BsCheckCircle
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
    step: 0,
    desc: "Order was cancelled.",
    icon: BsXCircle
  }
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const isDark = outletContext.isDark ?? false;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable fields
  const [selectedStatus, setSelectedStatus] = useState("Processing");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_ENDPOINTS.ORDERS}/${id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
      setSelectedStatus(data.status || "Processing");
      setTrackingNumber(data.trackingNumber || "");
      setPaymentStatus(data.paymentStatus || "Paid");
      setAdminNotes(data.notes || "");
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus = selectedStatus) => {
    try {
      setSavingStatus(true);
      const res = await fetch(`${API_ENDPOINTS.ORDERS}/${order.orderId || id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber.trim(),
          paymentStatus,
          notes: adminNotes.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to update order");
      const updated = await res.json();

      setOrder(updated);
      setSelectedStatus(updated.status);

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Order status updated to "${newStatus}"!` }
        })
      );
    } catch (err) {
      alert(err.message || "Failed to save changes");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleCopyAddress = () => {
    if (!order?.shippingAddress) return;
    const addr = order.shippingAddress;
    const text = `${order.customer?.name || ""}\n${addr.street || ""}\n${addr.city || ""}, ${addr.state || ""} ${addr.postalCode || ""}\n${addr.country || "India"}\nPhone: ${order.customer?.phone || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Shipping address copied to clipboard!" }
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mx-auto border border-red-500/20">
          <BsExclamationCircle />
        </div>
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-gray-500">Could not find order ID "{id}".</p>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
        >
          <LuArrowLeft /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Link to="/admin/orders" className="hover:text-blue-500 flex items-center gap-1">
              <LuArrowLeft /> Orders
            </Link>
            <span>/</span>
            <span className={isDark ? "text-slate-300" : "text-gray-800 font-bold"}>
              {order.orderId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Order {order.orderId}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentConfig.color}`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${currentConfig.dot}`} />
              {currentConfig.label}
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Placed on <strong className="font-semibold">{order.date || new Date(order.createdAt).toLocaleDateString()}</strong> • {order.items?.length || 0} item(s)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-gray-50 border-[#E5E7EB] text-[#374151]"
            }`}
          >
            <LuPrinter className="text-sm" />
            <span>Print Invoice</span>
          </button>
          <Link
            to="/admin/orders"
            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-gray-50 border-[#E5E7EB] text-[#374151]"
            }`}
          >
            <LuArrowLeft className="text-sm" />
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      {order.status !== "Cancelled" && (
        <div
          className={`p-6 rounded-2xl border shadow-2xs ${
            isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
          }`}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">
            Order Fulfillment Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {steps.map((stepName, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = order.status === stepName;
              const StepIcon = STATUS_CONFIG[stepName].icon;

              return (
                <div
                  key={stepName}
                  onClick={() => {
                    setSelectedStatus(stepName);
                    handleUpdateStatus(stepName);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isCurrent
                      ? "border-blue-500 bg-blue-500/10 shadow-xs"
                      : isDone
                      ? isDark
                        ? "border-emerald-500/40 bg-emerald-500/5 text-slate-200"
                        : "border-emerald-500/30 bg-emerald-50/50 text-gray-800"
                      : isDark
                      ? "border-slate-800 bg-slate-900/40 text-gray-500 hover:border-slate-700"
                      : "border-gray-200 bg-gray-50/70 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-xs"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : isDark
                          ? "bg-slate-800 text-gray-400"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isDone && !isCurrent ? <LuCheck /> : <StepIcon />}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">Step {idx + 1}</span>
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-blue-500"
                        : isDone
                        ? isDark
                          ? "text-white"
                          : "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {stepName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {STATUS_CONFIG[stepName].desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Order Details & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Manual Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Manual Status & Tracking Control Panel */}
          <div
            className={`p-6 rounded-2xl border shadow-2xs space-y-5 ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <LuPackage className="text-blue-500" />
                  Manual Status & Delivery Settings
                </h3>
                <p className="text-xs text-gray-500">
                  Update customer order state, tracking number, and fulfillment notes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Status Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  <option value="Pending">Pending (Awaiting fulfillment)</option>
                  <option value="Processing">Processing (Handcrafting & packing)</option>
                  <option value="Shipped">Shipped (In transit)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  <option value="Paid">Paid (Verified)</option>
                  <option value="Pending">Pending (COD or awaiting payment)</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Courier Tracking Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  Courier / Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DTDC-98124971, BLUEDART-8829104"
                    className={`flex-1 px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500"
                        : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                  {trackingNumber && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(trackingNumber + " tracking")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3.5 py-2.5 border rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 ${
                        isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                      title="Search tracking on courier portal"
                    >
                      <LuExternalLink /> Track
                    </a>
                  )}
                </div>
              </div>

              {/* Admin / Fulfillment Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  Fulfillment Notes / Customer Instructions
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Handcrafted with pink velvet yarn. Handover to security if door locked."
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                  }`}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={savingStatus}
                onClick={() => handleUpdateStatus(selectedStatus)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <LuSave className="text-sm" />
                <span>{savingStatus ? "Saving Changes..." : "Save Order Changes"}</span>
              </button>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div
            className={`rounded-2xl border shadow-2xs overflow-hidden ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <LuShoppingBag className="text-blue-500" />
                Items Ordered ({order.items?.length || 0})
              </h3>
              <span className="text-xs text-gray-400 font-semibold">
                Subtotal: ₹{(order.subtotal || order.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDark
                        ? "bg-slate-900/60 border-slate-800 text-slate-400"
                        : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y text-xs ${
                    isDark ? "divide-slate-800" : "divide-[#F3F4F6]"
                  }`}
                >
                  {(order.items || []).map((item, idx) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <tr
                        key={item._id || item.id || idx}
                        className={isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50/50"}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getAssetUrl(item.img) || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=100"}
                              alt={item.title}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=100";
                              }}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-xs line-clamp-1">{item.title}</p>
                              <p className="text-[10px] text-gray-400">ID #{item.id || idx + 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 font-medium">
                          {item.category || "Handmade Crochet"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          x{item.quantity || 1}
                        </td>
                        <td className="py-3.5 px-6 text-right font-extrabold text-blue-500">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div
              className={`p-5 border-t space-y-2 text-xs ${
                isDark ? "border-slate-800 bg-slate-900/40" : "border-gray-100 bg-[#F9FAFB]"
              }`}
            >
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{(order.subtotal || order.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee || 0}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-800 text-sm font-extrabold">
                <span className={isDark ? "text-white" : "text-gray-900"}>Grand Total</span>
                <span className="text-blue-500 text-base">
                  ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Shipping Details */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div
            className={`p-6 rounded-2xl border shadow-2xs space-y-4 ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <LuUser className="text-blue-500 text-sm" /> Customer Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm flex items-center justify-center border border-blue-500/20 shrink-0">
                {(order.customer?.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{order.customer?.name || "Guest Customer"}</p>
                <p className="text-[11px] text-gray-400">Registered Customer</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 text-gray-400">
                <LuMail className="text-sm shrink-0" />
                <a
                  href={`mailto:${order.customer?.email}`}
                  className="truncate hover:text-blue-500 underline-offset-2 hover:underline"
                >
                  {order.customer?.email || "No email provided"}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <LuPhone className="text-sm shrink-0" />
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="hover:text-blue-500"
                >
                  {order.customer?.phone || "+91 98201 44521"}
                </a>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div
            className={`p-6 rounded-2xl border shadow-2xs space-y-4 ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <LuMapPin className="text-emerald-500 text-sm" /> Shipping Address
              </h3>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <LuCheck className="text-emerald-500" /> : <LuCopy />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="text-xs space-y-1 text-gray-400">
              <p className="font-bold text-gray-800 dark:text-gray-100">
                {order.customer?.name}
              </p>
              <p>{order.shippingAddress?.street || "124 Marine Drive"}</p>
              <p>
                {order.shippingAddress?.city || "Mumbai"},{" "}
                {order.shippingAddress?.state || "Maharashtra"}{" "}
                {order.shippingAddress?.postalCode || "400020"}
              </p>
              <p>{order.shippingAddress?.country || "India"}</p>
            </div>
          </div>

          {/* Payment Details Card */}
          <div
            className={`p-6 rounded-2xl border shadow-2xs space-y-4 ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <LuCreditCard className="text-purple-500 text-sm" /> Payment Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Method:</span>
                <span className="font-bold">{order.paymentMethod || "UPI Payment"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    order.paymentStatus === "Paid"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {order.paymentStatus || "Paid"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Charged:</span>
                <span className="font-extrabold text-blue-500">
                  ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
