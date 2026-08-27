import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { LuUsers, LuDownload, LuStar } from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const AdminCustomers = () => {
  const { globalSearch, isDark } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCustomers = useMemo(() => {
    const q = (globalSearch || searchQuery).toLowerCase().trim();
    return customers.filter((cust) => {
      return (
        q === "" ||
        cust.name?.toLowerCase().includes(q) ||
        cust.email?.toLowerCase().includes(q) ||
        cust.id?.toLowerCase().includes(q)
      );
    });
  }, [customers, globalSearch, searchQuery]);

  const handleExportCSV = () => {
    const csvContent =
      "Customer ID,Name,Email,Phone,Orders,Total Spent,Status,Joined\n" +
      filteredCustomers
        .map((c) => `${c.id},"${c.name}","${c.email}","${c.phone}",${c.orders},${c.spent},${c.status},${c.joined}`)
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `real_customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Directory
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold">
              Live Database
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Real registered user accounts, order volumes, and lifetime spending
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
          <span>Export Customers</span>
        </button>
      </div>

      {/* Table Card */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Table Search bar */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB]"
        }`}>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or email..."
              className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
              }`}
            />
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>

          <p className="text-xs text-gray-500">
            Total: <strong>{filteredCustomers.length}</strong> real customers
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
              }`}>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Membership</th>
                <th className="py-3.5 px-6 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-medium">Loading registered users from database...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <LuUsers className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No customers found</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust._id || cust.id} className={`transition-colors ${
                    isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                  }`}>
                    {/* CUSTOMER */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/20 overflow-hidden">
                          {cust.avatar ? (
                            <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                          ) : (
                            cust.name.split(" ").map((n) => n[0]).join("")
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{cust.name}</p>
                          <p className="text-[11px] text-gray-500">{cust.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="py-3.5 px-4">
                      <p className="text-gray-300 font-medium">{cust.email}</p>
                      <p className="text-[11px] text-gray-500">{cust.phone}</p>
                    </td>

                    {/* ORDERS */}
                    <td className="py-3.5 px-4 font-semibold text-gray-400">
                      {cust.orders} orders
                    </td>

                    {/* TOTAL SPENT */}
                    <td className="py-3.5 px-4 font-bold">
                      ₹{(cust.spent || 0).toLocaleString("en-IN")}
                    </td>

                    {/* MEMBERSHIP */}
                    <td className="py-3.5 px-4">
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
                        {cust.status}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="py-3.5 px-6 text-right text-gray-500">{cust.joined}</td>
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

export default AdminCustomers;
