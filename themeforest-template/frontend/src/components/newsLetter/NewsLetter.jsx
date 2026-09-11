import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NewsLetter = () => {
  return (
    <div className="h-125 sm:h-95 md:h-110 w-full bg-[url('/uploads/others/newsletter.png')] bg-cover bg-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[30%] absolute top-[50%] left-[5%] sm:left-[10%] md:left-[10%] xl:left-[13%] translate-y-[-50%] translate-x-0"
      >
        <p className="text-sm font-medium sm:text-base md:text-lg uppercase tracking-[1.5px] md:tracking-[2px] text-[#6C2C12]">
          Handcrafted With Love
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl my-2 leading-tight font-bold text-[#6C2C12]">
          Handmade Happiness Just For You!
        </h1>

        <p className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 text-gray-700">
          Discover thoughtful crochet creations, handmade stitch by stitch to bring warmth and charm to your everyday moments.
        </p>

        <Link to="/shop">
          <button className="mt-5 w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold
              uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto shadow-md">
            Shop Now
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NewsLetter;
