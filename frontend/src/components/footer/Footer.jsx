import { FaInstagram, FaFacebookF, FaPinterestP, FaYoutube, FaHeart } from "react-icons/fa";
import { IoMailOutline, IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

const Footer = () => {
  const location = useLocation();
  const { settings } = useSettings();

  const isLinkActive = (path) => {
    if (path === "/") return location.pathname === "/" && !location.search;
    return location.pathname === path && !location.search;
  };

  const isCategoryActive = (categoryParam) => {
    if (location.pathname !== "/shop") return false;
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get("category");
    if (!cat) return false;
    if (categoryParam === "Personalized" && cat.toLowerCase().includes("personalized")) return true;
    return cat.toLowerCase() === categoryParam.toLowerCase();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const social = settings?.socialLinks || {};

  return (
    <footer className="w-full bg-[#F7EEE8] border-t border-[#EBDCD0]">
      <div className="container mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* 1. Brand & Socials */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/">
              <img
                className="w-36 sm:w-40 h-auto object-contain"
                src="/uploads/logo/logo.png"
                alt={settings?.storeName || "CozyLoops"}
              />
            </Link>

            <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xs">
              Handcrafted crochet creations made stitch by stitch to bring warmth, beauty, and heartfelt charm to your everyday life.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3.5 mt-5 text-[#6C2C12]">
              {social.instagram ? (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaInstagram className="text-sm" />
                </a>
              ) : (
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaInstagram className="text-sm" />
                </a>
              )}
              {social.facebook ? (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaFacebookF className="text-xs" />
                </a>
              ) : (
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaFacebookF className="text-xs" />
                </a>
              )}
              {social.pinterest ? (
                <a
                  href={social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaPinterestP className="text-sm" />
                </a>
              ) : (
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaPinterestP className="text-sm" />
                </a>
              )}
              {social.youtube ? (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaYoutube className="text-sm" />
                </a>
              ) : (
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/70 hover:bg-[#F88897] hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs"
                >
                  <FaYoutube className="text-sm" />
                </a>
              )}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-[#6C2C12] font-bold text-sm sm:text-base uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <Link to="/">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Home
                </li>
              </Link>
              <Link to="/shop">
                <li className={`transition-colors hover:text-[#F88897] ${location.pathname === "/shop" && !location.search ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Shop Catalog
                </li>
              </Link>
              <Link to="/about">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/about") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Our Story
                </li>
              </Link>
              <Link to="/blog">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/blog") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Crochet Blog
                </li>
              </Link>
              <Link to="/contact">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/contact") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Contact Us
                </li>
              </Link>
            </ul>
          </div>

          {/* 3. Customer Care & Policies */}
          <div>
            <h3 className="text-[#6C2C12] font-bold text-sm sm:text-base uppercase tracking-wider mb-4">
              Help & Policies
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <Link to="/checkout">
                <li className={`transition-colors hover:text-[#F88897] flex items-center gap-1.5 ${isLinkActive("/checkout") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  <span>Checkout Demo</span>
                  <span className="text-[9px] bg-[#FAF0E8] text-[#E87A8A] font-bold px-1.5 py-0.2 rounded">Live</span>
                </li>
              </Link>
              <Link to="/track-order">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/track-order") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Track Your Order
                </li>
              </Link>
              <Link to="/faq">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/faq") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  FAQs & Support
                </li>
              </Link>
              <Link to="/privacy-policy">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/privacy-policy") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Privacy Policy
                </li>
              </Link>
              <Link to="/terms-of-service">
                <li className={`transition-colors hover:text-[#F88897] ${isLinkActive("/terms-of-service") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Terms & Conditions
                </li>
              </Link>
            </ul>
          </div>

          {/* 4. Product Categories */}
          <div>
            <h3 className="text-[#6C2C12] font-bold text-sm sm:text-base uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <Link to="/shop?category=Decor%20%26%20Gifts">
                <li className={`transition-colors hover:text-[#F88897] ${isCategoryActive("Decor & Gifts") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Decor & Gifts
                </li>
              </Link>
              <Link to="/shop?category=Pet%20%26%20Animal">
                <li className={`transition-colors hover:text-[#F88897] ${isCategoryActive("Pet & Animal") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Amigurumi Pets
                </li>
              </Link>
              <Link to="/shop?category=Home%20%26%20Living">
                <li className={`transition-colors hover:text-[#F88897] ${isCategoryActive("Home & Living") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Home & Living
                </li>
              </Link>
              <Link to="/shop?category=Kids%20%26%20Baby">
                <li className={`transition-colors hover:text-[#F88897] ${isCategoryActive("Kids & Baby") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Kids & Baby
                </li>
              </Link>
              <Link to="/shop?category=Personalized">
                <li className={`transition-colors hover:text-[#F88897] ${isCategoryActive("Personalized") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Custom Commissions
                </li>
              </Link>
            </ul>
          </div>

          {/* 5. Contact Information */}
          <div>
            <h3 className="text-[#6C2C12] font-bold text-sm sm:text-base uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <IoMailOutline className="text-base text-[#6C2C12] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings?.email || "cozyloops.crochet@gmail.com"}`}
                  className="hover:text-[#F88897] transition-colors break-all"
                >
                  {settings?.email || "cozyloops.crochet@gmail.com"}
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <IoCallOutline className="text-base text-[#6C2C12] shrink-0 mt-0.5" />
                <a
                  href={`tel:${settings?.phone || "+91 98765 43210"}`}
                  className="hover:text-[#F88897] transition-colors"
                >
                  {settings?.phone || "+91 98765 43210"}
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <IoLocationOutline className="text-base text-[#6C2C12] shrink-0 mt-0.5" />
                <span>{settings?.address || "Mumbai, Maharashtra, India"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t mt-10 pt-6 border-[#EADDD5] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-start text-xs sm:text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {settings?.storeName || "CozyLoops"}. Handcrafted Artisan eCommerce Template.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-gray-600">
            <Link to="/privacy-policy" className="hover:text-[#F88897] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-of-service" className="hover:text-[#F88897] transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/faq" className="hover:text-[#F88897] transition-colors">
              FAQs
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#6C2C12]">
              Made with <FaHeart className="text-[#F88897] text-xs" /> for artisans
            </span>
          </div>
        </div>
      </div>

      {/* Back To Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-16 lg:bottom-6 right-5 w-10 h-10 rounded-full bg-[#6C2C12] text-white flex items-center justify-center cursor-pointer hover:bg-[#F88897] transition-all duration-300 shadow-lg z-40"
      >
        <FaArrowUp className="text-sm" />
      </button>
    </footer>
  );
};

export default Footer;
