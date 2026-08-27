import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowLeft,
  BsCloudArrowUp,
  BsImage,
  BsFolder2Open,
  BsCurrencyRupee,
  BsCheck2,
  BsExclamationCircle,
  BsShieldLock,
  BsStars,
  BsEye,
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuPackage, LuPlus, LuDownload } from "react-icons/lu";

const CATEGORIES = [
  "Decor & Gifts",
  "Pet & Animal",
  "Home & Living",
  "Kids & Baby",
  "Personalized",
];

const CATEGORY_ICONS = {
  "Decor & Gifts": "🌻",
  "Pet & Animal": "🐾",
  "Home & Living": "🏡",
  "Kids & Baby": "👶",
  "Personalized": "🎁",
};

const getCategoryFolder = (category) => {
  if (!category) return "decor";
  const cat = category.toLowerCase().trim();
  if (cat.includes("decor") || cat.includes("gift")) return "decor";
  if (cat.includes("pet") || cat.includes("animal")) return "pet";
  if (cat.includes("home") || cat.includes("living")) return "home";
  if (cat.includes("kids") || cat.includes("baby")) return "kids";
  if (cat.includes("person") || cat.includes("custom")) return "custom";
  return "decor";
};

const PRESET_IMAGES = [
  { label: "Sunflower Pot", url: "/uploads/products/decor/sunflower.png", category: "Decor & Gifts" },
  { label: "Chick Plushie", url: "/uploads/products/pet/category-1.png", category: "Pet & Animal" },
  { label: "Daisy Coaster", url: "/uploads/products/home/category-1.png", category: "Home & Living" },
  { label: "Bunny Rattle", url: "/uploads/products/kids/category-1.png", category: "Kids & Baby" },
  { label: "Custom Keychain", url: "/uploads/products/custom/category-1.png", category: "Personalized" },
  { label: "Cornus Florida", url: "/uploads/products/decor/Cornus florida.png", category: "Decor & Gifts" },
];

const INITIAL_FORM = {
  title: "",
  category: "Decor & Gifts",
  price: "",
  img: "/uploads/products/decor/sunflower.png",
  badge: "New",
  material: "100% Organic Cotton Yarn",
  description: "Handcrafted with premium yarn, love, and careful attention to every stitch.",
  tags: "Crochet, Handmade, Cozy",
  inStock: true,
  rating: 5.0,
  reviewsCount: 0,
};

const AddProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Auth check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin =
      storedUser &&
      (storedUser.role === "admin" ||
        storedUser.email === "admin@cozyloops.com");

    if (isAdmin) {
      setCurrentUser(storedUser);
      setIsAuthorized(true);
      setCheckingAuth(false);
    } else {
      setIsAuthorized(false);
      setCheckingAuth(false);
    }
  }, []);

  // Fetch product if in edit mode
  useEffect(() => {
    if (isEdit && isAuthorized) {
      setLoadingInitial(true);
      fetch(`http://localhost:5000/api/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Product not found");
          return res.json();
        })
        .then((data) => {
          setFormData({
            title: data.title || "",
            category: data.category || "Decor & Gifts",
            price: data.price || "",
            img: data.img || "/uploads/products/decor/sunflower.png",
            badge: data.badge || "",
            material: data.material || "",
            description: data.description || "",
            tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
            inStock: data.inStock !== false,
            rating: data.rating || 5.0,
            reviewsCount: data.reviewsCount || 0,
          });
          setLoadingInitial(false);
        })
        .catch((err) => {
          setFormError(err.message || "Failed to load product details.");
          setLoadingInitial(false);
        });
    }
  }, [id, isEdit, isAuthorized]);

  // Image Upload handler
  const handleImageFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setFormError("Please select a valid image file (.jpg, .jpeg, .png, .webp, .gif, .avif).");
    }

    setUploadingImage(true);
    setFormError("");

    try {
      const uploadData = new FormData();
      uploadData.append("category", formData.category);
      uploadData.append("image", file);

      const res = await fetch(
        `http://localhost:5000/api/upload?category=${encodeURIComponent(formData.category)}`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload image.");

      setFormData((prev) => ({ ...prev, img: data.url }));

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `📸 Stored in backend/uploads/products/${data.folder}/!`,
          },
        })
      );
    } catch (err) {
      setFormError(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return setFormError("Product Title is required.");
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      return setFormError("Please enter a valid price greater than ₹0.");
    }
    if (!formData.img.trim()) {
      return setFormError("Product Image URL is required.");
    }

    setFormLoading(true);
    setFormError("");

    try {
      const url = isEdit
        ? `http://localhost:5000/api/products/${id}`
        : "http://localhost:5000/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: isEdit
              ? `"${formData.title}" updated successfully! ✨`
              : `"${formData.title}" published to live store! 🧶`,
          },
        })
      );

      navigate("/admin");
    } catch (err) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  if (checkingAuth || loadingInitial) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-sm font-bold text-[#111827]">
            {isEdit ? "Loading Product Details..." : "Authenticating Administrator..."}
          </h3>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-[#E5E7EB] shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center text-3xl mx-auto mb-4 border border-[#FEE2E2]">
            <BsShieldLock />
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Admin Access Required</h2>
          <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">
            Only authorized store administrators may create or edit catalog products.
          </p>
          <div className="flex gap-3 mt-6 justify-center">
            <Link
              to="/signin"
              className="px-6 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 bg-[#F3F4F6] text-[#374151] text-xs font-bold rounded-xl"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#374151] transition-colors"
          >
            <BsArrowLeft className="text-sm" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs font-semibold text-[#6B7280]">
            {isEdit ? `Edit Product #${id}` : "Add New Product"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] hover:bg-gray-200 text-[#374151] rounded-xl text-xs font-bold transition-colors"
          >
            <BsEye className="text-xs text-[#2563EB]" />
            <span>View Store</span>
          </Link>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            {isEdit ? `Edit Product #${id}` : "Add New Product"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Fill in the specifications below to publish or update this handcrafted creation.
          </p>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] rounded-2xl text-xs font-semibold flex items-center gap-3">
            <BsExclamationCircle className="text-lg shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-2xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Basic Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  1. Product Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Handmade Sunflower Pot"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_ICONS[cat]} {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        Badge / Tag
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g. Best Seller / New"
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Stock */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  2. Pricing & Stock
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Price (₹ INR) *
                    </label>
                    <div className="relative">
                      <BsCurrencyRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="899"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-bold text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Inventory Status
                    </label>
                    <select
                      value={formData.inStock ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.value === "true" })}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="true">🟢 In Stock (Ready to Ship)</option>
                      <option value="false">🔴 Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F3F4F6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                    3. Product Image *
                  </h3>

                  <div className="inline-flex p-0.5 bg-gray-100 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        uploadMode === "file" ? "bg-white text-[#2563EB] shadow-2xs" : "text-gray-600"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        uploadMode === "url" ? "bg-white text-[#2563EB] shadow-2xs" : "text-gray-600"
                      }`}
                    >
                      URL / Presets
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e.target.files?.[0])}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleImageFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        dragOver ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white"
                      }`}
                    >
                      {uploadingImage ? (
                        <div className="py-2">
                          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs font-bold text-[#2563EB]">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-xl">
                            <BsCloudArrowUp />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111827]">
                              Click to <span className="text-[#2563EB] underline">Upload Image</span> or drag & drop
                            </p>
                            <p className="text-[10px] text-[#6B7280]">PNG, JPG, WEBP up to 15MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.img}
                      onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                      placeholder="/uploads/products/decor/sunflower.png or https://..."
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">Presets:</span>
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, img: preset.url, category: preset.category })
                          }
                          className="text-[10px] px-2 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Specifications */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  4. Material & Description
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        Yarn Material
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="100% Organic Soft Cotton Yarn"
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        Tags (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="Plushie, Gift, Soft"
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Handcrafted with premium yarn, love, and attention to detail."
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
                <Link
                  to="/admin"
                  className="px-5 py-2.5 border border-[#E5E7EB] text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  <BsCheck2 className="text-base" />
                  <span>{formLoading ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3 pb-2 border-b border-gray-100">
                Live Card Preview
              </h4>

              <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB] max-w-xs mx-auto">
                <div className="aspect-square rounded-lg bg-white overflow-hidden border border-gray-200 relative mb-3">
                  <img
                    src={formData.img || "/uploads/products/decor/sunflower.png"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/uploads/products/decor/sunflower.png";
                    }}
                  />
                  {formData.badge && (
                    <span className="absolute top-2 left-2 bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {formData.badge}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase">
                    {formData.category}
                  </span>
                  <h5 className="font-bold text-sm text-[#111827] truncate mt-0.5">
                    {formData.title || "Handcrafted Product"}
                  </h5>
                  <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                    {formData.description || "Handcrafted with premium yarn."}
                  </p>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#111827] font-['Outfit',sans-serif]">
                      ₹{formData.price ? Number(formData.price).toLocaleString("en-IN") : "0"}
                    </span>
                    <span className="text-[10px] font-semibold text-[#10B981]">
                      {formData.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
