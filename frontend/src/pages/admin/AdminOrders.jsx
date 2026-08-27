import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { LuShoppingBag, LuDownload } from "react-icons/lu";

const AdminOrders = () => {
  const { globalSearch, isDark } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error("Failed to load real orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = (globalSearch || searchQuery).toLowerCase().trim();
    return orders.filter((order) => {
      const matchSearch =
        q === "" ||
        order.orderId?.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.email?.toLowerCase().includes(q);

      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, globalSearch, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Order ${orderId} updated to ${newStatus}! ✨` },
        })
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "Order ID,Customer,Email,Phone,Items Count,Total Amount,Status,Payment,Date\n" +
      filteredOrders
        .map(
          (o) =>
            `${o.orderId},"${o.customer?.name || ""}","${o.customer?.email || ""}","${o.customer?.phone || ""}",${o.items?.length || 1},${o.totalAmount},${o.status},${o.paymentMethod},${o.date || ""}`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `real_orders_${new Date().toISOString().split("T")[0]}.csv`;
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
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold">
              Live Database
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Monitor, fulfill customer orders, and update delivery tracking
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className={`px-3.5 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto ${
            isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200" : "bg-white hover:bg-gray-50 border-[#E5E7EB] text-[#374151]"
          }`}
        >
          <LuDownload className="text-sm" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Orders Table Card */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Filter Tabs & Search */}
        <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB] bg-white"
        }`}>
          {/* Status Tabs */}
          <div className={`inline-flex p-1 rounded-xl text-xs font-semibold overflow-x-auto ${
            isDark ? "bg-slate-900 border border-slate-800" : "bg-gray-100"
          }`}>
            {["All", "Processing", "Shipped", "Delivered", "Pending"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  statusFilter === status
                    ? isDark
                      ? "bg-slate-800 text-white shadow-2xs font-bold"
                      : "bg-white text-[#111827] shadow-2xs font-bold"
                    : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or name..."
              className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
              }`}
            />
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
              }`}>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-medium">Loading real database orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <LuShoppingBag className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No orders found</p>
                    <p className="text-xs text-gray-500">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId || order._id} className={`transition-colors ${
                    isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                  }`}>
                    <td className="py-3.5 px-6 font-bold text-blue-400">{order.orderId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold">{order.customer?.name}</p>
                      <p className="text-[11px] text-gray-500">{order.customer?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-400">
                      {order.items?.length || 1} items
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-medium">
                      {order.paymentMethod || "UPI"}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : order.status === "Processing"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : order.status === "Shipped"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-700 text-gray-300 border-slate-600"
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-6 text-right text-gray-500">{order.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
