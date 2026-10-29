import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch,
  BsChevronDown,
  BsQuestionCircle,
  BsChatDots,
  BsWhatsapp,
  BsShieldCheck,
  BsTruck,
  BsHeart
} from "react-icons/bs";
import { GiYarn } from "react-icons/gi";
import { LuLeaf, LuSparkles } from "react-icons/lu";

const FAQ_DATA = [
  {
    category: "Ordering & Shipping",
    question: "How long does it take to handcraft and dispatch my order?",
    answer: "Because each CozyLoops item is made stitch-by-stitch by hand, ready-to-ship pieces are dispatched within 24 to 48 hours. Made-to-order or personalized custom pieces typically require 3 to 5 business days for our artisans to knit before shipping. Standard shipping across India takes 3 to 7 business days."
  },
  {
    category: "Ordering & Shipping",
    question: "Do you offer free shipping?",
    answer: "Yes! We provide complimentary standard shipping on all prepaid orders. For urgent gifts, you can choose 'Priority Craft Express' during checkout for guaranteed expedited dispatch within 24 hours."
  },
  {
    category: "Ordering & Shipping",
    question: "Can I track my order once it's on the way?",
    answer: "Absolutely. Once your package is handed over to our courier partner, you will receive an SMS and email notification with your tracking ID. You can also visit our Track Order page at any time to monitor real-time delivery milestones."
  },
  {
    category: "Handmade & Materials",
    question: "What types of yarn and materials do you use?",
    answer: "We strictly source 100% premium combed cotton yarn, organic milk cotton blends, and hypoallergenic bamboo threads. All stuffing used in our amigurumi plushies is certified child-safe, non-toxic, and anti-microbial polyester fiberfill."
  },
  {
    category: "Handmade & Materials",
    question: "Are slight variations in size or color normal?",
    answer: "Yes, and that is the true beauty of genuine handcrafted crochet! While our artisans follow standardized stitch patterns, minor nuances in stitch tension, dimensions (±1 cm), and yarn dye lots make every single piece uniquely yours."
  },
  {
    category: "Care & Maintenance",
    question: "How should I wash and care for my crochet pieces?",
    answer: "We recommend gentle hand washing in cool or lukewarm water using a mild wool or baby shampoo. Gently press out excess water between a dry towel—never wring or twist. Always lay flat in shade to dry to preserve original shape and stitch tension."
  },
  {
    category: "Care & Maintenance",
    question: "Can crochet plushies and flowers be machine washed?",
    answer: "For potted flowers and keychains with metal hardware, machine washing is not recommended. For plushies and blankets, use a protective mesh laundry bag on the delicate cycle with cold water and gentle spin."
  },
  {
    category: "Custom & Personalized",
    question: "Can I request custom colors or monogram letters?",
    answer: "Yes! We love bringing custom ideas to life. You can add special notes during checkout, or reach out to our artisans directly via our Contact page or WhatsApp to request personalized initials, color palettes, or custom character patterns."
  },
  {
    category: "Custom & Personalized",
    question: "Do you accept bulk orders for wedding favors or baby showers?",
    answer: "Yes, we specialize in handcrafted party favors, corporate gift hampers, baby showers, and wedding tokens. Please contact us at least 3 to 4 weeks in advance so our artisan collective has ample time to craft your bulk order."
  },
  {
    category: "Returns & Exchanges",
    question: "What is your return and exchange policy?",
    answer: "We want you to love your handmade creations! If an item arrives damaged or defective in transit, notify us within 7 days of delivery with a photo, and we will dispatch a replacement or issue a full refund immediately. Personalized items with custom names cannot be returned unless physically damaged."
  },
  {
    category: "Returns & Exchanges",
    question: "How do refunds work?",
    answer: "Approved refunds are processed back to your original payment method (Credit Card, NetBanking, or UPI) within 3 to 5 business days after inspection."
  }
];

const CATEGORIES = [
  "All Questions",
  "Ordering & Shipping",
  "Handmade & Materials",
  "Care & Maintenance",
  "Custom & Personalized",
  "Returns & Exchanges"
];

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndices, setOpenIndices] = useState([0, 1]); // First 2 open by default

  const toggleAccordion = (index) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === "All Questions" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#6C2C12] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#6C2C12]">FAQ</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[2px] text-[#F88897] block mb-2">
            Help & Guidance
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#6C2C12]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Everything you need to know about our handcrafted crochet items, shipping schedules, custom commissions, and yarn care tips.
          </p>

          {/* Search Box */}
          <div className="relative mt-6 max-w-md mx-auto">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. yarn, washing, shipping)..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-[#EADFD4] bg-white text-xs sm:text-sm shadow-xs focus:outline-none focus:border-[#6C2C12]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none justify-start sm:justify-center flex-nowrap sm:flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#6C2C12] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-[#EADFD4] hover:border-[#6C2C12] hover:text-[#6C2C12]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 mb-14">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-[#EADFD4] shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF6F0]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#6C2C12] text-xs font-bold flex items-center justify-center shrink-0">
                        <BsQuestionCircle className="text-sm" />
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#6C2C12]">
                        {faq.question}
                      </span>
                    </div>

                    <BsChevronDown
                      className={`text-[#6C2C12] text-sm shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#F88897]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-[#F2ECE4]">
                          <p>{faq.answer}</p>
                          <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-[#A67C52] bg-[#FAF6F0] px-2.5 py-1 rounded-md">
                            {faq.category}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#EADFD4] p-8">
              <p className="text-sm font-semibold text-gray-600">
                No questions found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Questions");
                }}
                className="mt-3 text-xs font-bold text-[#6C2C12] underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Contact Banner */}
        <div className="bg-gradient-to-r from-[#6C2C12] to-[#54210D] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <BsChatDots className="text-[#F88897]" /> Still Have a Question?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-md">
              We&apos;re always happy to help with yarn options, custom sizes, or delivery dates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-white text-[#6C2C12] hover:bg-[#F88897] hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              Contact Us
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi%20CozyLoops,%20I%20have%20a%20question%20about%20your%20crochet%20items!"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <BsWhatsapp className="text-base" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
