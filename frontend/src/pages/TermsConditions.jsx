import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BsCheckCircle, BsAward, BsExclamationTriangle, BsArrowRight } from "react-icons/bs";
import { GiYarn } from "react-icons/gi";

const TermsConditions = () => {
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
          <span className="font-semibold text-[#6C2C12]">Terms of Service</span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-[#EADFD4] shadow-sm p-6 sm:p-10 md:p-12 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
          {/* Header */}
          <div className="border-b border-[#EADFD4] pb-6">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-2">
              Customer Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6C2C12]">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Last Updated: September 28, 2026 • Valid for all purchases on CozyLoops
            </p>
          </div>

          <p>
            Welcome to <strong>CozyLoops</strong>. By accessing our website, browsing our handcrafted catalog, or placing an order, you agree to be bound by the following terms, conditions, and store guidelines.
          </p>

          {/* Section 1: Handmade Nature */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <GiYarn className="text-[#F88897] text-xl" /> 1. Nature of Handcrafted Goods
            </h2>
            <p>
              Every piece sold on CozyLoops is handmade by skilled individual knitters. Because our creations are not mass-produced in factories, slight variations in yarn dye lot, size dimensions (±1 to 1.5 cm), and stitch tension are natural characteristics of genuine handwork. These subtle nuances are celebrated as hallmarks of handcrafted artistry.
            </p>
          </div>

          {/* Section 2: Orders & Pricing */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsCheckCircle className="text-[#F88897]" /> 2. Orders & Pricing
            </h2>
            <p>
              All prices listed on the store are in Indian Rupees (₹) unless specified otherwise. We reserve the right to modify prices or discontinue items without prior notice. An order is deemed confirmed only after successful payment authorization or confirmation of Cash on Delivery details.
            </p>
          </div>

          {/* Section 3: Personalized Items */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsAward className="text-[#F88897]" /> 3. Custom & Personalized Commissions
            </h2>
            <p>
              Custom orders, such as personalized initials, specific color requests, or custom amigurumi dolls, require artisan lead time (typically 3–5 business days). Once work on a personalized order has commenced, cancellations or returns are not accepted unless the finished piece arrives physically damaged.
            </p>
          </div>

          {/* Section 4: Shipping & Delivery */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsCheckCircle className="text-[#F88897]" /> 4. Shipping & Delivery
            </h2>
            <p>
              We deliver packages using trusted logistics partners. Estimated delivery dates (3 to 7 business days for standard delivery) are estimates and may occasionally be subject to carrier delays, festive peak seasons, or adverse weather conditions. CozyLoops provides tracking details for every fulfilled shipment.
            </p>
          </div>

          {/* Section 5: Returns & Refunds */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsExclamationTriangle className="text-[#F88897]" /> 5. Damaged Shipments & Claims
            </h2>
            <p>
              In the unlikely event that your package is damaged during shipping, you must contact our team within 7 calendar days of delivery with an unboxing photograph. We will promptly arrange a replacement or issue a full refund to your original payment method.
            </p>
          </div>

          {/* Section 6: Intellectual Property */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#6C2C12] flex items-center gap-2">
              <BsAward className="text-[#F88897]" /> 6. Intellectual Property
            </h2>
            <p>
              All photography, branding, logo designs, custom crochet patterns, and written copy published on this website are the proprietary property of CozyLoops and protected under applicable copyright and intellectual property laws.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-[#EADFD4] flex items-center justify-between">
            <Link
              to="/privacy-policy"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:text-[#F88897] underline"
            >
              ← View Privacy Policy
            </Link>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-[#6C2C12] hover:underline"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
