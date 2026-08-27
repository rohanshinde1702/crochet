import { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuPlus,
  LuX,
  LuBoxes,
  LuLayoutGrid,
  LuList,
  LuSearch,
  LuFolderTree,
  LuPackage,
  LuChevronRight,
  LuLayers,
} from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const AdminCategories = () => {
  const { isDark } = useOutletContext();
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [searchQuery, setSearchQuery] = useState("");

  // Add Category Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🧶");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CATEGORIES);
      const data = await res.json();
      if (Array.isArray(data)) setCategoriesList(data);
    } catch (err) {
      console.error("Failed to load real categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon.trim() || "🧶",
          description: newCatDesc.trim() || "Custom handcrafted collection.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Category "${newCatName.trim()}" created in database! 🧶✨` },
        })
      );

      setNewCatName("");
      setNewCatDesc("");
      setIsAddOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) => {
      const matchesSearch =
        (cat.name && cat.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [categoriesList, searchQuery]);

  // Total products sum
  const totalProducts = useMemo(() => {
    return categoriesList.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
  }, [categoriesList]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Product Categories
            </h1>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] sm:text-[11px] font-bold">
              Live Database
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Organize and manage your product classifications and collections in MongoDB
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <LuPlus className="text-sm" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Control Bar: Search, Stats & Responsive View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0 max-w-full sm:max-w-md">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#2563EB] transition-colors ${
              isDark
                ? "bg-[#1E293B] border-slate-800 text-white placeholder-gray-500"
                : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Right Controls: Stats Badge & Grid/List Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium ${
            isDark ? "bg-[#1E293B] border-slate-800 text-gray-400" : "bg-white border-gray-200 text-gray-500"
          }`}>
            <LuFolderTree className="text-[#2563EB]" />
            <span>{categoriesList.length} <span className="hidden xs:inline">Categories</span></span>
            <span className="text-gray-300 dark:text-slate-700">|</span>
            <LuPackage className="text-emerald-500" />
            <span>{totalProducts} <span className="hidden xs:inline">Items</span></span>
          </div>

          {/* Grid / List View Toggle */}
          <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border ${
            isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-gray-200"
          }`}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Grid View (4 columns on lg)"
            >
              <LuLayoutGrid className="text-sm" />
              <span className="hidden md:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#2563EB] text-white shadow-2xs"
                  : isDark
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List View"
            >
              <LuList className="text-sm" />
              <span className="hidden md:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Presentation */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-semibold">Loading categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className={`p-8 sm:p-12 text-center rounded-2xl border ${
          isDark ? "bg-[#1E293B] border-slate-800 text-gray-400" : "bg-white border-gray-200 text-gray-500"
        }`}>
          <LuBoxes className="text-4xl mx-auto mb-2 opacity-40" />
          <h3 className="font-bold text-base mb-1">No Categories Found</h3>
          <p className="text-xs max-w-sm mx-auto">
            {searchQuery ? `No category matches "${searchQuery}". Try another search term.` : "No categories created yet in the database."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= 1. RESPONSIVE GRID VIEW (1 col mobile, 2 sm, 3 md, 4 lg / 1fr) ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat._id || cat.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-4 sm:p-5 border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group ${
                isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-2xl p-2 rounded-2xl border transition-transform group-hover:scale-105 ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
                  }`}>
                    {cat.icon || "🧶"}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[11px] font-bold border border-blue-500/20">
                    {cat.productCount || 0} Products
                  </span>
                </div>
                <h3 className="text-sm font-bold truncate" title={cat.name}>
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || "Handcrafted collection"}
                </p>
              </div>

              <div className={`pt-3.5 mt-3.5 border-t flex items-center justify-between ${
                isDark ? "border-slate-800" : "border-gray-100"
              }`}>
                <span className="text-[11px] font-semibold text-gray-500">
                  Active
                </span>
                <Link
                  to="/admin/products"
                  className={`px-2.5 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-blue-400"
                      : "bg-gray-50 hover:bg-gray-100 text-[#2563EB]"
                  }`}
                >
                  <LuBoxes className="text-xs" />
                  <span>View</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ================= 2. RESPONSIVE LIST VIEW (Table on sm+, Card List on mobile) ================= */
        <div className="space-y-2.5">
          {/* Mobile Cards (Visible only on < sm screens) */}
          <div className="block sm:hidden space-y-2.5">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id || cat.name}
                className={`p-3.5 rounded-2xl border shadow-2xs flex items-center justify-between gap-3 ${
                  isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                  }`}>
                    {cat.icon || "🧶"}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm truncate">{cat.name}</h4>
                    <p className="text-[11px] text-gray-400 truncate">{cat.description || "Handcrafted collection"}</p>
                    <span className="inline-block text-[10px] text-blue-400 font-bold mt-0.5">
                      {cat.productCount || 0} products
                    </span>
                  </div>
                </div>

                <Link
                  to="/admin/products"
                  className={`p-2 rounded-xl text-xs font-bold shrink-0 ${
                    isDark ? "bg-slate-800 text-blue-400" : "bg-gray-100 text-[#2563EB]"
                  }`}
                >
                  <LuChevronRight className="text-base" />
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (Visible on sm+ screens) */}
          <div className={`hidden sm:block rounded-2xl border overflow-hidden shadow-2xs ${
            isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] tracking-wider font-bold border-b ${
                  isDark ? "bg-slate-900/50 border-slate-800 text-gray-400" : "bg-gray-50/70 border-gray-100 text-gray-500"
                }`}>
                  <tr>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4 hidden md:table-cell">Description</th>
                    <th className="py-3 px-4 text-center">Products Count</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800 text-gray-200" : "divide-gray-100 text-gray-700"}`}>
                  {filteredCategories.map((cat) => (
                    <tr
                      key={cat._id || cat.name}
                      className={`transition-colors ${
                        isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50/60"
                      }`}
                    >
                      {/* Category Name & Emoji Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                            isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
                          }`}>
                            {cat.icon || "🧶"}
                          </span>
                          <div>
                            <span className="font-bold block text-sm">{cat.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {cat._id ? cat._id.slice(-6).toUpperCase() : "CUSTOM"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-gray-400 max-w-xs truncate">
                        {cat.description || "Handcrafted collection"}
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                          <LuPackage className="text-xs" />
                          <span>{cat.productCount || 0}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/admin/products"
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-blue-400"
                              : "bg-gray-100 hover:bg-gray-200 text-[#2563EB]"
                          }`}
                        >
                          <LuBoxes className="text-xs" />
                          <span>View Products</span>
                          <LuChevronRight className="text-xs" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl p-5 sm:p-6 max-w-sm w-full border shadow-2xl ${
                isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">Create New Category</h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded-lg cursor-pointer"
                >
                  <LuX />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Winter Warmers"
                    className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                      isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="e.g. 🧣"
                    className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                      isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description of this collection..."
                    className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] resize-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                      isDark ? "border-slate-700 text-gray-300 hover:bg-slate-800" : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
