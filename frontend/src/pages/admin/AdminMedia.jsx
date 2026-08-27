import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BsCheck2, BsCopy, BsImage } from "react-icons/bs";
import { LuImage, LuFolder, LuDownload } from "react-icons/lu";

const MEDIA_ASSETS = [
  { name: "sunflower.png", folder: "products/decor", url: "/uploads/products/decor/sunflower.png", category: "Decor" },
  { name: "Cornus florida.png", folder: "products/decor", url: "/uploads/products/decor/Cornus florida.png", category: "Decor" },
  { name: "category-1.png", folder: "products/pet", url: "/uploads/products/pet/category-1.png", category: "Pet" },
  { name: "category-1.png", folder: "products/home", url: "/uploads/products/home/category-1.png", category: "Home" },
  { name: "category-1.png", folder: "products/kids", url: "/uploads/products/kids/category-1.png", category: "Kids" },
  { name: "category-1.png", folder: "products/custom", url: "/uploads/products/custom/category-1.png", category: "Custom" },
  { name: "blog_yarn_selection.jpg", folder: "blogs", url: "/uploads/blogs/blog_yarn_selection_1787376883256.jpg", category: "Blogs" },
  { name: "blog_hero_banner.jpg", folder: "blogs", url: "/uploads/blogs/blog_hero_banner_1787376863197.jpg", category: "Blogs" },
  { name: "shop-hero.jpg", folder: "hero", url: "/uploads/hero/shop-hero.jpg", category: "Hero" },
  { name: "maker.png", folder: "others", url: "/uploads/others/maker.png", category: "Others" },
];

const AdminMedia = () => {
  const { isDark } = useOutletContext();
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [copiedUrl, setCopiedUrl] = useState(null);

  const filteredAssets = selectedFolder === "All"
    ? MEDIA_ASSETS
    : MEDIA_ASSETS.filter((a) => a.category.toLowerCase() === selectedFolder.toLowerCase());

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(url);
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message: "Media URL copied to clipboard! 📋" },
      })
    );
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Media Library
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-[#6B7280]"}`}>
            Browse, manage, and copy URLs of uploaded product images, blog assets, and banners
          </p>
        </div>

        <div className={`inline-flex p-1 rounded-xl border shadow-2xs ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
        }`}>
          {["All", "Decor", "Pet", "Home", "Kids", "Custom", "Blogs"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFolder(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFolder === cat
                  ? "bg-[#2563EB] text-white shadow-xs font-bold"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAssets.map((asset, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border overflow-hidden shadow-2xs hover:shadow-xs transition-shadow group flex flex-col justify-between ${
              isDark ? "bg-[#1E293B] border-slate-800" : "bg-white border-[#E5E7EB]"
            }`}
          >
            <div className={`aspect-square overflow-hidden relative flex items-center justify-center ${
              isDark ? "bg-slate-900" : "bg-gray-50"
            }`}>
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "/uploads/products/decor/sunflower.png";
                }}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                {asset.category}
              </span>
            </div>

            <div className="p-3">
              <p className="text-xs font-bold truncate">{asset.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{asset.folder}</p>

              <button
                type="button"
                onClick={() => handleCopyLink(asset.url)}
                className={`mt-2.5 w-full py-1.5 border rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200" : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                }`}
              >
                {copiedUrl === asset.url ? (
                  <>
                    <BsCheck2 className="text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <BsCopy className="text-gray-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMedia;
