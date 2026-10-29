import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsSearch, BsArrowLeft, BsHouse, BsBagCheck, BsChatDots } from "react-icons/bs";
import { GiYarn, GiSewingNeedle } from "react-icons/gi";
import { LuSparkles } from "react-icons/lu";

const NotFound = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/shop");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF6F0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center bg-white rounded-3xl border border-[#EADFD4] shadow-sm p-8 sm:p-12 md:p-14"
      >
        {/* Animated Yarn Icon */}
        <div className="relative inline-block mb-6">
          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
              y: [0, -6, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#FAF6F0] border-2 border-[#EADFD4] flex items-center justify-center text-5xl sm:text-6xl text-[#6C2C12] shadow-inner"
          >
            <GiYarn className="text-[#F88897]" />
          </motion.div>
          <span className="absolute -bottom-1 -right-1 px-3 py-1 rounded-full bg-[#6C2C12] text-white text-xs font-bold font-mono tracking-wider shadow-sm">
            404
          </span>
        </div>

        {/* Headings */}
        <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-2">
          Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#6C2C12]">
          This Thread Has Unraveled!
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
          The page or product you&apos;re looking for might have been moved, renamed, or is currently on an artisan&apos;s knitting desk.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto relative">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cozy creations, plushies, flowers..."
            className="w-full pl-11 pr-24 py-3 rounded-full border border-[#EADFD4] bg-[#FAF6F0]/50 text-xs sm:text-sm focus:outline-none focus:border-[#6C2C12] shadow-xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-[#6C2C12] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#F88897] transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Category Suggestions */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-gray-400 font-semibold">Try exploring:</span>
          <Link
            to="/shop?category=Decor%20%26%20Gifts"
            className="px-3 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] text-[#6C2C12] hover:text-white transition-all font-semibold"
          >
            Decor & Flowers
          </Link>
          <Link
            to="/shop?category=Kids%20%26%20Baby"
            className="px-3 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] text-[#6C2C12] hover:text-white transition-all font-semibold"
          >
            Baby Booties
          </Link>
          <Link
            to="/shop?category=Pet%20%26%20Animal"
            className="px-3 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#F88897] text-[#6C2C12] hover:text-white transition-all font-semibold"
          >
            Amigurumi Plushies
          </Link>
        </div>

        {/* Bottom Actions */}
        <div className="mt-10 pt-8 border-t border-[#EADFD4] flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#EADFD4] hover:bg-[#FAF6F0] text-[#6C2C12] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <BsArrowLeft /> Go Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C2C12] hover:bg-[#F88897] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <BsHouse /> Return Home
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EADFD4] text-[#6C2C12] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
          >
            <BsBagCheck /> Visit Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
