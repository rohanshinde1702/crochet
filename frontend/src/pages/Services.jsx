import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { GiYarn, GiScissors, GiRibbonMedal } from "react-icons/gi";
import {
  LuHandHeart,
  LuSparkles,
  LuClock,
  LuCheck,
  LuGift,
  LuPalette,
  LuWrench,
  LuGraduationCap,
  LuBuilding2,
  LuShieldCheck,
  LuSend,
  LuCalculator,
  LuStar,
  LuChevronDown,
  LuMessageSquare,
  LuHeartHandshake,
} from "react-icons/lu";
import { FaStar, FaQuoteLeft, FaArrowRight } from "react-icons/fa";
import { BsCheck2, BsCheckCircleFill } from "react-icons/bs";
import { BiLeaf, BiPackage } from "react-icons/bi";
import TopBar from "../components/topBar/TopBar";
import { API_ENDPOINTS } from "../config/api";

const SERVICES_DATA = [
  {
    id: "bespoke-commissions",
    icon: <LuHandHeart className="text-3xl text-[#F88897]" />,
    badge: "Most Popular",
    title: "Bespoke Custom Commissions",
    shortDesc: "Turn your imagination into handcrafted reality — from personalized amigurumi to signature heirloom pieces.",
    fullDesc: "Whether it is a custom amigurumi doll created from a reference portrait, a personalized baby milestone blanket with embroidered monograms, or a one-of-a-kind wearable cardigan, each commission is custom-designed and crafted to your exact specifications.",
    highlights: [
      "Custom Amigurumi Dolls & Pets",
      "Baby Blankets & Keepsake Heirlooms",
      "Made-to-Measure Wearables & Cardigans",
      "Event Décor & Handcrafted Bouquets",
    ],
    timeline: "7 - 14 Business Days",
    startingPrice: "₹799",
  },
  {
    id: "restoration-repair",
    icon: <LuWrench className="text-3xl text-[#F88897]" />,
    badge: "Heirloom Care",
    title: "Crochet Restoration & Repair",
    shortDesc: "Give beloved vintage crochet pieces a second life with gentle restoration, re-blocking, and stitch reinforcement.",
    fullDesc: "Cherished handmade blankets and vintage heirlooms deserve careful preservation. We assess damage, source matching vintage-grade yarns, mend unraveling borders, fix moth holes, and apply steam blocking to restore structural elegance.",
    highlights: [
      "Vintage Blanket & Throw Mending",
      "Stitch Reinforcement & Snag Repair",
      "Gentle Hand-Washing & Steam Blocking",
      "Yarn Color & Fiber Matching",
    ],
    timeline: "5 - 10 Business Days",
    startingPrice: "₹499",
  },
  {
    id: "pattern-drafting",
    icon: <GiScissors className="text-3xl text-[#F88897]" />,
    badge: "Tech Editing",
    title: "Pattern Drafting & Tech Editing",
    shortDesc: "Professional pattern writing, difficulty grading, stitch diagramming, and tech editing for designers.",
    fullDesc: "Are you a crochet designer looking to release clean, error-free patterns? We provide comprehensive tech editing, gauge and stitch math verification, multi-size grading, and standard US/UK terminology conversion.",
    highlights: [
      "Stitch Math & Gauge Verification",
      "Multi-Size Garment Grading",
      "US / UK Terminology Standardization",
      "Visual Stitch Chart & PDF Formatting",
    ],
    timeline: "3 - 7 Business Days",
    startingPrice: "₹999",
  },
  {
    id: "workshops-mentorship",
    icon: <LuGraduationCap className="text-3xl text-[#F88897]" />,
    badge: "1-on-1 & Groups",
    title: "Masterclasses & 1-on-1 Mentorship",
    shortDesc: "Interactive hands-on workshops for beginners to advanced crafters wishing to elevate their techniques.",
    fullDesc: "Learn the mindful art of crochet through private 1-on-1 mentoring or lively group masterclasses. We cover everything from foundational tension control and magic rings to advanced Tunisian crochet, cable stitches, and colorwork.",
    highlights: [
      "Beginner Starter Masterclass Kits",
      "Advanced Tapestry & Tunisian Stitches",
      "Live 1-on-1 Video Mentorship Sessions",
      "Interactive Q&A and Lifetime Notes",
    ],
    timeline: "Flexible Scheduling",
    startingPrice: "₹1,299",
  },
  {
    id: "bulk-corporate",
    icon: <LuBuilding2 className="text-3xl text-[#F88897]" />,
    badge: "Boutique & Bulk",
    title: "Corporate & Event Favors",
    shortDesc: "Warm, handcrafted bulk gifting for weddings, baby showers, festive occasions, and corporate hampers.",
    fullDesc: "Make your celebration memorable with eco-friendly handmade crochet souvenirs. From custom-scented crochet lavender sachets and floral keychains to personalized coasters and festive ornaments packaged in custom branded boxes.",
    highlights: [
      "Custom Wedding & Baby Shower Favors",
      "Branded Corporate Care Hampers",
      "Eco-Friendly Recycled Packaging",
      "Tiered Bulk Discount Pricing",
    ],
    timeline: "2 - 4 Weeks",
    startingPrice: "₹199 / unit (Min. 25)",
  },
  {
    id: "color-consultation",
    icon: <LuPalette className="text-3xl text-[#F88897]" />,
    badge: "Complimentary",
    title: "Palette & Yarn Consultation",
    shortDesc: "Personalized color harmonies and yarn fiber recommendations tailored to your room interior and skin sensitivity.",
    fullDesc: "Not sure which yarn fits your nursery or living room aesthetic? Our artisan consultants guide you through fiber weight, hypoallergenic baby acrylics, pure merino wool, soft chenille, and breathable bamboo yarns with digital moodboards.",
    highlights: [
      "Digital Color Palette Moodboards",
      "Fiber Suitability for Sensitive Skin",
      "Interior Decor Harmony Suggestions",
      "Free with Any Custom Order",
    ],
    timeline: "24 - 48 Hours",
    startingPrice: "Free with Order",
  },
];

const STEPS_DATA = [
  {
    step: "01",
    title: "Share Your Vision",
    desc: "Tell us about your idea, size, colors, or send reference sketches and Pinterest inspiration photos.",
    icon: <LuMessageSquare className="text-2xl text-[#F88897]" />,
  },
  {
    step: "02",
    title: "Palette & Yarn Approval",
    desc: "We curate custom yarn swatches, color palettes, and provide a clear timeline and quote for your approval.",
    icon: <LuPalette className="text-2xl text-[#F88897]" />,
  },
  {
    step: "03",
    title: "Artisan Crafting",
    desc: "Every stitch is handcrafted with patience and care. We send progress photos so you can watch your piece come to life.",
    icon: <GiYarn className="text-2xl text-[#F88897]" />,
  },
  {
    step: "04",
    title: "Finishing & Safe Delivery",
    desc: "Your piece is gently steam-blocked, eco-gift-wrapped with care instructions, and delivered securely to your doorstep.",
    icon: <BiPackage className="text-2xl text-[#F88897]" />,
  },
];

const FAQS_DATA = [
  {
    q: "How long does a custom crochet commission take?",
    a: "Standard custom orders typically take 7 to 14 business days depending on size and intricate detailing. Bulk orders (25+ units) usually require 2 to 4 weeks. If you have an urgent deadline, please mention it in the quote form, and we'll do our best to accommodate rush requests.",
  },
  {
    q: "Can you recreate a plush toy or amigurumi from a photograph?",
    a: "Yes! We specialize in photo-to-crochet recreations including pets, family caricatures, cartoon characters, and cherished childhood toys. Just describe your vision and attach notes in our custom quote form.",
  },
  {
    q: "What types of yarn do you use for custom pieces?",
    a: "We work with premium, skin-safe fibers including 100% organic cotton (ideal for summer and babies), plush velvet chenille (for soft cuddly plushies), fine merino wool (for cozy winter wear), and anti-pilling hypoallergenic acrylics.",
  },
  {
    q: "How does payment and deposit work for custom work?",
    a: "For custom commissions, we require a 50% advance deposit once the design and yarn are approved to begin crafting. The remaining balance is payable upon completion after you approve the final progress photos before shipping.",
  },
  {
    q: "How do I care for and wash my handmade crochet items?",
    a: "Every custom piece includes a personalized care card. In general, we recommend gentle hand washing in cool water with mild wool detergent, gently squeezing excess water (never wringing), and drying flat on a clean towel.",
  },
];

const TESTIMONIALS = [
  {
    name: "Aanya Sharma",
    role: "Custom Amigurumi Client",
    avatar: "AS",
    rating: 5,
    text: "I ordered a custom crochet replica of our family golden retriever for my daughter's birthday. The attention to detail, floppy ears, and gentle softness blew us away! Truly an heirloom piece.",
  },
  {
    name: "Pooja & Vikram",
    role: "Wedding Favors Order (120 pcs)",
    avatar: "PV",
    rating: 5,
    text: "CozyLoops handcrafted 120 mini crochet sunflower keychains for our wedding guests. Everyone was raving about how cute and eco-friendly they were. Exceptional craftsmanship and timely delivery!",
  },
  {
    name: "Meera Kulkarni",
    role: "Heirloom Blanket Restoration",
    avatar: "MK",
    rating: 5,
    text: "My grandmother's 40-year-old crochet throw had unraveled at the corners. The team restored it with matching yarn and brought it back to life. I cried tears of joy when I unpacked it.",
  },
];

const Services = () => {
  // Estimator State
  const [calcService, setCalcService] = useState("amigurumi");
  const [calcComplexity, setCalcComplexity] = useState("medium");
  const [calcYarn, setCalcYarn] = useState("cotton");
  const [calcQuantity, setCalcQuantity] = useState(1);

  // Quote Form State
  const [quoteData, setQuoteData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "Bespoke Custom Commission",
    yarnPreference: "Organic Cotton",
    budgetRange: "₹1,000 - ₹2,500",
    deadline: "",
    message: "",
  });
  const [quoteStatus, setQuoteStatus] = useState("idle"); // idle | sending | success
  const [quoteErrors, setQuoteErrors] = useState({});
  const [activeFaq, setActiveFaq] = useState(null);

  // Estimate Calculation
  const calculateEstimate = () => {
    let basePrice = 799;
    let baseDays = 7;

    switch (calcService) {
      case "amigurumi":
        basePrice = 899;
        baseDays = 8;
        break;
      case "wearable":
        basePrice = 1899;
        baseDays = 14;
        break;
      case "blanket":
        basePrice = 2499;
        baseDays = 18;
        break;
      case "bouquet":
        basePrice = 999;
        baseDays = 6;
        break;
      case "repair":
        basePrice = 499;
        baseDays = 5;
        break;
      case "favors":
        basePrice = 249;
        baseDays = 14;
        break;
      default:
        basePrice = 799;
    }

    const complexityMultiplier = calcComplexity === "simple" ? 1 : calcComplexity === "medium" ? 1.35 : 1.75;
    const yarnMultiplier = calcYarn === "acrylic" ? 0.9 : calcYarn === "cotton" ? 1.1 : calcYarn === "velvet" ? 1.25 : 1.5;

    const unitPrice = Math.round(basePrice * complexityMultiplier * yarnMultiplier);
    const totalPrice = unitPrice * calcQuantity;
    const estimatedDays = Math.ceil(baseDays * (calcComplexity === "complex" ? 1.4 : 1));

    return {
      unitPrice,
      totalPrice,
      estimatedDays,
    };
  };

  const estimate = calculateEstimate();

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteData((prev) => ({ ...prev, [name]: value }));
    if (quoteErrors[name]) {
      setQuoteErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!quoteData.name.trim()) newErrors.name = "Name is required";
    if (!quoteData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(quoteData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!quoteData.message.trim()) newErrors.message = "Project description is required";

    if (Object.keys(newErrors).length > 0) {
      setQuoteErrors(newErrors);
      return;
    }

    setQuoteStatus("sending");

    try {
      const subjectLine = `[Custom Service Quote] ${quoteData.serviceType} — ${quoteData.name.trim()}`;
      const detailedMessage = `
--- CUSTOM SERVICE INQUIRY DETAILS ---
Service Type: ${quoteData.serviceType}
Preferred Yarn / Material: ${quoteData.yarnPreference}
Budget Range: ${quoteData.budgetRange}
Target Deadline: ${quoteData.deadline || "Flexible"}
Phone: ${quoteData.phone || "Not provided"}

Project Description & Vision:
${quoteData.message.trim()}
      `.trim();

      const res = await fetch(API_ENDPOINTS.CONTACTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quoteData.name.trim(),
          email: quoteData.email.trim(),
          phone: quoteData.phone.trim(),
          subject: subjectLine,
          message: detailedMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit quote request");

      setQuoteStatus("success");
      setQuoteData({
        name: "",
        email: "",
        phone: "",
        serviceType: "Bespoke Custom Commission",
        yarnPreference: "Organic Cotton",
        budgetRange: "₹1,000 - ₹2,500",
        deadline: "",
        message: "",
      });

      window.dispatchEvent(
        new CustomEvent("showToast", {
          detail: { message: "Quote request received! Our artisan will contact you within 24 hours. ✨🧶" },
        })
      );

      setTimeout(() => {
        setQuoteStatus("idle");
      }, 7000);
    } catch (err) {
      alert(err.message || "Could not submit custom quote. Please try again.");
      setQuoteStatus("idle");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="bg-[#FAF7F2] text-[#4A3B32] min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF8F5] via-[#FAF3EB] to-[#FAF7F2] pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-[#F0E4D8]">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#F88897]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FCD7AD]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F88897]/15 text-[#F88897] text-xs sm:text-sm font-bold uppercase tracking-wider mb-5">
              <LuSparkles className="text-base animate-pulse" />
              Tailored Artisan Services
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#6C2C12] leading-tight tracking-tight">
              Bespoke Crochet Artistry,{" "}
              <span className="text-[#F88897] underline decoration-[#F88897]/30 underline-offset-8">
                Stitched for You
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
              From personalized heirloom amigurumi and made-to-measure cardigans to vintage blanket restorations and corporate gifting, we bring warmth and handcrafted perfection to every single stitch.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#quote-form"
                className="px-7 py-3.5 rounded-full bg-[#F88897] text-white font-bold text-sm sm:text-base hover:bg-[#e06b7a] shadow-lg shadow-[#F88897]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Request Custom Quote</span>
                <FaArrowRight className="text-xs" />
              </a>

              <a
                href="#pricing-calculator"
                className="px-6 py-3.5 rounded-full bg-white text-[#6C2C12] border border-[#E8D5C4] font-bold text-sm sm:text-base hover:bg-[#FAF3EB] hover:border-[#F88897] shadow-xs transition-all flex items-center gap-2"
              >
                <LuCalculator className="text-lg text-[#F88897]" />
                <span>Estimate Price</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-[#EBDCD0]">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">100%</span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Handcrafted With Love</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">650+</span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Custom Orders Delivered</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">4.9 / 5</span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Client Satisfaction</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#6C2C12]">Eco-Safe</span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Hypoallergenic Yarns</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE SERVICES GRID */}
      <section className="py-16 sm:py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs sm:text-sm font-bold text-[#F88897] uppercase tracking-widest">
            What We Craft & Offer
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#6C2C12] mt-2">
            Signature Crochet Services
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Every creation is infused with thoughtful detailing, premium certified yarns, and timeless artisan quality.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SERVICES_DATA.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#F0E4D8] shadow-sm hover:shadow-md hover:border-[#F88897]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF3EB] group-hover:bg-[#F88897]/15 flex items-center justify-center transition-colors">
                    {service.icon}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF3EB] text-[#6C2C12] border border-[#EEDCCF]">
                    {service.badge}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-[#6C2C12] mb-2 font-serif group-hover:text-[#F88897] transition-colors">
                  {service.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {service.fullDesc}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Includes:</span>
                  {service.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                      <BsCheck2 className="text-[#F88897] shrink-0 text-sm font-bold" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm mt-2">
                <div>
                  <span className="text-gray-400 block text-[11px]">Starts From</span>
                  <span className="font-bold text-[#6C2C12] text-base">{service.startingPrice}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Turnaround</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <LuClock className="text-[#F88897]" />
                    {service.timeline}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. 4-STEP CRAFTING JOURNEY */}
      <section className="py-16 bg-white border-y border-[#F0E4D8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs sm:text-sm font-bold text-[#F88897] uppercase tracking-widest">
              Simple & Transparent
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#6C2C12] mt-2">
              How Custom Orders Work
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-3">
              We guide you through a seamless, enjoyable creative process from first sketch to finished keepsake.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {STEPS_DATA.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF7F2] border border-[#F0E4D8]">
                <span className="absolute -top-4 bg-[#6C2C12] text-white font-mono text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Step {step.step}
                </span>

                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center mt-3 mb-4 border border-[#EAD7C5]">
                  {step.icon}
                </div>

                <h4 className="text-lg font-bold text-[#6C2C12] mb-2 font-serif">
                  {step.title}
                </h4>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE PRICING ESTIMATOR */}
      <section id="pricing-calculator" className="py-16 sm:py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#EBDCD0] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0E4D8] mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F88897]/15 text-[#F88897] text-xs font-bold uppercase mb-2">
                <LuCalculator className="text-sm" />
                Instant Price Guide
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#6C2C12]">
                Custom Order Price Estimator
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Get an approximate estimate and timeline before submitting your inquiry.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-xs text-gray-400 block">Need a quick custom quote?</span>
              <a href="#quote-form" className="text-xs font-bold text-[#F88897] hover:underline">
                Jump to Quote Form &darr;
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  1. Project Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "amigurumi", label: "Amigurumi Doll" },
                    { id: "wearable", label: "Cardigan / Top" },
                    { id: "blanket", label: "Baby Blanket" },
                    { id: "bouquet", label: "Crochet Bouquet" },
                    { id: "repair", label: "Restoration/Repair" },
                    { id: "favors", label: "Event Favors (x10+)" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCalcService(cat.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-left cursor-pointer ${
                        calcService === cat.id
                          ? "bg-[#6C2C12] text-white border-[#6C2C12] shadow-xs"
                          : "bg-[#FAF7F2] text-gray-700 border-[#EBDCD0] hover:border-[#F88897]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  2. Design Complexity
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "simple", label: "Simple / Minimal" },
                    { id: "medium", label: "Medium Detail" },
                    { id: "complex", label: "Intricate / Custom" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCalcComplexity(lvl.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        calcComplexity === lvl.id
                          ? "bg-[#F88897] text-white border-[#F88897] shadow-xs"
                          : "bg-[#FAF7F2] text-gray-700 border-[#EBDCD0] hover:border-[#F88897]"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yarn Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  3. Yarn & Fiber Material
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "cotton", label: "100% Organic Cotton" },
                    { id: "velvet", label: "Plush Velvet Chenille" },
                    { id: "acrylic", label: "Soft Premium Acrylic" },
                    { id: "wool", label: "Luxury Merino Wool" },
                  ].map((yarn) => (
                    <button
                      key={yarn.id}
                      type="button"
                      onClick={() => setCalcYarn(yarn.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                        calcYarn === yarn.id
                          ? "bg-[#FAF3EB] text-[#6C2C12] border-[#F88897] ring-1 ring-[#F88897]"
                          : "bg-[#FAF7F2] text-gray-700 border-[#EBDCD0] hover:border-[#F88897]"
                      }`}
                    >
                      {yarn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              {calcService === "favors" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Quantity: {calcQuantity} units
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Number(e.target.value))}
                    className="w-full accent-[#F88897] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Right Estimate Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#FAF3EB] to-[#FDF8F5] rounded-2xl p-6 border border-[#EBDCD0] flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C2C12]/70 block mb-1">
                  Estimated Pricing
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl sm:text-4xl font-extrabold font-serif text-[#6C2C12]">
                    ₹{estimate.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">approximate</span>
                </div>

                <div className="space-y-3 py-4 border-y border-[#E8D6C5] text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Crafting Time:</span>
                    <span className="font-semibold text-[#6C2C12] flex items-center gap-1">
                      <LuClock className="text-[#F88897]" />
                      ~{estimate.estimatedDays} Business Days
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Yarn & Palette Swatch:</span>
                    <span className="font-semibold text-emerald-700">Included Free</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Quality Steam Blocking:</span>
                    <span className="font-semibold text-emerald-700">Included Free</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Gift Box & Care Card:</span>
                    <span className="font-semibold text-emerald-700">Complimentary</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-2">
                <a
                  href="#quote-form"
                  onClick={() => {
                    setQuoteData((prev) => ({
                      ...prev,
                      serviceType:
                        calcService === "amigurumi"
                          ? "Bespoke Custom Amigurumi"
                          : calcService === "wearable"
                          ? "Custom Wearable / Cardigan"
                          : calcService === "blanket"
                          ? "Custom Baby / Heirloom Blanket"
                          : calcService === "repair"
                          ? "Crochet Restoration & Repair"
                          : "Custom Crochet Commission",
                      budgetRange: `Approx ₹${estimate.totalPrice}`,
                    }));
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#6C2C12] text-white font-bold text-center text-xs sm:text-sm hover:bg-[#52210e] transition-colors block shadow-sm"
                >
                  Apply to Quote Form &darr;
                </a>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  * Final pricing confirmed after reviewing reference sketches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOM QUOTE INQUIRY FORM */}
      <section id="quote-form" className="py-16 sm:py-24 bg-white border-t border-[#F0E4D8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F88897]/15 text-[#F88897] text-xs font-bold uppercase mb-3">
              <LuHeartHandshake className="text-sm" />
              Direct Artisan Consultation
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#6C2C12]">
              Request a Custom Service Quote
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Share your concept and preferred materials. We’ll review your request and send a tailored quote with swatch recommendations within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleQuoteSubmit}
            className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#EBDCD0] shadow-sm space-y-6"
          >
            {quoteStatus === "success" && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                <BsCheckCircleFill className="text-xl text-emerald-600 shrink-0" />
                <span>
                  Thank you! Your custom project request has been submitted successfully. We will reply to your email shortly with yarn palettes and pricing details.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={quoteData.name}
                  onChange={handleQuoteChange}
                  placeholder="e.g. Rohini Sharma"
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-gray-800 focus:outline-none transition-all ${
                    quoteErrors.name ? "border-red-400 ring-1 ring-red-400" : "border-[#E8D6C5] focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897]"
                  }`}
                />
                {quoteErrors.name && (
                  <span className="text-xs text-red-500 mt-1 block">{quoteErrors.name}</span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={quoteData.email}
                  onChange={handleQuoteChange}
                  placeholder="e.g. rohini@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-gray-800 focus:outline-none transition-all ${
                    quoteErrors.email ? "border-red-400 ring-1 ring-red-400" : "border-[#E8D6C5] focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897]"
                  }`}
                />
                {quoteErrors.email && (
                  <span className="text-xs text-red-500 mt-1 block">{quoteErrors.email}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={quoteData.phone}
                  onChange={handleQuoteChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D6C5] text-sm text-gray-800 focus:outline-none focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897] transition-all"
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Service Category
                </label>
                <select
                  name="serviceType"
                  value={quoteData.serviceType}
                  onChange={handleQuoteChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D6C5] text-sm text-gray-800 focus:outline-none focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897] transition-all cursor-pointer"
                >
                  <option value="Bespoke Custom Commission">Bespoke Custom Commission (Amigurumi / Decor)</option>
                  <option value="Crochet Wearable / Cardigan">Made-to-Measure Wearable / Cardigan</option>
                  <option value="Baby Blanket & Heirloom Keepsake">Baby Blanket & Heirloom Keepsake</option>
                  <option value="Crochet Restoration & Repair">Crochet Restoration & Vintage Repair</option>
                  <option value="Pattern Drafting & Tech Editing">Pattern Drafting & Tech Editing</option>
                  <option value="Workshops & 1-on-1 Mentorship">Workshops & 1-on-1 Mentorship</option>
                  <option value="Corporate & Bulk Event Favors">Corporate & Event Favors (25+ Units)</option>
                  <option value="Yarn & Palette Consultation">Color & Palette Consultation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Yarn Preference */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Material / Yarn Choice
                </label>
                <select
                  name="yarnPreference"
                  value={quoteData.yarnPreference}
                  onChange={handleQuoteChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D6C5] text-sm text-gray-800 focus:outline-none focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897] transition-all cursor-pointer"
                >
                  <option value="Organic Cotton">100% Organic Cotton</option>
                  <option value="Plush Velvet Chenille">Plush Velvet Chenille</option>
                  <option value="Merino Wool">Pure Merino Wool</option>
                  <option value="Hypoallergenic Acrylic">Hypoallergenic Acrylic</option>
                  <option value="Artisan Recommendation">Let the Artisan Recommend</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Estimated Budget
                </label>
                <select
                  name="budgetRange"
                  value={quoteData.budgetRange}
                  onChange={handleQuoteChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D6C5] text-sm text-gray-800 focus:outline-none focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897] transition-all cursor-pointer"
                >
                  <option value="Under ₹1,000">Under ₹1,000</option>
                  <option value="₹1,000 - ₹2,500">₹1,000 - ₹2,500</option>
                  <option value="₹2,500 - ₹5,000">₹2,500 - ₹5,000</option>
                  <option value="₹5,000+ (Bulk / Luxury)">₹5,000+ (Bulk / Luxury)</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                  Target Date / Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={quoteData.deadline}
                  onChange={handleQuoteChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8D6C5] text-sm text-gray-800 focus:outline-none focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897] transition-all"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-[#6C2C12] uppercase tracking-wider mb-2">
                Project Vision & Details *
              </label>
              <textarea
                name="message"
                rows="4"
                value={quoteData.message}
                onChange={handleQuoteChange}
                placeholder="Describe your design, desired dimensions, colors, or any custom specifications..."
                className={`w-full px-4 py-3 rounded-xl bg-white border text-sm text-gray-800 focus:outline-none transition-all ${
                  quoteErrors.message ? "border-red-400 ring-1 ring-red-400" : "border-[#E8D6C5] focus:border-[#F88897] focus:ring-1 focus:ring-[#F88897]"
                }`}
              />
              {quoteErrors.message && (
                <span className="text-xs text-red-500 mt-1 block">{quoteErrors.message}</span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={quoteStatus === "sending"}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F88897] text-white font-bold text-sm sm:text-base hover:bg-[#e06b7a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F88897]/25 cursor-pointer disabled:opacity-60"
              >
                {quoteStatus === "sending" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <LuSend className="text-lg" />
                    <span>Send Custom Quote Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      <section className="py-16 sm:py-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs sm:text-sm font-bold text-[#F88897] uppercase tracking-widest">
            Loved By Crafters & Clients
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#6C2C12] mt-2">
            Stories From Our Custom Clients
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-[#F0E4D8] shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <FaQuoteLeft className="text-2xl text-[#F88897]/30 mb-4" />
                <p className="text-sm text-gray-700 leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#FAF3EB] text-[#6C2C12] font-bold text-xs flex items-center justify-center border border-[#EBDCD0]">
                  {t.avatar}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#6C2C12]">{t.name}</h5>
                  <span className="text-xs text-gray-500 block">{t.role}</span>
                </div>
                <div className="ml-auto flex text-amber-400 text-xs">
                  {[...Array(t.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 bg-white border-t border-[#F0E4D8]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-xs sm:text-sm font-bold text-[#F88897] uppercase tracking-widest">
              Got Questions?
            </h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#6C2C12] mt-2">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#EBDCD0] bg-[#FAF7F2] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left font-bold text-[#6C2C12] flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-serif">{faq.q}</span>
                    <LuChevronDown
                      className={`text-lg text-[#F88897] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-[#EBDCD0]/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. TOP BAR PROMISES COMPONENT */}
      <div className="py-8 bg-[#FAF7F2] border-t border-[#F0E4D8]">
        <TopBar />
      </div>
    </div>
  );
};

export default Services;
