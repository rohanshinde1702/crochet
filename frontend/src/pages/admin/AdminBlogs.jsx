import { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsPencil,
  BsTrash3,
  BsEye,
  BsRecycle,
  BsArrowCounterclockwise,
} from "react-icons/bs";
import { LuBookOpen, LuPlus, LuStar, LuTrash2 } from "react-icons/lu";
import { API_ENDPOINTS } from "../../config/api";

const BLOG_CATEGORIES = [
  "Crochet Guides",
  "Patterns & Inspo",
  "Yarn 101",
  "Care & Tips",
  "Behind The Stitches",
  "Cozy Living",
];

const ITEMS_PER_PAGE = 8;

const AdminBlogs = () => {
  const { globalSearch, refreshCounts, isDark } = useOutletContext();

  const [blogs, setBlogs] = useState([]);
  const [recycleBinBlogs, setRecycleBinBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewRecycle, setViewRecycle] = useState(false);

  // Modal states
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoadingId, setRestoreLoadingId] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const [resActive, resBin] = await Promise.all([
        fetch(API_ENDPOINTS.BLOGS),
        fetch(`${API_ENDPOINTS.BLOGS}/recycle-bin`),
      ]);
      const [activeData, binData] = await Promise.all([
        resActive.json(),
        resBin.json(),
      ]);
      if (Array.isArray(activeData)) setBlogs(activeData);
      if (Array.isArray(binData)) setRecycleBinBlogs(binData);
      if (refreshCounts) refreshCounts();
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const baseList = viewRecycle ? recycleBinBlogs : blogs;
    const q = (globalSearch || searchQuery).toLowerCase().trim();

    return baseList.filter((blog) => {
      const matchSearch =
        q === "" ||
        blog.title?.toLowerCase().includes(q) ||
        blog.category?.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q) ||
        blog.author?.name?.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "All" ||
        blog.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [blogs, recycleBinBlogs, viewRecycle, globalSearch, searchQuery, categoryFilter]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;

  const handleExecuteDelete = async () => {
    if (!deletingBlog) return;
    setDeleteLoading(true);

    try {
      const isPermanent = deletingBlog.isPermanent;
      const itemId = deletingBlog.blog.id || deletingBlog.blog._id || deletingBlog.blog.slug;
      const endpoint = isPermanent
        ? `${API_ENDPOINTS.BLOGS}/${itemId}/permanent`
        : `${API_ENDPOINTS.BLOGS}/${itemId}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: isPermanent
              ? `Permanently deleted "${deletingBlog.blog.title}".`
              : `Moved "${deletingBlog.blog.title}" to Recycle Bin. 🗑️`,
          },
        })
      );

      setDeletingBlog(null);
      fetchBlogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestoreBlog = async (blog) => {
    const itemId = blog.id || blog._id || blog.slug;
    try {
      setRestoreLoadingId(itemId);
      const res = await fetch(`${API_ENDPOINTS.BLOGS}/${itemId}/restore`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to restore blog");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Restored story "${blog.title}" to active articles! ✨`,
          },
        })
      );
      fetchBlogs();
    } catch (err) {
      alert(err.message);
    } finally {
      setRestoreLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {viewRecycle ? "Stories Recycle Bin" : "Blog Stories"}
            </h1>

            {/* Active vs Bin quick toggle */}
            <div className={`inline-flex p-0.5 rounded-lg text-xs font-semibold ${
              isDark ? "bg-slate-900 border border-slate-800" : "bg-[#F3F4F6]"
            }`}>
              <button
                type="button"
                onClick={() => {
                  setViewRecycle(false);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  !viewRecycle
                    ? isDark
                      ? "bg-slate-800 text-white shadow-2xs font-bold"
                      : "bg-white text-[#111827] shadow-2xs font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Active ({blogs.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewRecycle(true);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  viewRecycle
                    ? "bg-red-500/20 text-red-400 shadow-2xs font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <BsRecycle className="text-xs" />
                <span>Bin ({recycleBinBlogs.length})</span>
              </button>
            </div>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            {viewRecycle
              ? "Deleted blog articles in the recycle bin. Restore or permanently delete them."
              : "Manage and publish handcrafted guides, yarn tutorials, and stories"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer shadow-2xs ${
              isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-[#E5E7EB] text-[#374151]"
            }`}
          >
            <option value="All">All Categories</option>
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {!viewRecycle && (
            <Link
              to="/admin/add-blog"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <LuPlus className="text-sm" />
              <span>Add Story</span>
            </Link>
          )}

          {viewRecycle && (
            <Link
              to="/admin/recycle-bin"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <LuTrash2 className="text-sm" />
              <span>Open Recycle Hub</span>
            </Link>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Search Header */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB] bg-white"
        }`}>
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by story title, category, author..."
              className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
              }`}
            />
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>

          <p className="text-xs text-gray-500">
            Total: <strong>{filteredBlogs.length}</strong> stories
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
              }`}>
                <th className="py-3.5 px-6">Story</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">{viewRecycle ? "Deleted On" : "Read Time"}</th>
                <th className="py-3.5 px-4">Spotlight</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-medium">Loading stories...</p>
                  </td>
                </tr>
              ) : paginatedBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <LuBookOpen className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No blog stories found</p>
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((blog) => {
                  const isRestoring = restoreLoadingId === (blog.id || blog._id || blog.slug);

                  return (
                    <tr key={blog.id || blog._id} className={`transition-colors ${
                      isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                    }`}>
                      {/* STORY */}
                      <td className="py-3 px-6">
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

                      {/* CATEGORY */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          isDark ? "bg-slate-800 text-slate-300" : "bg-[#F3F4F6] text-[#374151]"
                        }`}>
                          {blog.category}
                        </span>
                      </td>

                      {/* AUTHOR */}
                      <td className="py-3 px-4 text-xs font-semibold text-gray-300">
                        {blog.author?.name || "Rohan Shinde"}
                      </td>

                      {/* READ TIME or DELETED AT */}
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {viewRecycle ? (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {blog.deletedAt ? new Date(blog.deletedAt).toLocaleDateString() : "Recently"}
                          </span>
                        ) : (
                          blog.readTime || `${blog.readMinutes || 5} min`
                        )}
                      </td>

                      {/* SPOTLIGHT */}
                      <td className="py-3 px-4">
                        {viewRecycle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <BsRecycle className="text-xs" /> In Bin
                          </span>
                        ) : blog.featured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <LuStar /> Featured
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            isDark ? "bg-slate-800 text-gray-400" : "bg-gray-100 text-gray-600"
                          }`}>
                            Standard
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-6 text-right">
                        {viewRecycle ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isRestoring}
                              onClick={() => handleRestoreBlog(blog)}
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Restore Story"
                            >
                              <BsArrowCounterclockwise className={`text-base ${isRestoring ? "animate-spin" : ""}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingBlog({
                                  blog,
                                  isPermanent: true,
                                })
                              }
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/blog/${blog.slug || blog.id}`}
                              target="_blank"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? "text-gray-400 hover:text-blue-400 hover:bg-slate-800" : "text-gray-500 hover:text-[#2563EB] hover:bg-gray-100"
                              }`}
                              title="View Article"
                            >
                              <BsEye />
                            </Link>
                            <Link
                              to={`/admin/edit-blog/${blog.id || blog._id}`}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? "text-gray-400 hover:text-blue-400 hover:bg-slate-800" : "text-gray-500 hover:text-[#2563EB] hover:bg-gray-100"
                              }`}
                              title="Edit Story"
                            >
                              <BsPencil />
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingBlog({
                                  blog,
                                  isPermanent: false,
                                })
                              }
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? "text-gray-400 hover:text-red-400 hover:bg-slate-800" : "text-gray-500 hover:text-[#EF4444] hover:bg-gray-100"
                              }`}
                              title="Move Story to Recycle Bin"
                            >
                              <BsTrash3 />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 ${
          isDark ? "border-slate-800" : "border-[#E5E7EB]"
        }`}>
          <p>
            Showing{" "}
            <strong>
              {filteredBlogs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)}
            </strong>{" "}
            of <strong>{filteredBlogs.length}</strong> stories
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors ${
                isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
              }`}
            >
              &lt; Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === num
                      ? "bg-[#2563EB] text-white shadow-2xs"
                      : isDark
                      ? "border border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
                  }`}
                >
                  {num}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors ${
                isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
              }`}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl p-6 max-w-md w-full border shadow-2xl text-center ${
                isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center text-xl mx-auto mb-4 border border-red-500/20">
                <LuTrash2 />
              </div>
              <h3 className="text-base font-bold">
                {deletingBlog.isPermanent
                  ? `Permanently delete "${deletingBlog.blog.title}"?`
                  : `Move "${deletingBlog.blog.title}" to Recycle Bin?`}
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                {deletingBlog.isPermanent
                  ? "CAUTION: This blog story will be permanently removed and cannot be recovered."
                  : "This article will be unlisted from the live blog. You can safely restore it anytime from the Recycle Bin."}
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingBlog(null)}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? "border-slate-700 text-gray-300 hover:bg-slate-800" : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {deleteLoading
                    ? "Processing..."
                    : deletingBlog.isPermanent
                    ? "Permanently Delete"
                    : "Move to Bin"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBlogs;
