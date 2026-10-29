import { PiPlant } from "react-icons/pi";
import { FaRegStar } from "react-icons/fa";
import { BiLeaf } from "react-icons/bi";
import { motion } from "framer-motion";
import { LuHandHeart } from "react-icons/lu";

const TopBar = () => {
  const barContent = [
    {
      icon: <LuHandHeart />,
      title: 'Handmade With Love',
      subtitle: 'Each peace is carefully handcrafted.',
    },
    {
      icon: <PiPlant />,
      title: 'Premium Quality Yarn',
      subtitle: 'Soft, durable and skin-friendly for everyday use.',
    },
    {
      icon: <FaRegStar />,
      title: "Perfect for Gifting",
      subtitle: "Thoughtful handmade gifts for your loved ones.",
    },
    {
      icon: <BiLeaf />,
      title: "Made Sustainably",
      subtitle: "Eco-friendly yarns and mindful packaging.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
  };

  return (
    <div className="container overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {barContent.map((content, index) => (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col xl:flex-row gap-3 justify-center items-center text-center xl:text-start py-5 sm:py-8"
            key={index}
          >
            <div className="shrink-0">
              <h1 className="text-4xl sm:text-5xl text-blackk">{content.icon}</h1>
            </div>

            <div>
              <h2 className="font-semibold text-base sm:text-lg text-[#6C2C12]">{content.title}</h2>
              <h4 className="whitespace-pre-line text-sm sm:text-base text-gray-500">{content.subtitle}</h4>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TopBar;
