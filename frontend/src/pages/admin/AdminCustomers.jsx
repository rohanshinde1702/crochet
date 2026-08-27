import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsShieldLock,
  BsShieldCheck,
  BsTrash3,
  BsExclamationTriangle,
  BsUnlock,
} from "react-icons/bs";
import {
  LuUsers,
  LuDownload,
  LuStar,
  LuBan,
  LuCrown,
  LuUserCheck,
  LuTrash2,
  LuShieldAlert,
} from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const AdminCustomers = () => {
  const { globalSearch, isDark } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [blockingUser, setBlockingUser] = useState(null);
  const [blockReasonInput, setBlockReasonInput] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CUSTOMERS);
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (err) {
      console.error("Failed to load real customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => !c.isBlocked).length;
    const blocked = customers.filter((c) => c.isBlocked).length;
    const admins = customers.filter((c) => c.role === "admin").length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.spent || 0), 0);

    return { total, active, blocked, admins, totalSpent };
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    const q = (globalSearch || searchQuery).toLowerCase().trim();
    return customers.filter((cust) => {
      const matchSearch =
        q === "" ||
        cust.name?.toLowerCase().includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.id?.toLowerCase().includes(q) ||
        cust.phone?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterTab === "active") return !cust.isBlocked;
      if (filterTab === "blocked") return cust.isBlocked;
      if (filterTab === "admins") return cust.role === "admin";
      if (filterTab === "vip") return cust.status === "VIP";

      return true;
    });
  }, [customers, globalSearch, searchQuery, filterTab]);

  // Toggle Block / Unblock
  const handleExecuteBlockToggle = async () => {
    if (!blockingUser) return;
    setActionLoading(true);

    try {
      const targetId = blockingUser._id || blockingUser.id;
      const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${targetId}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockReason: blockReasonInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update block status");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: data.message || "Customer status updated!" },
        })
      );

      setBlockingUser(null);
      setBlockReasonInput("");
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Role (Admin / User)
  const handleToggleRole = async (cust) => {
    const targetId = cust._id || cust.id;
    const newRole = cust.role === "admin" ? "user" : "admin";

    if (cust.email === "admin@cozyloops.com") {
      alert("Cannot change role for the master admin account.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to change role for "${cust.name}" to ${
          newRole === "admin" ? "Admin" : "Customer"
        }?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${targetId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: data.message || "Role updated successfully!" },
        })
      );

      fetchCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete User
  const handleExecuteDelete = async () => {
    if (!deletingUser) return;
    setActionLoading(true);

    try {
      const targetId = deletingUser._id || deletingUser.id;
      const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${targetId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete customer");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Customer account "${deletingUser.name}" permanently deleted. 🗑️`,
          },
        })
      );

      setDeletingUser(null);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent =
      "Customer ID,Name,Email,Phone,Role,Status,Orders,Total Spent,Joined\n" +
      filteredCustomers
        .map(
          (c) =>
            `${c.id},"${c.name}","${c.email}","${c.phone}","${c.role || "user"}","${
              c.isBlocked ? "Blocked" : c.status
            }",${c.orders},${c.spent},${c.joined}`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_directory_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Management
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold">
              Live Database
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Manage user accounts, permissions, block suspensions, and account removals
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
          <span>Export Directory</span>
        </button>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Total Registered</span>
            <LuUsers className="text-blue-500 text-base" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold mt-1.5">{metrics.total}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Active Accounts</span>
            <LuUserCheck className="text-emerald-500 text-base" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-500 mt-1.5">{metrics.active}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Blocked / Suspended</span>
            <LuBan className="text-rose-500 text-base" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-500 mt-1.5">{metrics.blocked}</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Admins</span>
            <LuCrown className="text-amber-500 text-base" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-1.5">{metrics.admins}</p>
        </div>
      </div>

      {/* 3. Table Container */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Filter Tabs & Search Bar */}
        <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB]"
        }`}>
          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Users", count: metrics.total },
              { id: "active", label: "Active", count: metrics.active },
              { id: "blocked", label: "Blocked", count: metrics.blocked, alert: metrics.blocked > 0 },
              { id: "admins", label: "Admins", count: metrics.admins },
              { id: "vip", label: "VIP Buyers" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterTab === tab.id
                    ? isDark
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-[#6C2C12] text-white shadow-xs"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      filterTab === tab.id
                        ? "bg-white/20 text-white"
                        : tab.alert
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-black/10 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
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
                <th className="py-3.5 px-6">Customer & Role</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Orders & Spent</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-medium">Loading user accounts...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <LuUsers className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No customers found</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isMasterAdmin = cust.email === "admin@cozyloops.com";

                  return (
                    <tr
                      key={cust._id || cust.id}
                      className={`transition-colors ${
                        cust.isBlocked
                          ? isDark
                            ? "bg-rose-950/20 hover:bg-rose-950/30"
                            : "bg-rose-50/40 hover:bg-rose-50/70"
                          : isDark
                          ? "hover:bg-slate-800/60"
                          : "hover:bg-gray-50/70"
                      }`}
                    >
                      {/* CUSTOMER & ROLE */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/20 overflow-hidden shrink-0">
                            {cust.avatar ? (
                              <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                            ) : (
                              cust.name.split(" ").map((n) => n[0]).join("")
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold">{cust.name}</p>
                              {cust.role === "admin" && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 text-[10px] font-bold border border-amber-500/30">
                                  <LuCrown className="text-[9px]" /> Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">{cust.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="py-3.5 px-4">
                        <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {cust.email}
                        </p>
                        <p className="text-[11px] text-gray-500">{cust.phone || "No phone added"}</p>
                      </td>

                      {/* ORDERS & SPENT */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm block">
                          ₹{(cust.spent || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {cust.orders} {cust.orders === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        {cust.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            <LuBan className="text-[10px]" /> Blocked
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              cust.status === "VIP"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : cust.status === "Regular"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {cust.status === "VIP" && <LuStar className="text-[10px]" />}
                            {cust.status || "Active"}
                          </span>
                        )}
                        {cust.blockReason && (
                          <span className="block text-[10px] text-rose-400 italic mt-0.5">
                            "{cust.blockReason}"
                          </span>
                        )}
                      </td>

                      {/* JOINED */}
                      <td className="py-3.5 px-4 text-gray-500">{cust.joined}</td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Toggle Button */}
                          {!isMasterAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(cust)}
                              title={cust.role === "admin" ? "Revoke Admin Privileges" : "Grant Admin Privileges"}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                                cust.role === "admin"
                                  ? isDark
                                    ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30"
                                    : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                  : isDark
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                              }`}
                            >
                              <LuCrown className="text-xs" />
                            </button>
                          )}

                          {/* Block / Unblock Button */}
                          {!isMasterAdmin && (
                            <button
                              type="button"
                              onClick={() => setBlockingUser(cust)}
                              title={cust.isBlocked ? "Unblock Account" : "Block & Suspend Account"}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                                cust.isBlocked
                                  ? isDark
                                    ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : isDark
                                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                            >
                              {cust.isBlocked ? <BsUnlock className="text-xs" /> : <LuBan className="text-xs" />}
                            </button>
                          )}

                          {/* Delete Button */}
                          {!isMasterAdmin ? (
                            <button
                              type="button"
                              onClick={() => setDeletingUser(cust)}
                              title="Permanently Remove Customer"
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                                isDark
                                  ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30"
                                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                              }`}
                            >
                              <LuTrash2 className="text-xs" />
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-gray-400 italic px-2">
                              Master Admin
                            </span>
                          )}
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

      {/* BLOCK / UNBLOCK MODAL */}
      <AnimatePresence>
        {blockingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-xl ${
                isDark ? "bg-[#1E293B] border-slate-800 text-white" : "bg-white border-[#EBDCD0] text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    blockingUser.isBlocked
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-rose-500/15 text-rose-500"
                  }`}
                >
                  {blockingUser.isBlocked ? <BsUnlock /> : <LuShieldAlert />}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {blockingUser.isBlocked ? "Unblock Customer Account" : "Block & Suspend Account"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {blockingUser.name} ({blockingUser.email})
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                {blockingUser.isBlocked
                  ? `Unblocking will immediately restore "${blockingUser.name}"'s ability to sign in, shop, and place orders.`
                  : `Blocking this user will immediately revoke their access. They will be prevented from signing in until unblocked.`}
              </p>

              {!blockingUser.isBlocked && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Reason for Suspension (Optional)
                  </label>
                  <input
                    type="text"
                    value={blockReasonInput}
                    onChange={(e) => setBlockReasonInput(e.target.value)}
                    placeholder="e.g. Fraudulent activity, chargeback, policy violation"
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-rose-500 ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setBlockingUser(null);
                    setBlockReasonInput("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteBlockToggle}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                    blockingUser.isBlocked
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {actionLoading ? "Processing..." : blockingUser.isBlocked ? "Confirm Unblock" : "Confirm Block"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-xl ${
                isDark ? "bg-[#1E293B] border-slate-800 text-white" : "bg-white border-[#EBDCD0] text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl">
                  <LuTrash2 />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-500">
                    Permanently Delete Customer?
                  </h3>
                  <p className="text-xs text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border mb-5 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-gray-50 border-gray-200"}`}>
                <p className="font-bold text-xs">{deletingUser.name}</p>
                <p className="text-[11px] text-gray-400">{deletingUser.email}</p>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  {deletingUser.orders} orders placed • Total: ₹{(deletingUser.spent || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Deleting this customer will remove their profile record from MongoDB.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteDelete}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {actionLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
