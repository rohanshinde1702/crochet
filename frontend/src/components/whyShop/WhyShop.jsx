import { LuPalette, LuHeartHandshake, LuStore, LuLeaf, LuHandHeart } from "react-icons/lu";
import { motion } from "framer-motion";

const WhyShop = () => {
  const whyShop = [
    {
      icon: <LuPalette />,
      title: "Unique Designs",
      desc: "Thoughtful Patterns made to stand out.",
    },
    {
      icon: <LuHeartHandshake />,
      title: "Custom & Personalised",
      desc: "Custom-Made with love, just for you.",
    },
    {
      icon: <LuStore />,
      title: "Small Business",
      desc: "Proudly made in India by passionate creators.",
    },
    {
      icon: <LuLeaf />,
      title: "Sustainable",
      desc: "Eco-friendly Yarns and mindful Packaging.",
    },
    {
      icon: <LuHandHeart />,
      title: "Made With Care",
      desc: "Every stitch is a step towards perfection.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="w-full overflow-hidden border-t border-b border-[#eadfd4]">
      <div className="container mx-auto px-5 sm:px-8 md:px-12 lg:px-20">

        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-5 sm:py-8"
        >
          <h5 className="tracking-[1.5px] sm:tracking-[2px] font-semibold text-[#6C2C12] uppercase text-sm sm:text-base">- Why Shop With US -</h5>
          <h1 className="text-2xl sm:text-3xl md:text-4xl my-2 sm:my-3 font-bold text-[#6C2C12]">What Makes CozyLoops Special?</h1>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-10 xl:gap-0 py-5"
        >
          {whyShop.map((content, index) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ transition: { duration: 0.2 } }}
              key={index} 
              className="px-3 xl:border-r xl:border-[#EADDD5] xl:last:border-r-0"
            >
              <div className="flex flex-col justify-center items-center text-center">
                <h2 className="text-4xl sm:text-5xl">{content.icon}</h2>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-[#6C2C12]">{content.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xs">{content.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WhyShop;