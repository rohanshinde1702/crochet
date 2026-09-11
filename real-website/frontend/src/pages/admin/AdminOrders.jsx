import { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  BsSearch,
  BsShieldCheck,
  BsCheckCircle,
  BsXCircle
} from "react-icons/bs";
import {
  LuShoppingBag,
  LuDownload,
  LuEye,
  LuClock,
  LuPackage,
  LuTruck,
  LuX,
  LuExternalLink,
  LuMapPin,
  LuUser,
  LuPhone,
  LuMail,
  LuSave,
  LuCopy,
  LuCheck
} from "react-icons/lu";
import { API_ENDPOINTS, getAssetUrl } from "../../config/api";

const STATUS_OPTIONS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_BADGES = {
  Pending: {
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    dot: "bg-amber-500",
    icon: LuClock
  },
  Processing: {
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    dot: "bg-blue-500",
    icon: LuPackage
  },
  Shipped: {
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    dot: "bg-purple-500",
    icon: LuTruck
  },
  Delivered: {
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: BsCheckCircle
  },
  Cancelled: {
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    dot: "bg-rose-500",
    icon: BsXCircle
  }
};

const AdminOrders = () => {
  const { globalSearch, isDark } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Quick Order Detail
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalTracking, setModalTracking] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalPaymentStatus, setModalPaymentStatus] = useState("Paid");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.ORDERS);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load real orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    STATUS_OPTIONS.slice(1).forEach((st) => {
      counts[st] = orders.filter((o) => o.status === st).length;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = (globalSearch || searchQuery).toLowerCase().trim();
    return orders.filter((order) => {
      const matchSearch =
        q === "" ||
        order.orderId?.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.email?.toLowerCase().includes(q) ||
        order.items?.some((item) => item.title?.toLowerCase().includes(q));

      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, globalSearch, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId, newStatus, extra = {}) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId || o._id === orderId ? { ...o, ...updated, status: newStatus, ...extra } : o))
      );

      if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder._id === orderId)) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus, ...extra }));
      }

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Order ${orderId} status set to "${newStatus}"!` },
        })
      );
    } catch (err) {
      alert(err.message || "Could not update status");
    }
  };

  const handleOpenDetailModal = (order) => {
    setSelectedOrder(order);
    setModalTracking(order.trackingNumber || "");
    setModalNotes(order.notes || "");
    setModalPaymentStatus(order.paymentStatus || "Paid");
  };

  const handleSaveModalChanges = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await handleStatusChange(selectedOrder.orderId, selectedOrder.status, {
        trackingNumber: modalTracking.trim(),
        notes: modalNotes.trim(),
        paymentStatus: modalPaymentStatus
      });
      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Order details updated successfully!" },
        })
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyAddress = () => {
    if (!selectedOrder?.shippingAddress) return;
    const addr = selectedOrder.shippingAddress;
    const text = `${selectedOrder.customer?.name || ""}\n${addr.street || ""}\n${addr.city || ""}, ${addr.state || ""} ${addr.postalCode || ""}\n${addr.country || "India"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const csvContent =
      "Order ID,Customer,Email,Phone,Items Count,Total Amount,Status,Payment,Date,Tracking Number\n" +
      filteredOrders
        .map(
          (o) =>
            `${o.orderId},"${o.customer?.name || ""}","${o.customer?.email || ""}","${o.customer?.phone || ""}",${o.items?.length || 1},${o.totalAmount},${o.status},${o.paymentMethod},"${o.date || ""}",${o.trackingNumber || ""}`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Store Orders
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold flex items-center gap-1">
              <BsShieldCheck /> Live Database
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            View order details, manage delivery tracking, and manually switch status (Pending, Delivered, etc.)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                : "bg-white hover:bg-gray-50 border-[#E5E7EB] text-[#374151]"
            }`}
          >
            <LuDownload className="text-sm" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div
        className={`rounded-2xl border shadow-2xs overflow-hidden ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}
      >
        {/* Filter Tabs & Search */}
        <div
          className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB] bg-white"
          }`}
        >
          {/* Status Tabs */}
          <div
            className={`inline-flex p-1 rounded-xl text-xs font-semibold overflow-x-auto ${
              isDark ? "bg-slate-900 border border-slate-800" : "bg-gray-100"
            }`}
          >
            {STATUS_OPTIONS.map((status) => {
              const count = statusCounts[status] || 0;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? isDark
                        ? "bg-slate-800 text-white shadow-2xs font-bold"
                        : "bg-white text-[#111827] shadow-2xs font-bold"
                      : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "bg-slate-800 text-gray-400"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, customer, item..."
              className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500"
                  : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
              }`}
            />
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>

        {/* Table */}
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
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Manual Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-slate-800" : "divide-[#F3F4F6]"
              }`}
            >
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="font-medium">Loading orders database...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <LuShoppingBag className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No orders found</p>
                    <p className="text-xs text-gray-500">
                      Try adjusting your search filters or status tab.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_BADGES[order.status] || STATUS_BADGES.Processing;
                  return (
                    <tr
                      key={order.orderId || order._id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-5 font-bold">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(order)}
                          className="text-blue-500 hover:text-blue-400 font-mono font-bold hover:underline cursor-pointer"
                          title="View Order Details"
                        >
                          {order.orderId}
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {order.customer?.name || "Customer"}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                          {order.customer?.email}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 font-semibold text-gray-400">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-[11px] text-gray-600 dark:text-gray-300 font-bold">
                          {order.items?.length || 1} item{order.items?.length > 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{order.paymentMethod || "UPI"}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              order.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"
                            }`}
                          >
                            ● {order.paymentStatus || "Paid"}
                          </span>
                        </div>
                      </td>

                      {/* Manual Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-full border cursor-pointer transition-all focus:outline-none ${statusInfo.badge}`}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Processing">📦 Processing</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Delivered">✅ Delivered</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {order.date || new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(order)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              isDark
                                ? "border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-blue-400"
                                : "border-gray-200 bg-white hover:bg-blue-50 text-blue-600"
                            }`}
                            title="Quick View Details"
                          >
                            <LuEye className="text-sm" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                          <Link
                            to={`/admin/orders/${order.orderId}`}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center transition-colors ${
                              isDark
                                ? "border-slate-700 hover:bg-slate-800 text-gray-400 hover:text-white"
                                : "border-gray-200 hover:bg-gray-100 text-gray-600"
                            }`}
                            title="Open Full Page"
                          >
                            <LuExternalLink className="text-sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= QUICK ORDER DETAIL MODAL ============================== */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border shadow-2xl flex flex-col ${
              isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
            }`}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg">
                  <LuShoppingBag />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold">
                      Order {selectedOrder.orderId}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        (STATUS_BADGES[selectedOrder.status] || STATUS_BADGES.Processing).badge
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Placed: {selectedOrder.date || "Today"} • {selectedOrder.items?.length || 0} item(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/orders/${selectedOrder.orderId}`}
                  className="px-3 py-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 border border-blue-500/30 rounded-xl"
                >
                  <LuExternalLink /> Full Page
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-200 rounded-lg cursor-pointer"
                >
                  <LuX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Manual Status Switcher Pill Bar */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Change Delivery / Order Status:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => {
                    const isSelected = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedOrder((prev) => ({ ...prev, status: st }));
                          handleStatusChange(selectedOrder.orderId, st);
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : isDark
                            ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Info */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <h4 className="font-bold text-xs flex items-center gap-1.5 mb-2.5 text-blue-500">
                    <LuUser /> Customer Contact
                  </h4>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {selectedOrder.customer?.name}
                  </p>
                  <p className="text-gray-400 flex items-center gap-1 mt-1">
                    <LuMail className="shrink-0" /> {selectedOrder.customer?.email}
                  </p>
                  <p className="text-gray-400 flex items-center gap-1 mt-0.5">
                    <LuPhone className="shrink-0" /> {selectedOrder.customer?.phone || "+91 98201 44521"}
                  </p>
                </div>

                {/* Shipping Address */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-500">
                      <LuMapPin /> Shipping Address
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="text-[10px] font-bold text-blue-500 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <LuCheck /> : <LuCopy />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-gray-400">
                    {selectedOrder.shippingAddress?.street || "124 Marine Drive"},<br />
                    {selectedOrder.shippingAddress?.city || "Mumbai"},{" "}
                    {selectedOrder.shippingAddress?.state || "Maharashtra"} {selectedOrder.shippingAddress?.postalCode || "400020"}<br />
                    {selectedOrder.shippingAddress?.country || "India"}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Items in Order ({selectedOrder.items?.length || 0})
                </h4>
                <div
                  className={`rounded-2xl border divide-y overflow-hidden ${
                    isDark ? "border-slate-800 divide-slate-800 bg-slate-900/40" : "border-gray-100 divide-gray-100 bg-white"
                  }`}
                >
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAssetUrl(item.img) || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=100"}
                          alt={item.title}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400">{item.category} • Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-500 shrink-0">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking & Notes form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    Courier Tracking Code
                  </label>
                  <input
                    type="text"
                    value={modalTracking}
                    onChange={(e) => setModalTracking(e.target.value)}
                    placeholder="e.g. DTDC-98124971"
                    className={`w-full px-3 py-2 border rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={modalPaymentStatus}
                    onChange={(e) => setModalPaymentStatus(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    Fulfillment Notes
                  </label>
                  <input
                    type="text"
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Add delivery instructions or craft details..."
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 sm:p-5 border-t flex items-center justify-between ${
                isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Total:</span>
                <span className="text-base font-extrabold text-blue-500">
                  ₹{(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? "border-slate-700 text-gray-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-white"
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveModalChanges}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LuSave />
                  <span>{isUpdating ? "Saving..." : "Save Details"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
