import { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsRecycle,
  BsArrowCounterclockwise,
  BsExclamationTriangle,
} from "react-icons/bs";
import { LuBoxes, LuBookOpen, LuTrash2 } from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const AdminRecycleBin = () => {
  const { refreshCounts, isDark } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "blogs" ? "blogs" : "products";

  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [recycleProducts, setRecycleProducts] = useState([]);
  const [recycleBlogs, setRecycleBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Action states
  const [deletingModalItem, setDeletingModalItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const fetchRecycleBinData = async () => {
    try {
      setLoading(true);
      const [prodRes, blogRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.PRODUCTS}/recycle-bin`),
        fetch(`${API_ENDPOINTS.BLOGS}/recycle-bin`),
      ]);
      const [prodData, blogData] = await Promise.all([
        prodRes.json(),
        blogRes.json(),
      ]);
      if (Array.isArray(prodData)) setRecycleProducts(prodData);
      if (Array.isArray(blogData)) setRecycleBlogs(blogData);
      if (refreshCounts) refreshCounts();
    } catch (err) {
      console.error("Failed to load recycle bin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecycleBinData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const handleRestoreProduct = async (product) => {
    const itemId = product.id || product._id;
    try {
      setRestoringId(`prod-${itemId}`);
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${itemId}/restore`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to restore product");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Product "${product.title}" restored successfully! ✨` },
        })
      );
      fetchRecycleBinData();
    } catch (err) {
      alert(err.message);
    } finally {
      setRestoringId(null);
    }
  };

  const handleRestoreBlog = async (blog) => {
    const itemId = blog.id || blog._id || blog.slug;
    try {
      setRestoringId(`blog-${itemId}`);
      const res = await fetch(`${API_ENDPOINTS.BLOGS}/${itemId}/restore`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to restore blog story");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: `Story "${blog.title}" restored successfully! ✨` },
        })
      );
      fetchRecycleBinData();
    } catch (err) {
      alert(err.message);
    } finally {
      setRestoringId(null);
    }
  };

  const handleExecuteAction = async () => {
    if (!deletingModalItem) return;
    setActionLoading(true);

    try {
      if (deletingModalItem.type === "empty_bin") {
        const target = deletingModalItem.target;
        const endpoint =
          target === "products"
            ? `${API_ENDPOINTS.PRODUCTS}/recycle-bin/empty`
            : `${API_ENDPOINTS.BLOGS}/recycle-bin/empty`;

        const res = await fetch(endpoint, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to empty recycle bin");

        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: {
              message: `Emptied ${target === "products" ? "Products" : "Stories"} Recycle Bin. 🗑️`,
            },
          })
        );
      } else {
        const isBlog = deletingModalItem.isBlog;
        const item = deletingModalItem.item;
        const itemId = item.id || item._id || (isBlog ? item.slug : null);
        const endpoint = isBlog
          ? `${API_ENDPOINTS.BLOGS}/${itemId}/permanent`
          : `${API_ENDPOINTS.PRODUCTS}/${itemId}/permanent`;

        const res = await fetch(endpoint, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to permanently delete item");

        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: { message: `Permanently deleted "${item.title}".` },
          })
        );
      }

      setDeletingModalItem(null);
      fetchRecycleBinData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <span>Recycle Bin</span>
            <span className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center">
              {recycleProducts.length + recycleBlogs.length}
            </span>
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Safely restore soft-deleted catalog items and stories or purge them permanently
          </p>
        </div>

        {/* Empty Bin Action Button */}
        {((activeSubTab === "products" && recycleProducts.length > 0) ||
          (activeSubTab === "blogs" && recycleBlogs.length > 0)) && (
          <button
            type="button"
            onClick={() =>
              setDeletingModalItem({
                type: "empty_bin",
                target: activeSubTab,
                count: activeSubTab === "products" ? recycleProducts.length : recycleBlogs.length,
              })
            }
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <LuTrash2 className="text-sm" />
            <span>Empty {activeSubTab === "products" ? "Products" : "Stories"} Bin</span>
          </button>
        )}
      </div>

      {/* Main Table Card */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Sub-Tabs Switcher */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? "bg-slate-900/60 border-slate-800" : "bg-gray-50/80 border-gray-200"
        }`}>
          <div className={`inline-flex p-1 rounded-xl border shadow-2xs ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
          }`}>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab("products");
                setSearchParams({ tab: "products" });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "products"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LuBoxes className="text-sm" />
              <span>Deleted Products ({recycleProducts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab("blogs");
                setSearchParams({ tab: "blogs" });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "blogs"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LuBookOpen className="text-sm" />
              <span>Deleted Stories ({recycleBlogs.length})</span>
            </button>
          </div>
        </div>

        {/* ================= 1. DELETED PRODUCTS TABLE ================= */}
        {activeSubTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
                }`}>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
                {recycleProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-500/20 shadow-2xs">
                        <BsRecycle />
                      </div>
                      <h4 className="font-bold text-sm">Product Recycle Bin is Clean</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        No soft-deleted products. When you delete a product, it will safely appear here for 1-click restoration.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recycleProducts.map((prod) => {
                    const isRestoring = restoringId === `prod-${prod.id || prod._id}`;

                    return (
                      <tr key={prod.id || prod._id} className={`transition-colors ${
                        isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                      }`}>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl border overflow-hidden shrink-0 ${
                              isDark ? "bg-slate-800 border-slate-700" : "bg-gray-100 border-gray-200"
                            }`}>
                              <img
                                src={prod.img}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/uploads/products/decor/sunflower.png";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs sm:text-sm truncate">
                                {prod.title}
                              </h5>
                              <p className="text-[11px] text-gray-500">
                                SKU: CLP{String(prod.id || 1).padStart(3, "0")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            isDark ? "bg-slate-800 text-slate-300" : "bg-[#F3F4F6] text-[#374151]"
                          }`}>
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-xs">
                          ₹{(prod.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {formatDate(prod.deletedAt)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isRestoring}
                              onClick={() => handleRestoreProduct(prod)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Restore Product"
                            >
                              <BsArrowCounterclockwise className={`text-sm ${isRestoring ? "animate-spin" : ""}`} />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingModalItem({
                                  type: "single",
                                  isBlog: false,
                                  item: prod,
                                })
                              }
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= 2. DELETED BLOGS TABLE ================= */}
        {activeSubTab === "blogs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
                }`}>
                  <th className="py-3.5 px-6">Story</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
                {recycleBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-500/20 shadow-2xs">
                        <BsRecycle />
                      </div>
                      <h4 className="font-bold text-sm">Story Recycle Bin is Clean</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        No soft-deleted blog stories. When you delete an article, you can restore it from here anytime.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recycleBlogs.map((blog) => {
                    const isRestoring = restoringId === `blog-${blog.id || blog._id || blog.slug}`;

                    return (
                      <tr key={blog.id || blog._id} className={`transition-colors ${
                        isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                      }`}>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl border overflow-hidden shrink-0 ${
                              isDark ? "bg-slate-800 border-slate-700" : "bg-gray-100 border-gray-200"
                            }`}>
                              <img
                                src={blog.img}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/uploads/blogs/blog_yarn_selection_1787376883256.jpg";
                                }}
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <h5 className="font-bold text-xs sm:text-sm truncate">
                                {blog.title}
                              </h5>
                              <p className="text-[11px] text-gray-500 truncate">{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            isDark ? "bg-slate-800 text-slate-300" : "bg-[#F3F4F6] text-[#374151]"
                          }`}>
                            {blog.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-gray-300">
                          {blog.author?.name || "Rohan Shinde"}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {formatDate(blog.deletedAt)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isRestoring}
                              onClick={() => handleRestoreBlog(blog)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Restore Story"
                            >
                              <BsArrowCounterclockwise className={`text-sm ${isRestoring ? "animate-spin" : ""}`} />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingModalItem({
                                  type: "single",
                                  isBlog: true,
                                  item: blog,
                                })
                              }
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deletingModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl p-6 max-w-md w-full border shadow-2xl text-center ${
                isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
              }`}
            >
              {deletingModalItem.type === "empty_bin" ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-500/20">
                    <BsExclamationTriangle />
                  </div>
                  <h3 className="text-base font-bold">
                    Empty {deletingModalItem.target === "products" ? "Products" : "Stories"} Bin?
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    CAUTION: All <strong className="text-red-400">{deletingModalItem.count} items</strong> will be permanently wiped from the database. This action cannot be undone.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center text-xl mx-auto mb-4 border border-red-500/20">
                    <LuTrash2 />
                  </div>
                  <h3 className="text-base font-bold">
                    Permanently delete "{deletingModalItem.item.title}"?
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    CAUTION: This item will be permanently removed from the database and cannot be recovered.
                  </p>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingModalItem(null)}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? "border-slate-700 text-gray-300 hover:bg-slate-800" : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {actionLoading
                    ? "Processing..."
                    : deletingModalItem.type === "empty_bin"
                    ? "Empty Bin"
                    : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRecycleBin;
