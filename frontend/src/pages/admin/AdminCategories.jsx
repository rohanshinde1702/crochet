import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LuPlus, LuX, LuBoxes } from "react-icons/lu";

const AdminCategories = () => {
  const { isDark } = useOutletContext();
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🧶");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/categories");
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
      const res = await fetch("http://localhost:5000/api/categories", {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Product Categories
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[11px] font-bold">
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
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <LuPlus className="text-sm" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-semibold">Loading categories from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoriesList.map((cat) => (
            <div
              key={cat._id || cat.name}
              className={`rounded-2xl p-6 border shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${
                isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-3xl p-3 rounded-2xl border ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"
                  }`}>
                    {cat.icon || "🧶"}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                    {cat.productCount || 0} Products
                  </span>
                </div>
                <h3 className="text-base font-bold">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {cat.description || "Handcrafted collection"}
                </p>
              </div>

              <div className={`pt-6 mt-4 border-t flex items-center justify-between ${
                isDark ? "border-slate-800" : "border-gray-100"
              }`}>
                <span className="text-[11px] font-semibold text-gray-500">
                  Active Collection
                </span>
                <Link
                  to="/admin/products"
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors ${
                    isDark ? "bg-slate-800 hover:bg-slate-700 text-blue-400" : "bg-gray-50 hover:bg-gray-100 text-[#2563EB]"
                  }`}
                >
                  <LuBoxes className="text-xs" />
                  <span>View Products</span>
                </Link>
              </div>
            </div>
          ))}
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
              className={`rounded-2xl p-6 max-w-sm w-full border shadow-2xl ${
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
