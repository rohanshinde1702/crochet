import { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsPencil,
  BsTrash3,
  BsCurrencyRupee,
  BsStarFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsExclamationCircle,
} from "react-icons/bs";
import {
  LuBoxes,
  LuPlus,
  LuDownload,
  LuPackage,
  LuTrash2,
} from "react-icons/lu";

const CATEGORIES = [
  "Decor & Gifts",
  "Pet & Animal",
  "Home & Living",
  "Kids & Baby",
  "Personalized",
];

const ITEMS_PER_PAGE = 8;

const AdminProducts = () => {
  const { globalSearch, refreshCounts, isDark } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Deleting item modal state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      if (refreshCounts) refreshCounts();
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock !== false).length;
    const outOfStock = products.filter((p) => p.inStock === false).length;
    const totalValuation = products.reduce((acc, p) => acc + (p.price || 0) * 15, 0);

    return {
      total,
      inStock,
      outOfStock,
      totalValuation,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = (globalSearch || productSearch).toLowerCase().trim();

    let list = products.filter((item) => {
      const matchSearch =
        query === "" ||
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.material?.toLowerCase().includes(query) ||
        `clp${String(item.id).padStart(3, "0")}`.includes(query);

      const matchCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const isInStock = item.inStock !== false;
      const stockCount = isInStock ? (item.price % 30) + 8 : 0;
      const isLow = isInStock && stockCount <= 10;

      let matchStock = true;
      if (stockFilter === "InStock") matchStock = isInStock && !isLow;
      else if (stockFilter === "LowStock") matchStock = isLow;
      else if (stockFilter === "OutOfStock") matchStock = !isInStock;

      return matchSearch && matchCategory && matchStock;
    });

    if (sortBy === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [products, globalSearch, productSearch, categoryFilter, stockFilter, sortBy]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const handleExecuteDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      const itemId = deletingProduct.id || deletingProduct._id;
      const res = await fetch(`http://localhost:5000/api/products/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `Moved "${deletingProduct.title}" to Recycle Bin. 🗑️`,
          },
        })
      );

      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "ID,SKU,Title,Category,Price,Material,Rating,InStock\n" +
      filteredProducts
        .map(
          (p) =>
            `${p.id},CLP${String(p.id).padStart(3, "0")},"${p.title}","${p.category}",${p.price},"${p.material || ""}",${p.rating || 5},${p.inStock !== false}`
        )
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_catalog_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Products Catalog
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Manage your complete handcrafted collection, inventory units, and catalog pricing
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <Link
            to="/admin/add-product"
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <LuPlus className="text-sm" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ================= PRODUCT METRICS STRIP ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className={`rounded-2xl p-4 border shadow-2xs flex items-center gap-3 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2563EB] flex items-center justify-center text-lg shrink-0">
            <LuPackage />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Catalog SKUs</p>
            <h4 className="text-lg font-bold">{metrics.total} creations</h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`rounded-2xl p-4 border shadow-2xs flex items-center gap-3 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg shrink-0">
            <BsCheckCircleFill />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Active In-Stock</p>
            <h4 className="text-lg font-bold text-emerald-400">{metrics.inStock} items</h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`rounded-2xl p-4 border shadow-2xs flex items-center gap-3 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-lg shrink-0">
            <BsXCircleFill />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Out of Stock</p>
            <h4 className="text-lg font-bold text-red-400">{metrics.outOfStock} items</h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`rounded-2xl p-4 border shadow-2xs flex items-center gap-3 ${
          isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg shrink-0">
            <BsCurrencyRupee />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Inventory Value</p>
            <h4 className="text-lg font-bold">
              ₹{metrics.totalValuation.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>
      </div>

      {/* ================= TABLE CARD ================= */}
      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${
        isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
      }`}>
        {/* Filter Toolbar */}
        <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark ? "border-slate-800 bg-slate-900/40" : "border-[#E5E7EB] bg-white"
        }`}>
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, SKU, or yarn material..."
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-[#2563EB] ${
                isDark ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
              }`}
            />
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>

          {/* Filters on the right */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer shadow-2xs ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-[#E5E7EB] text-[#374151]"
              }`}
            >
              <option value="All">All Stock Levels</option>
              <option value="InStock">In Stock</option>
              <option value="LowStock">Low Stock (≤ 10)</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer shadow-2xs ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-[#E5E7EB] text-[#374151]"
              }`}
            >
              <option value="newest">Sort: Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
              }`}>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? "divide-slate-800" : "divide-[#F3F4F6]"}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-medium">Loading product records...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <LuBoxes className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="font-bold text-sm">No products found</p>
                    <p className="text-xs text-gray-500 mt-0.5">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const inStock = product.inStock !== false;
                  const sku = `CLP${String(product.id || 1).padStart(3, "0")}`;
                  const stockCount = inStock ? (product.price % 30) + 8 : 0;
                  const isLowStock = inStock && stockCount <= 10;

                  return (
                    <tr key={product.id || product._id} className={`transition-colors ${
                      isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50/70"
                    }`}>
                      {/* PRODUCT */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border overflow-hidden shrink-0 ${
                            isDark ? "bg-slate-800 border-slate-700" : "bg-gray-100 border-gray-200"
                          }`}>
                            <img
                              src={product.img}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/uploads/products/decor/sunflower.png";
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h5 className="font-bold text-xs sm:text-sm truncate">
                              {product.title}
                            </h5>
                            <p className="text-[11px] text-gray-500">SKU: {sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          isDark ? "bg-slate-800 text-slate-300" : "bg-[#F3F4F6] text-[#374151]"
                        }`}>
                          {product.category}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="py-3 px-4 font-bold text-xs sm:text-sm">
                        ₹{(product.price || 0).toLocaleString("en-IN")}
                      </td>

                      {/* INVENTORY UNITS */}
                      <td className="py-3 px-4 text-xs font-semibold text-gray-400">
                        {stockCount} units
                      </td>

                      {/* RATING */}
                      <td className="py-3 px-4 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <BsStarFill className="text-amber-400 text-xs" />
                          <span>{product.rating || 5.0}</span>
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-4">
                        {inStock ? (
                          isLowStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              In Stock
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/admin/edit-product/${product.id}`}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? "text-gray-400 hover:text-blue-400 hover:bg-slate-800" : "text-gray-500 hover:text-[#2563EB] hover:bg-gray-100"
                            }`}
                            title="Edit Product"
                          >
                            <BsPencil />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(product)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? "text-gray-400 hover:text-red-400 hover:bg-slate-800" : "text-gray-500 hover:text-[#EF4444] hover:bg-gray-100"
                            }`}
                            title="Move to Recycle Bin"
                          >
                            <BsTrash3 />
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

        {/* Pagination Footer */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 ${
          isDark ? "border-slate-800" : "border-[#E5E7EB]"
        }`}>
          <p>
            Showing{" "}
            <strong>
              {filteredProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </strong>{" "}
            of <strong>{filteredProducts.length}</strong> products
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer ${
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer ${
                isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-[#E5E7EB] hover:bg-gray-50 text-[#374151]"
              }`}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl p-6 max-w-md w-full border shadow-2xl text-center ${
                isDark ? "bg-[#1E293B] border-slate-700 text-white" : "bg-white border-[#E5E7EB] text-[#111827]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl mx-auto mb-4 border border-amber-500/20">
                <BsTrash3 />
              </div>
              <h3 className="text-base font-bold">
                Move "{deletingProduct.title}" to Recycle Bin?
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                This product will be unlisted from the storefront catalog. You can safely restore it anytime from the Recycle Bin.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
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
                  {deleteLoading ? "Processing..." : "Move to Bin"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
