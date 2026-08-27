import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import TopBar from "../components/topBar/TopBar";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { BsArrowLeft, BsCalendar3, BsClock, BsChatDots, BsShare, BsLightbulb, BsArrowRight, BsChevronRight, 
  BsWhatsapp, BsInstagram,BsTwitterX, BsFacebook } from "react-icons/bs";
import { API_ENDPOINTS } from "../config/api";

const BlogDetail = () => {
  const { id } = useParams();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch single blog and related blogs
  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetch(`${API_ENDPOINTS.BLOGS}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Blog not found");
        return res.json();
      })
      .then((data) => {
        setBlog(data);
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading blog details:", err);
        setLoading(false);
      });

    fetch(API_ENDPOINTS.BLOGS)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRelatedBlogs(data.filter((b) => b.slug !== id && b.id !== parseInt(id, 10)).slice(0, 3));
        }
      })
      .catch((err) => console.error("Error loading related blogs:", err));
  }, [id]);

  // Helper toast trigger
  const triggerToast = (message) => {
    window.dispatchEvent(
      new CustomEvent("showToast", {
        detail: { message }
      })
    );
  };

  // Add Comment handler
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: newCommentName.trim(),
      date: "Just now",
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
        newCommentName.trim()
      )}`,
      text: newCommentText.trim()
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentName("");
    setNewCommentText("");
    triggerToast("Your comment has been posted! 💬");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#6C2C12] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#6C2C12] font-semibold text-sm">Loading handcrafted story...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-2xl font-bold text-[#6C2C12]">Story Not Found</h2>
        <p className="text-gray-500">The story you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="bg-[#6C2C12] text-white px-6 py-2.5 rounded font-bold uppercase text-sm">
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ======================================================== */}
      {/* 1. BREADCRUMBS & TOP BAR                                 */}
      {/* ======================================================== */}
      <div className="bg-[#FAF3EB] border-b border-[#F2ECE4] py-4">
        <div className="container flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Breadcrumb links */}
          <nav className="flex items-center gap-2 text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#6C2C12] transition-colors">
              Home
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link to="/blog" className="hover:text-[#6C2C12] transition-colors">
              Blog
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400" />
            <Link 
              to={`/blog?category=${encodeURIComponent(blog.category)}`}
              className="text-[#6C2C12] font-semibold hover:text-[#6C2C12] transition-colors"
            >
              {blog.category}
            </Link>
            <BsChevronRight className="text-[10px] text-gray-400 hidden sm:inline" />
            <span className="text-gray-400 hidden sm:inline truncate max-w-xs">
              {blog.title}
            </span>
          </nav>

          {/* Back button */}
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C2C12] hover:text-[#6C2C12] hover:underline transition-colors cursor-pointer"
          >
            <BsArrowLeft />
            <span>Back to All Stories</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ARTICLE HERO SECTION                                  */}
      {/* ======================================================== */}
      <div className="container max-w-4xl pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Category Pill & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link
              to={`/blog?category=${encodeURIComponent(blog.category)}`}
              className="bg-[#FAF3EB] text-[#6C2C12] font-bold px-3.5 py-1.5 rounded-full border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white transition-colors"
            >
              {blog.category}
            </Link>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <BsCalendar3 className="text-[#F88897]" />
              {blog.date}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <BsClock className="text-[#F88897]" />
              {blog.readTime}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <BsChatDots className="text-gray-400" />
              {comments.length} Comments
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2] text-[#6C2C12]">
            {blog.title}
          </h1>

          {/* Author Header & Social Share Bar */}
          <div className="pt-4 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-12 h-12 rounded-full object-cover border border-[#EADFD4] shadow-xs"
              />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#6C2C12]">
                  {blog.author.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {blog.author.role}
                </p>
              </div>
            </div>

            {/* Share Options - Matching ProductDetail design */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C2C12] flex items-center gap-1.5">
                <BsShare className="text-sm text-[#F88897]" /> Share:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {/* WhatsApp Share */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this story "${blog.title}" on CozyLoops! ${window.location.href}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#25D366]/30 shadow-2xs cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <BsWhatsapp className="text-sm" />
                </a>

                {/* Instagram */}
                <a
                  href={settings?.socialLinks?.instagram || "https://www.instagram.com/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#E1306C]/30 shadow-2xs cursor-pointer"
                  title="Visit our Instagram"
                >
                  <BsInstagram className="text-sm" />
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this story "${blog.title}" on CozyLoops!`
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-black/5 text-gray-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 border border-gray-300 shadow-2xs cursor-pointer"
                  title="Share on Twitter / X"
                >
                  <BsTwitterX className="text-xs" />
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#1877F2]/30 shadow-2xs cursor-pointer"
                  title="Share on Facebook"
                >
                  <BsFacebook className="text-sm" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* 3. COVER IMAGE & EXCERPT                                 */}
        {/* ======================================================== */}
        <div className="mt-8">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/9] shadow-lg border border-[#EADFD4]">
            <img
              src={blog.img}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Lead Card */}
          <div className="mt-8 p-5 sm:p-7 rounded-2xl bg-[#FAF3EB] border-l-4 border-[#F88897] shadow-xs">
            <p className="text-sm sm:text-base md:text-lg text-[#6C2C12] font-semibold leading-relaxed">
              {blog.excerpt}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. MAIN ARTICLE CONTENT                                   */}
        {/* ======================================================== */}
        <div className="mt-8 space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          {blog.content?.map((section, idx) => {
            if (section.type === "paragraph") {
              return (
                <p key={idx} className="leading-relaxed">
                  {section.text}
                </p>
              );
            }
            if (section.type === "heading") {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-[#6C2C12] pt-4"
                >
                  {section.text}
                </h2>
              );
            }
            if (section.type === "quote") {
              return (
                <blockquote
                  key={idx}
                  className="my-6 p-5 sm:p-6 bg-white rounded-2xl border-l-4 border-[#6C2C12] shadow-xs italic text-[#6C2C12] font-medium text-base sm:text-lg"
                >
                  “{section.text}”
                </blockquote>
              );
            }
            if (section.type === "tip") {
              return (
                <div
                  key={idx}
                  className="my-6 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex items-start gap-3.5 shadow-xs"
                >
                  <BsLightbulb className="text-amber-600 text-xl shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm sm:text-base mb-1">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* ======================================================== */}
        {/* 5. TAGS & ARTICLE FOOTER                                 */}
        {/* ======================================================== */}
        <div className="mt-10 pt-6 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#6C2C12] uppercase tracking-wider mr-1">
              Tags:
            </span>
            {blog.tags?.map((t) => (
              <Link
                key={t}
                to={`/blog?tag=${encodeURIComponent(t)}`}
                className="text-xs px-3 py-1 rounded-full bg-[#FAF3EB] text-[#6C2C12] font-medium border border-[#EADFD4] hover:bg-[#6C2C12] hover:text-white transition-colors"
              >
                #{t}
              </Link>
            ))}
          </div>

          {/* Bottom Share Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C2C12] flex items-center gap-1.5 mr-1">
              <BsShare className="text-sm text-[#F88897]" /> Share:
            </span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out this story "${blog.title}" on CozyLoops! ${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#25D366]/30 shadow-2xs cursor-pointer"
              title="Share on WhatsApp"
            >
              <BsWhatsapp className="text-sm" />
            </a>
            <a
              href={settings?.socialLinks?.instagram || "https://www.instagram.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#E1306C]/30 shadow-2xs cursor-pointer"
              title="Visit our Instagram"
            >
              <BsInstagram className="text-sm" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out this story "${blog.title}" on CozyLoops!`
              )}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 text-gray-800 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 border border-gray-300 shadow-2xs cursor-pointer"
              title="Share on Twitter / X"
            >
              <BsTwitterX className="text-xs" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-300 border border-[#1877F2]/30 shadow-2xs cursor-pointer"
              title="Share on Facebook"
            >
              <BsFacebook className="text-sm" />
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. AUTHOR BIO CARD                                       */}
        {/* ======================================================== */}
        <div className="mt-10 p-6 sm:p-8 bg-white rounded-3xl border border-[#EADFD4] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={blog.author.avatar}
            alt={blog.author.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#EADFD4] shrink-0"
          />
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-[#6C2C12]">
                {blog.author.name}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF3EB] text-[#F88897] font-semibold border border-[#EADFD4]">
                Author
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-3">
              {blog.author.role} • CozyLoops Artisan Team
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Passionate about handmade fiber crafts, slow mindfulness, and sustainable textiles. Every stitch we create is designed to spread warmth and comfort into homes worldwide.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 7. RELATED ARTICLES SECTION                              */}
        {/* ======================================================== */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#F2ECE4]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-1">
                  - Continue Reading -
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#6C2C12]">
                  More Handcrafted Stories
                </h2>
              </div>
              <Link
                to="/blog"
                className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <BsArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedBlogs.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.id}`}
                  className="bg-white rounded-2xl border border-[#EADFD4] shadow-[0_4px_20px_rgba(108,44,18,0.04)] overflow-hidden flex flex-col group transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={related.img}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <span className="absolute top-3 left-3 bg-[#FAF6F0]/90 backdrop-blur-md text-[#6C2C12] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#EADFD4]">
                      {related.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1.5">
                        <span>{related.date}</span>
                        <span>•</span>
                        <span>{related.readTime}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#6C2C12] transition-colors leading-snug line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs font-bold text-[#6C2C12]">
                      <span>Read Story</span>
                      <BsArrowRight className="text-xs" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
