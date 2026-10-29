import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BsShieldCheck, BsLock, BsEye, BsEnvelope, BsFileText } from "react-icons/bs";
import { LuSparkles } from "react-icons/lu";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#6C2C12] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#6C2C12]">Privacy Policy</span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-[#EADFD4] shadow-sm p-6 sm:p-10 md:p-12 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
          {/* Header */}
          <div className="border-b border-[#EADFD4] pb-6">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-2">
              Legal & Trust
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Last Updated: September 28, 2026 • Effective Date: March 1, 2026
            </p>
          </div>

          {/* Intro */}
          <p>
            At <strong>CozyLoops</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we take your personal data privacy seriously. This Privacy Policy outlines how your personal information is collected, used, shared, and safeguarded when you visit or make a purchase from our artisan eCommerce store.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsEye className="text-[#F88897]" /> 1. Information We Collect
            </h2>
            <p>
              When you purchase handcrafted items or browse our store, we collect several categories of information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li>
                <strong>Customer Identity Data:</strong> Your name, billing address, shipping delivery address, email address, and phone number.
              </li>
              <li>
                <strong>Transactional Data:</strong> Items purchased, order value, payment status, and order fulfillment history.
              </li>
              <li>
                <strong>Device & Technical Data:</strong> Your IP address, browser type, operating system, and pages viewed to optimize browsing speed.
              </li>
              <li>
                <strong>Customization Notes:</strong> Any initials, monogram letters, or gift messages you submit for personalized orders.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsLock className="text-[#F88897]" /> 2. How We Use Your Information
            </h2>
            <p>
              We process your personal information for specific legitimate purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
              <li>To fulfill and dispatch your handcrafted crochet orders and provide delivery updates.</li>
              <li>To process simulated or real payments securely without storing sensitive CVVs.</li>
              <li>To answer inquiries and provide dedicated customer assistance via email or WhatsApp.</li>
              <li>To screen our orders for potential risk, fraud, or misuse.</li>
              <li>With your consent, to notify you about new limited yarn drops and seasonal discount codes.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsShieldCheck className="text-[#F88897]" /> 3. Data Protection & Security
            </h2>
            <p>
              We employ industry-standard 256-bit SSL encryption across all checkout operations. We do not store raw credit card numbers or sensitive verification codes on our servers. All transactional communications are transmitted directly to verified, PCI-DSS certified payment processors.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsFileText className="text-[#F88897]" /> 4. Cookies & Local Storage
            </h2>
            <p>
              CozyLoops utilizes modern client-side storage technologies, such as browser <code>localStorage</code>, to retain your Shopping Cart items, Wishlist favorites, and session authentication state across visits. You may clear your browser cookies and storage at any time through your browser settings.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsEnvelope className="text-[#F88897]" /> 5. Your Rights & Inquiries
            </h2>
            <p>
              Depending on your location, you may hold rights to request access to the personal data we hold about you, request corrections, or request deletion. If you have questions regarding this Privacy Policy, please contact our privacy compliance team at:
            </p>
            <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADFD4] text-xs sm:text-sm space-y-1 text-gray-700">
              <p><strong>Email:</strong> privacy@cozyloops.com</p>
              <p><strong>Artisan Studio:</strong> CozyLoops Crafts, Mumbai, Maharashtra, India</p>
            </div>
          </div>

          {/* Back links */}
          <div className="pt-6 border-t border-[#EADFD4] flex items-center justify-between">
            <Link
              to="/terms-of-service"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] underline"
            >
              Read Terms of Service →
            </Link>
            <Link
              to="/"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:underline"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
