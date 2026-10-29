import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsListUl,
  BsSearch,
  BsX,
  BsShare,
  BsClock,
  BsCalendar3,
  BsChatDots,
  BsArrowRight,
  BsChevronLeft,
  BsChevronRight,
  BsGrid3X3Gap,
  BsFunnel,
  BsSliders2,
  BsLayoutSidebarInset,
  BsFire,
  BsTag
} from "react-icons/bs";
import { GiSewingNeedle, GiYarn } from "react-icons/gi";
import { LuBookOpen, LuHandHeart, LuRotateCcw, LuClock } from "react-icons/lu";
import { getBlogs } from "../services/dataService";

const BLOG_CATEGORIES = [
  "All Stories",
  "Crochet Guides",
  "Patterns & Inspo",
  "Yarn 101",
  "Care & Tips",
  "Behind The Stitches",
  "Cozy Living"
];

const READ_TIME_OPTIONS = [
  { id: "all", label: "All Read Times" },
  { id: "quick", label: "Quick Reads (< 5 min)" },
  { id: "medium", label: "Standard (5 – 8 min)" },
  { id: "deep", label: "Deep Guides (8+ min)" }
];

const ITEMS_PER_PAGE = 8;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch blogs
  useEffect(() => {
    getBlogs()
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading blogs:", err);
        setLoading(false);
      });

    const handleUpdate = () => {
      getBlogs().then((data) => {
        if (Array.isArray(data)) setBlogs(data);
      });
    };
    window.addEventListener("blogsUpdated", handleUpdate);
    return () => window.removeEventListener("blogsUpdated", handleUpdate);
  }, []);

  // Category and Filter states
  const selectedCategory = searchParams.get("category") || "All Stories";
  const selectedTag = searchParams.get("tag") || "";
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [readTimeFilter, setReadTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [layoutMode, setLayoutMode] = useState("grid4"); // "grid4" or "list"
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filterbar Display Options:
  // Layout is determined by the Header Dropdown selection (/blog, /blog-sidebar, /blog-drawer or ?layout=...)
  const filterMode = useMemo(() => {
    if (location.pathname.includes("sidebar")) return "sidebar";
    if (location.pathname.includes("drawer")) return "drawer";
    const layout = searchParams.get("layout");
    if (layout === "sidebar" || layout === "drawer" || layout === "top") return layout;
    return "top"; // Original top filter bar is default
  }, [location.pathname, searchParams]);

  // Helper: Trigger custom toast
  const triggerToast = (message) => {
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message }
      })
    );
  };

  // Share Article Action
  const handleShare = (article, e) => {
    if (e) e.preventDefault();
    const url = `${window.location.origin}/blog/${article.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      triggerToast("Article link copied to clipboard!");
    } else {
      triggerToast("Sharing: " + article.title);
    }
  };

  // Category selection handler
  const handleCategoryClick = (category) => {
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    if (category === "All Stories") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }
    setSearchParams(nextParams);
  };

  // Tag selection handler
  const handleTagClick = (tag) => {
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    const current = nextParams.get("tag") || "";
    if (current.toLowerCase() === tag.toLowerCase()) {
      nextParams.delete("tag");
    } else {
      nextParams.set("tag", tag);
    }
    setSearchParams(nextParams);
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setReadTimeFilter("all");
    setSortBy("latest");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    nextParams.delete("tag");
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { "All Stories": blogs.length };
    BLOG_CATEGORIES.forEach((cat) => {
      if (cat !== "All Stories") {
        counts[cat] = blogs.filter(
          (b) => b.category && b.category.toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [blogs]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    blogs.forEach((b) => {
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [blogs]);

  // Trending Stories (most comments & likes)
  const trendingStories = useMemo(() => {
    return [...blogs]
      .sort((a, b) => ((b.commentsCount || 0) + (b.likesCount || 0)) - ((a.commentsCount || 0) + (a.likesCount || 0)))
      .slice(0, 3);
  }, [blogs]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All Stories") count++;
    if (selectedTag) count++;
    if (searchQuery.trim()) count++;
    if (readTimeFilter !== "all") count++;
    return count;
  }, [selectedCategory, selectedTag, searchQuery, readTimeFilter]);

  const hasActiveFilters = activeFiltersCount > 0 || sortBy !== "latest";

  // Filter & Sort Logic
  const filteredBlogs = useMemo(() => {
    let list = [...blogs];

    // Category filter
    if (selectedCategory !== "All Stories") {
      list = list.filter(
        (b) => b.category && b.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Tag filter
    if (selectedTag) {
      list = list.filter(
        (b) =>
          b.tags &&
          b.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Read Time filter
    if (readTimeFilter !== "all") {
      if (readTimeFilter === "quick") {
        list = list.filter((b) => (b.readMinutes || 0) < 5);
      } else if (readTimeFilter === "medium") {
        list = list.filter((b) => (b.readMinutes || 0) >= 5 && (b.readMinutes || 0) <= 8);
      } else if (readTimeFilter === "deep") {
        list = list.filter((b) => (b.readMinutes || 0) > 8);
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q) ||
          b.author?.name?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          (b.tags && b.tags.some((t) => t.toLowerCase() === q))
      );
    }

    // Sorting
    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.isoDate || 0) - new Date(b.isoDate || 0));
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    } else if (sortBy === "read-short") {
      list.sort((a, b) => (a.readMinutes || 0) - (b.readMinutes || 0));
    } else if (sortBy === "read-long") {
      list.sort((a, b) => (b.readMinutes || 0) - (a.readMinutes || 0));
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [blogs, selectedCategory, selectedTag, readTimeFilter, searchQuery, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.getElementById("blog-grid-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Category Icon Resolver
  const getCategoryIcon = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("all")) return <LuBookOpen className="text-sm" />;
    if (cat.includes("guide")) return <GiSewingNeedle className="text-sm" />;
    if (cat.includes("pattern") || cat.includes("inspo")) return <BsGrid3X3Gap className="text-sm" />;
    if (cat.includes("yarn")) return <GiYarn className="text-sm" />;
    if (cat.includes("care") || cat.includes("tip")) return <LuHandHeart className="text-sm" />;
    if (cat.includes("behind") || cat.includes("stitch")) return <BsChatDots className="text-sm" />;
    if (cat.includes("living")) return <BsFire className="text-sm" />;
    return <LuBookOpen className="text-sm" />;
  };

  // Reusable Filter Bar Content (Rendered both in Left Sidebar and Slide-Out Drawer)
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Search Input Widget */}
      <div>
        <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <BsSearch className="text-[#F88897]" />
          <span>Search Stories</span>
        </h4>
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search keywords, yarn, guides..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#EADFD4] rounded-xl text-xs text-[#6C2C12] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C2C12] cursor-pointer"
            >
              <BsX className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Blog Categories Widget */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider">
            Categories
          </h4>
          <span className="text-[10px] text-gray-400 font-semibold">
            {BLOG_CATEGORIES.length} Topics
          </span>
        </div>
        <div className="space-y-1">
          {BLOG_CATEGORIES.map((category) => {
            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
            const count = categoryCounts[category] || 0;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#6C2C12] text-white shadow-xs"
                    : "text-[#6C2C12] hover:bg-white border border-transparent hover:border-[#EADFD4]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{getCategoryIcon(category)}</span>
                  <span className="truncate">{category}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading Duration Filter */}
      <div>
        <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <LuClock className="text-[#F88897]" />
          <span>Reading Duration</span>
        </h4>
        <div className="space-y-1.5">
          {READ_TIME_OPTIONS.map((opt) => {
            const isSelected = readTimeFilter === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => {
                  setReadTimeFilter(opt.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white border-[#6C2C12] text-[#6C2C12] shadow-2xs"
                    : "bg-[#FAF6F0] border-[#EADFD4] text-gray-600 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? "border-[#6C2C12] bg-[#6C2C12]" : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </div>
                  <span>{opt.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Popular Tags Cloud */}
      {allTags.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <BsTag className="text-[#F88897]" />
            <span>Popular Tags</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#6C2C12] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Stories Widget */}
      {trendingStories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <BsFire className="text-amber-500" />
            <span>Trending Stories</span>
          </h4>
          <div className="space-y-2.5">
            {trendingStories.map((story) => (
              <Link
                key={story.id}
                to={`/blog/${story.id}`}
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#EADFD4] hover:border-[#6C2C12] transition-all group"
              >
                <img
                  src={story.img}
                  alt={story.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-[12px] font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors line-clamp-1 leading-snug">
                    {story.title}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <BsClock className="text-[9px]" /> {story.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BsChatDots className="text-[9px]" /> {story.commentsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reset CTA */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-[#EADFD4]">
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <LuRotateCcw className="text-sm" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );

  // Animation variants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 14
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* ======================================================== */}
      {/* SLIDE-OUT LEFT DRAWER FILTER PANEL (OPTION 2 & MOBILE)    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Left Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-[#FAF6F0] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-r border-[#EADFD4]"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[#EADFD4] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#FAF3EB] text-[#F88897] flex items-center justify-center">
                    <BsSliders2 className="text-base" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#6C2C12] text-sm sm:text-base">Filter Stories</h3>
                    <p className="text-[10px] text-gray-500">Refine by topic, tags, or read duration</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-colors text-[#6C2C12] cursor-pointer"
                >
                  <BsX className="text-2xl" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5">{renderFilterContent()}</div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#EADFD4] bg-white flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADFD4] text-xs font-bold text-[#6C2C12] hover:bg-[#FAF6F0] transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Apply ({filteredBlogs.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 1. HERO BANNER SECTION                                   */}
      {/* ======================================================== */}
      <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px] bg-[#FAF3EB] overflow-hidden flex items-center border-b border-[#F2ECE4]">
        {/* Background Image with Parallax / Zoom In */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center w-full h-full bg-[url('/uploads/blogs/blog_hero_banner_1787376863197.jpg')]"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Artistic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6F0]/95 via-[#FAF6F0]/85 to-transparent sm:w-4/5 md:w-3/4 lg:w-2/3" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#6C2C12]/5 to-[#6C2C12]/20 mix-blend-multiply pointer-events-none" />

        <div className="container relative z-10 py-12 sm:py-16">
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Tag Badge */}
            <motion.div
              variants={heroItemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C2C12]/10 backdrop-blur-md border border-[#6C2C12]/15 text-[#6C2C12] text-xs font-bold uppercase tracking-[2px] mb-3 sm:mb-4"
            >
              <GiYarn className="text-sm text-[#F88897]" />
              <span>CozyLoops Craft Journal</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={heroItemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-[#6C2C12] mb-3 sm:mb-4"
            >
              Stories, Stitches &amp; <br />
              <span className="text-[#F88897] rouge-script-regular text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal">
                Handmade Inspiration
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={heroItemVariants}
              className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 sm:mb-8 max-w-xl"
            >
              Explore artisan crochet patterns, beginner tutorials, yarn selection wisdom, and mindful slow-living reflections written with love by our craft community.
            </motion.p>

            {/* Quick Hero Action Badges */}
            <motion.div
              variants={heroItemVariants}
              className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-[#6C2C12]"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 shadow-sm border border-[#EADFD4]">
                <LuBookOpen className="text-base text-[#F88897]" />
                <span>{blogs.length} Curated Stories</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 shadow-sm border border-[#EADFD4]">
                <GiSewingNeedle className="text-base text-[#F88897]" />
                <span>Free Pattern Guides</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 shadow-sm border border-[#EADFD4]">
                <LuHandHeart className="text-base text-[#F88897]" />
                <span>100% Handcrafted Love</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN BLOG LISTING & CONTROLS                         */}
      {/* ======================================================== */}
      <div id="blog-grid-section" className="container pt-10 pb-16 scroll-mt-24">
        {/* Style 1: Original Top Category Pills Bar (visible when filterMode === 'top') */}
        {filterMode === "top" && (
          <div className="mb-6 pb-2 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
            {BLOG_CATEGORIES.map((category) => {
              const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#6C2C12] text-white shadow-md shadow-[#6C2C12]/20 scale-102"
                      : "bg-white text-gray-600 border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white"
                  }`}
                >
                  <span className="text-sm opacity-90">{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#FAF3EB] text-[#8C6D62]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* TOP TOOLBAR: FILTERBAR MODE SWITCHER & SORTING           */}
        {/* ======================================================== */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#EADFD4] mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Left Controls: Filter Button (in Drawer mode or mobile) + Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Button (Opens Left Drawer) - Visible when in Drawer mode, or on mobile */}
              {(filterMode === "drawer" || filterMode === "sidebar") && (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                    filterMode === "drawer"
                      ? "bg-[#6C2C12] hover:bg-[#F88897] text-white"
                      : "lg:hidden bg-[#6C2C12] text-white"
                  }`}
                >
                  <BsFunnel className="text-sm" />
                  <span>Filter Stories</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#F88897] text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}

              {/* Search Input */}
              <div className="relative min-w-[200px] max-w-xs flex-1">
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search keywords, yarn, guides..."
                  className="w-full pl-8 pr-7 py-2 bg-white border border-[#EADFD4] rounded-xl text-xs sm:text-sm text-[#6C2C12] placeholder-gray-400 focus:outline-none focus:border-[#6C2C12] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6C2C12] cursor-pointer"
                  >
                    <BsX className="text-base" />
                  </button>
                )}
              </div>

              {/* Reading Duration selector (Quick filter in Top mode) */}
              {filterMode === "top" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 hidden xl:inline">
                    Read Time:
                  </span>
                  <select
                    value={readTimeFilter}
                    onChange={(e) => {
                      setReadTimeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
                  >
                    {READ_TIME_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Controls: Filter Style Dropdown + Sort + Grid/List View Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                <strong className="text-[#6C2C12]">{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? "story" : "stories"}
              </span>



              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="latest">Latest Stories</option>
                  <option value="popular">Most Popular</option>
                  <option value="read-short">Shortest Read</option>
                  <option value="read-long">In-Depth Guides</option>
                  <option value="title-asc">Title: A to Z</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* 4/4 Grid and List View Option Toggle */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-[#EADFD4]">
                <button
                  type="button"
                  onClick={() => setLayoutMode("grid4")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === "grid4"
                      ? "bg-[#6C2C12] text-white shadow-sm"
                      : "text-gray-500 hover:text-[#6C2C12]"
                  }`}
                  title="Grid View"
                >
                  <BsGrid3X3Gap className="text-sm" />
                  <span className="hidden sm:inline">Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === "list"
                      ? "bg-[#6C2C12] text-white shadow-sm"
                      : "text-gray-500 hover:text-[#6C2C12]"
                  }`}
                  title="List View"
                >
                  <BsListUl className="text-sm" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-[#EADFD4] text-xs">
              <span className="font-semibold text-gray-500">Active filters:</span>

              {selectedCategory !== "All Stories" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>Topic: {selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryClick("All Stories")}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <BsX />
                  </button>
                </span>
              )}

              {selectedTag && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>Tag: #{selectedTag}</span>
                  <button
                    onClick={() => handleTagClick(selectedTag)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <BsX />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchParams.delete("search");
                      setSearchParams(searchParams);
                    }}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <BsX />
                  </button>
                </span>
              )}

              {readTimeFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#EADFD4] text-[#6C2C12] font-semibold">
                  <span>{READ_TIME_OPTIONS.find((r) => r.id === readTimeFilter)?.label}</span>
                  <button onClick={() => setReadTimeFilter("all")} className="hover:text-red-500 cursor-pointer">
                    <BsX />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-xs font-bold text-[#F88897] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LuRotateCcw /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: OPTION 1 (LEFT SIDEBAR) vs OPTION 2 (DRAWER)  */}
        {/* ======================================================== */}
        <div
          className={
            filterMode === "sidebar"
              ? "flex flex-col lg:flex-row gap-8 items-start"
              : "w-full"
          }
        >
          {/* OPTION 1: Fixed Left Sidebar (visible on lg+ when filterMode === 'sidebar') */}
          {filterMode === "sidebar" && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 bg-[#FAF6F0] p-6 rounded-3xl border border-[#EADFD4] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EADFD4]">
                <div className="flex items-center gap-2">
                  <BsLayoutSidebarInset className="text-base text-[#F88897]" />
                  <h3 className="font-bold text-[#6C2C12] text-sm uppercase tracking-wider">
                    Filters
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-[#F88897] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>
              {renderFilterContent()}
            </aside>
          )}

          {/* MAIN ARTICLES GRID / LIST VIEW */}
          <div className="flex-1 min-w-0 w-full">
            {/* Loading Spinner */}
            {loading && (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-[#6C2C12] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#6C2C12]">
                  Gathering craft stories...
                </p>
              </div>
            )}

            {!loading && filteredBlogs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EADFD4] p-12 text-center my-6">
                <div className="w-16 h-16 rounded-full bg-[#FAF3EB] flex items-center justify-center mx-auto mb-4 text-[#6C2C12] text-2xl">
                  <GiYarn />
                </div>
                <h3 className="text-xl font-bold text-[#6C2C12] mb-2">
                  No stories found
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any articles matching your search criteria. Try searching with different keywords or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#6C2C12] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#F88897] transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : !loading && layoutMode === "grid4" ? (
              /* ======================================================== */
              /* GRID VIEW (Adapts columns depending on Sidebar mode)     */
              /* ======================================================== */
              <motion.div
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className={
                  filterMode === "sidebar"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7"
                }
              >
                {paginatedBlogs.map((blog) => {
                  return (
                    <motion.article
                      key={blog.id}
                      variants={cardVariants}
                      className="bg-white rounded-2xl border border-[#EADFD4] shadow-[0_4px_20px_rgba(108,44,18,0.04)] overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-md"
                    >
                      {/* Card Thumbnail */}
                      <Link
                        to={`/blog/${blog.id}`}
                        className="relative aspect-[16/10] overflow-hidden bg-gray-100 block"
                      >
                        <img
                          src={blog.img}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                        />

                        {/* Category Pill */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#FAF6F0]/90 backdrop-blur-md text-[#6C2C12] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#EADFD4] shadow-xs">
                            {blog.category}
                          </span>
                        </div>

                        {/* Reading Time Badge */}
                        <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <BsClock className="text-[9px]" />
                          <span>{blog.readTime}</span>
                        </div>
                      </Link>

                      {/* Card Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-[12px] text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <BsCalendar3 className="text-[#F88897]" />
                              {blog.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <BsChatDots className="text-gray-400" />
                              {blog.commentsCount || 0}
                            </span>
                          </div>

                          {/* Title */}
                          <Link to={`/blog/${blog.id}`}>
                            <h3 className="text-sm sm:text-base font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors leading-snug mb-2 line-clamp-2 cursor-pointer">
                              {blog.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                            {blog.excerpt}
                          </p>
                        </div>

                        {/* Footer: Author & Read CTA */}
                        <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between gap-2 mt-auto">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={blog.author.avatar}
                              alt={blog.author.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#EADFD4] shrink-0"
                            />
                            <span className="text-[11px] font-semibold text-[#6C2C12] truncate">
                              {blog.author.name}
                            </span>
                          </div>

                          <Link
                            to={`/blog/${blog.id}`}
                            className="text-xs font-bold text-[#F88897] hover:text-[#6C2C12] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <span>Read</span>
                            <BsArrowRight className="text-xs" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              /* ======================================================== */
              /* LIST VIEW (HORIZONTAL DETAILED CARDS)                    */
              /* ======================================================== */
              <motion.div
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-6"
              >
                {paginatedBlogs.map((blog) => {
                  return (
                    <motion.article
                      key={blog.id}
                      variants={cardVariants}
                      className="bg-white rounded-3xl border border-[#EADFD4] shadow-[0_4px_20px_rgba(108,44,18,0.04)] overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-md"
                    >
                      {/* Thumbnail Side */}
                      <Link
                        to={`/blog/${blog.id}`}
                        className="md:w-5/12 lg:w-4/12 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-gray-100 block max-h-[287px]"
                      >
                        <img
                          src={blog.img}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#FAF6F0]/90 backdrop-blur-md text-[#6C2C12] text-xs font-bold px-3 py-1 rounded-full border border-[#EADFD4] shadow-xs">
                            {blog.category}
                          </span>
                        </div>
                      </Link>

                      {/* Content Side */}
                      <div className="md:w-7/12 lg:w-8/12 p-5 sm:p-7 flex flex-col justify-between">
                        <div>
                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2.5">
                            <span className="flex items-center gap-1.5">
                              <BsCalendar3 className="text-[#F88897]" />
                              {blog.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <BsClock className="text-[#F88897]" />
                              {blog.readTime}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <BsChatDots className="text-gray-400" />
                              {blog.commentsCount || 0} Comments
                            </span>
                          </div>

                          {/* Title */}
                          <Link to={`/blog/${blog.id}`}>
                            <h3 className="text-base sm:text-xl font-bold text-[#6C2C12] group-hover:text-[#F88897] transition-colors leading-snug mb-3 cursor-pointer">
                              {blog.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                            {blog.excerpt}
                          </p>

                          {/* Tag list */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-4">
                            {blog.tags?.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#FAF6F0] text-[#6C2C12] border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white transition-colors cursor-pointer"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-4 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={blog.author.avatar}
                              alt={blog.author.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#EADFD4]"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-[#6C2C12]">
                                {blog.author.name}
                              </h4>
                              <p className="text-[11px] text-gray-500">
                                {blog.author.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleShare(blog, e)}
                              className="p-2 rounded-xl bg-[#FAF6F0] border border-[#EADFD4] text-gray-600 hover:text-[#6C2C12] text-sm transition-all cursor-pointer"
                              title="Share article"
                            >
                              <BsShare />
                            </button>

                            <Link
                              to={`/blog/${blog.id}`}
                              className="px-4 py-2 rounded bg-[#6C2C12] text-white text-xs font-semibold hover:bg-transparent hover:text-[#6C2C12] 
                              border-2 border-[#6C2C12] transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <span>Read Full Story</span>
                              <BsArrowRight />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* 4. PAGINATION CONTROLS                                    */}
            {/* ======================================================== */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border border-[#EADFD4] flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white cursor-pointer shadow-xs"
                  }`}
                  aria-label="Previous Page"
                >
                  <BsChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-[#6C2C12] text-white shadow-md scale-105"
                          : "bg-white text-gray-600 border border-[#EADFD4] hover:bg-[#FAF3EB] hover:text-[#6C2C12]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl border border-[#EADFD4] flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-white text-[#6C2C12] hover:bg-[#6C2C12] hover:text-white cursor-pointer shadow-xs"
                  }`}
                  aria-label="Next Page"
                >
                  <BsChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
