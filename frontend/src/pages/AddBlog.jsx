import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowLeft,
  BsCloudArrowUp,
  BsImage,
  BsClock,
  BsCheck2,
  BsExclamationCircle,
  BsShieldLock,
  BsEye,
} from "react-icons/bs";
import { LuBookOpen, LuStar } from "react-icons/lu";

const BLOG_CATEGORIES = [
  "Crochet Guides",
  "Patterns & Inspo",
  "Yarn 101",
  "Care & Tips",
  "Behind The Stitches",
  "Cozy Living",
];

const PRESET_BLOG_IMAGES = [
  { label: "Yarn Selection", url: "/uploads/blogs/blog_yarn_selection_1787376883256.jpg", category: "Yarn 101" },
  { label: "Amigurumi Making", url: "/uploads/blogs/blog_amigurumi_making_1787376901909.jpg", category: "Crochet Guides" },
  { label: "Crochet Care", url: "/uploads/blogs/blog_crochet_care_1787376919974.jpg", category: "Care & Tips" },
  { label: "Hero Banner", url: "/uploads/blogs/blog_hero_banner_1787376863197.jpg", category: "Patterns & Inspo" },
];

const INITIAL_BLOG_FORM = {
  title: "",
  slug: "",
  category: "Crochet Guides",
  readTime: "5 min read",
  readMinutes: 5,
  featured: false,
  authorName: "Rohan Shinde",
  authorRole: "Master Artisan & Founder",
  authorAvatar: "/uploads/others/maker.png",
  img: "/uploads/blogs/blog_yarn_selection_1787376883256.jpg",
  excerpt: "",
  tags: "Crochet, Handmade, Tips",
  content: "",
};

const AddBlog = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState(INITIAL_BLOG_FORM);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Auth verification
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

  // Fetch blog in edit mode
  useEffect(() => {
    if (isEdit && isAuthorized) {
      setLoadingInitial(true);
      fetch(`http://localhost:5000/api/blogs/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Blog story not found");
          return res.json();
        })
        .then((data) => {
          const contentText = Array.isArray(data.content)
            ? data.content.map((c) => c.text).filter(Boolean).join("\n\n")
            : typeof data.content === "string"
            ? data.content
            : "";

          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            category: data.category || "Crochet Guides",
            readTime: data.readTime || "5 min read",
            readMinutes: data.readMinutes || 5,
            featured: Boolean(data.featured),
            authorName: data.author?.name || "Rohan Shinde",
            authorRole: data.author?.role || "Master Artisan & Founder",
            authorAvatar: data.author?.avatar || "/uploads/others/maker.png",
            img: data.img || "/uploads/blogs/blog_yarn_selection_1787376883256.jpg",
            excerpt: data.excerpt || "",
            tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
            content: contentText,
          });
          setLoadingInitial(false);
        })
        .catch((err) => {
          setFormError(err.message || "Failed to load blog story details.");
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
      uploadData.append("category", "blogs");
      uploadData.append("type", "blog");
      uploadData.append("image", file);

      const res = await fetch("http://localhost:5000/api/upload?category=blogs&type=blog", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload image.");

      setFormData((prev) => ({ ...prev, img: data.url }));

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: `📸 Blog cover stored in backend/uploads/blogs/!`,
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
      return setFormError("Story Title is required.");
    }
    if (!formData.category.trim()) {
      return setFormError("Category is required.");
    }
    if (!formData.img.trim()) {
      return setFormError("Cover Image is required.");
    }

    setFormLoading(true);
    setFormError("");

    try {
      const url = isEdit
        ? `http://localhost:5000/api/blogs/${id}`
        : "http://localhost:5000/api/blogs";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category.trim(),
        readTime: `${formData.readMinutes || 5} min read`,
        readMinutes: Number(formData.readMinutes) || 5,
        featured: Boolean(formData.featured),
        author: {
          name: formData.authorName.trim(),
          role: formData.authorRole.trim(),
          avatar: formData.authorAvatar.trim(),
        },
        img: formData.img.trim(),
        excerpt: formData.excerpt.trim(),
        tags: formData.tags,
        content: formData.content,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save story");

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: {
            message: isEdit
              ? `"${formData.title}" updated successfully! ✨`
              : `"${formData.title}" published to live blog! 📝🧶`,
          },
        })
      );

      navigate("/admin");
    } catch (err) {
      setFormError(err.message || "Failed to save story.");
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
            {isEdit ? "Loading Handcrafted Story..." : "Authenticating Administrator..."}
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
            Only authorized store administrators may publish or edit blog articles.
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
            {isEdit ? `Edit Story #${id}` : "Publish New Story"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] hover:bg-gray-200 text-[#374151] rounded-xl text-xs font-bold transition-colors"
          >
            <BsEye className="text-xs text-[#2563EB]" />
            <span>View Public Blog</span>
          </Link>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            {isEdit ? `Edit Story #${id}` : "Write & Publish New Story"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Share handcrafted guides, pattern inspirations, yarn selection tips, and behind-the-scenes stories.
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
              {/* 1. Title & Category */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  1. Title & Topic
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle
                          .toLowerCase()
                          .trim()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-");
                        setFormData({
                          ...formData,
                          title: newTitle,
                          slug: isEdit ? formData.slug : autoSlug,
                        });
                      }}
                      placeholder="e.g. The Ultimate Guide to Choosing the Perfect Yarn"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        Topic Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                      >
                        {BLOG_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-1.5">
                        SEO URL Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. ultimate-guide-to-yarn"
                        className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Timing & Spotlight */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  2. Timing & Spotlight
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Read Duration (Minutes)
                    </label>
                    <div className="relative">
                      <BsClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.readMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            readMinutes: e.target.value,
                            readTime: `${e.target.value || 5} min read`,
                          })
                        }
                        placeholder="5"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-bold text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Spotlight Status
                    </label>
                    <select
                      value={formData.featured ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.value === "true" })}
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-semibold text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="false">Standard Story</option>
                      <option value="true">⭐ Featured Spotlight</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Author Details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  3. Author Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="Rohan Shinde"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Author Role
                    </label>
                    <input
                      type="text"
                      value={formData.authorRole}
                      onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                      placeholder="Master Artisan & Founder"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={formData.authorAvatar}
                      onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                      placeholder="/uploads/others/maker.png"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Cover Image */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F3F4F6]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                    4. Cover Image *
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
                      Presets
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
                              Click to <span className="text-[#2563EB] underline">Upload Cover Art</span> or drag & drop
                            </p>
                            <p className="text-[10px] text-[#6B7280]">High resolution JPG, PNG, WEBP</p>
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
                      placeholder="/uploads/blogs/blog_yarn_selection_1787376883256.jpg or https://..."
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold">Presets:</span>
                      {PRESET_BLOG_IMAGES.map((preset, idx) => (
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

              {/* 5. Excerpt & Tags */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  5. Excerpt & Tags
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Story Excerpt / Teaser *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief teaser to hook readers on blog cards..."
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#374151] mb-1.5">
                      Search Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Yarn 101, Beginners, Cotton"
                      className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Body Content */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-3 pb-2 border-b border-[#F3F4F6]">
                  6. Story Content Body
                </h3>

                <textarea
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your handcrafted article here...

Stepping into a yarn studio or browsing through endless skeins online can be wonderfully overwhelming."
                  className="w-full px-3.5 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] font-serif leading-relaxed"
                />
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
                  <span>{formLoading ? "Publishing..." : isEdit ? "Update Story" : "Publish Story"}</span>
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
                <div className="aspect-[16/10] rounded-lg bg-white overflow-hidden border border-gray-200 relative mb-3">
                  <img
                    src={formData.img || "/uploads/blogs/blog_yarn_selection_1787376883256.jpg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/uploads/blogs/blog_yarn_selection_1787376883256.jpg";
                    }}
                  />
                  {formData.featured && (
                    <span className="absolute top-2 right-2 bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <LuStar className="text-xs" /> Featured
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase">
                    {formData.category}
                  </span>
                  <h5 className="font-bold text-sm text-[#111827] line-clamp-2 mt-0.5 leading-snug">
                    {formData.title || "Handcrafted Crochet Story"}
                  </h5>
                  <p className="text-xs text-[#6B7280] line-clamp-2 mt-1">
                    {formData.excerpt || "Brief excerpt of your article."}
                  </p>
                  <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>By {formData.authorName || "Rohan"}</span>
                    <span>{formData.readMinutes || 5} min read</span>
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

export default AddBlog;
