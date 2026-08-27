import { FaInstagram, FaFacebookF, FaPinterestP, FaYoutube } from "react-icons/fa";
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
    <footer className="w-full bg-[#F7EEE8]">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand & Socials */}
          <div>
            <img
              className="w-40 h-auto object-contain"
              src="/uploads/logo/logo.png"
              alt={settings?.storeName || "CozyLoops"}
            />

            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-6 max-w-xs">
              Handmade crochet creations for you, your loved ones, and your beautiful space.
            </p>

            {/* Live Social Media Links */}
            <div className="flex items-center gap-4 mt-5 text-[#6C2C12]">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-[#F88897] transition-all duration-300 transform hover:scale-110"
                >
                  <FaInstagram className="text-lg" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-[#F88897] transition-all duration-300 transform hover:scale-110"
                >
                  <FaFacebookF className="text-lg" />
                </a>
              )}
              {social.pinterest && (
                <a
                  href={social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="hover:text-[#F88897] transition-all duration-300 transform hover:scale-110"
                >
                  <FaPinterestP className="text-lg" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="hover:text-[#F88897] transition-all duration-300 transform hover:scale-110"
                >
                  <FaYoutube className="text-lg" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#6C2C12] font-semibold text-base sm:text-lg mb-5">Quick Links</h3>

            <ul className="flex flex-col gap-3 text-sm sm:text-base">
              <Link to="/">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isLinkActive("/") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Home
                </li>
              </Link>
              <Link to="/shop">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${location.pathname === "/shop" && !location.search ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Shop
                </li>
              </Link>
              <Link to="/about">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isLinkActive("/about") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  About
                </li>
              </Link>
              <Link to="/blog">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isLinkActive("/blog") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Blog
                </li>
              </Link>
              <Link to="/contact">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isLinkActive("/contact") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Contact
                </li>
              </Link>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[#6C2C12] font-semibold text-base sm:text-lg mb-5">Categories</h3>

            <ul className="flex flex-col gap-3 text-sm sm:text-base">
              <Link to="/shop?category=Decor%20%26%20Gifts">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isCategoryActive("Decor & Gifts") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Decor & Gifts
                </li>
              </Link>
              <Link to="/shop?category=Pet%20%26%20Animal">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isCategoryActive("Pet & Animal") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Pet & Animal
                </li>
              </Link>
              <Link to="/shop?category=Home%20%26%20Living">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isCategoryActive("Home & Living") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Home & Living
                </li>
              </Link>
              <Link to="/shop?category=Kids%20%26%20Baby">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isCategoryActive("Kids & Baby") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Kids & Baby
                </li>
              </Link>
              <Link to="/shop?category=Personalized">
                <li className={`cursor-pointer transition-all duration-300 hover:text-[#F88897] ${isCategoryActive("Personalized") ? "text-[#F88897] font-semibold" : "text-gray-600"}`}>
                  Personalized & Custom
                </li>
              </Link>
            </ul>
          </div>

          {/* Dynamic Contact Us */}
          <div>
            <h3 className="text-[#6C2C12] font-semibold text-base sm:text-lg mb-5">Contact Us</h3>

            <ul className="space-y-4 text-sm sm:text-base text-gray-600">
              <li className="flex items-start gap-3">
                <IoMailOutline className="text-xl text-[#6C2C12] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings?.email || "cozyloops.crochet@gmail.com"}`}
                  className="hover:text-[#F88897] transition-colors break-all"
                >
                  {settings?.email || "cozyloops.crochet@gmail.com"}
                </a>
              </li>

              <li className="flex items-start gap-3">
                <IoCallOutline className="text-xl text-[#6C2C12] shrink-0 mt-0.5" />
                <a
                  href={`tel:${settings?.phone || "+91 98765 43210"}`}
                  className="hover:text-[#F88897] transition-colors"
                >
                  {settings?.phone || "+91 98765 43210"}
                </a>
              </li>

              <li className="flex items-start gap-3">
                <IoLocationOutline className="text-xl text-[#6C2C12] shrink-0 mt-0.5" />
                <span>{settings?.address || "Mumbai, Maharashtra, India"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t pt-3 border-[#EADDD5] flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-start">
          <p className="text-sm text-gray-500">
            © 2026 {settings?.storeName || "CozyLoops"}. All Rights Reserved.
          </p>

          <p className="text-sm text-gray-500">
            Handmade with <span className="text-[#F88897]">♥</span> by {settings?.storeName || "CozyLoops"}
          </p>
        </div>
      </div>

      {/* Back To Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 w-11 h-11 rounded-full bg-[#6C2C12] text-white flex items-center justify-center cursor-pointer hover:bg-[#F88897] transition-all duration-300 shadow-md"
      >
        <FaArrowUp />
      </button>
    </footer>
  );
};

export default Footer;