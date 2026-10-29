import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Hero = () => {
  const sliders = [
    {
      img: "/uploads/hero/slider-1.png",
      subTitle: "Handmade with love",
      titleFirst: "Made With Yarn,",
      titleSecond: "Made For You.",
      desc: "Discover beautifully handcrafted crochet creations \nfor every moment and every home.",
    },
    {
      img: "/uploads/hero/slider-2.png",
      subTitle: "Made to be cherished",
      titleFirst: "Little Details,",
      titleSecond: "Big Warmth.",
      desc: "Thoughtfully handcrafted pieces that bring \ncomfort and charm to your space.",
    },
    {
      img: "/uploads/hero/slider-3.png",
      subTitle: "Crafted by hand",
      titleFirst: "Crochet That",
      titleSecond: "Feels Like Home.",
      desc: "Unique handmade creations designed to make everyday \nmoments a little more special.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.9,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="overflow-hidden">
      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Pagination, EffectFade]}
        loop={true}
        effect="fade"
        speed={2000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
      >
        {sliders.map((slider, index) => (
          <SwiperSlide key={index}>
            {({ isActive }) => (
              <div className="relative h-150 overflow-hidden sm:h-162.5 md:h-175 lg:h-170 bg-[#faf5f0]">
                {/* Animated Background Image */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center w-full h-full"
                  style={{
                    backgroundImage: `url(${slider.img})`,
                  }}
                  initial={
                    index === 0
                      ? { opacity: 0, scale: 1.08 }
                      : index === 1
                      ? { y: "-100%" }
                      : { x: "100%" }
                  }
                  animate={
                    isActive
                      ? (index === 0
                          ? { opacity: 1, scale: 1 }
                          : index === 1
                          ? { y: 0 }
                          : { x: 0 })
                      : (index === 0
                          ? { opacity: 0, scale: 1.08 }
                          : index === 1
                          ? { y: "-100%" }
                          : { x: "100%" })
                  }
                  transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                {/* Hero Content */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate={isActive ? "visible" : "hidden"}
                  className="absolute left-5 top-1/2 w-[calc(100%-40px)] -translate-y-1/2 sm:left-10 sm:w-125 md:left-[12%] md:w-137.5
                      lg:left-[25%] lg:-translate-x-1/2 z-10"
                >
                  {/* Subtitle */}
                  <motion.h5 
                    variants={itemVariants}
                    className="text-sm font-medium sm:text-base md:text-lg uppercase"
                  >
                    <span className="text-[#6C2C12]">
                      {slider.subTitle}
                    </span>
                  </motion.h5>

                  {/* Title */}
                  <motion.h1 
                    variants={itemVariants}
                    className="my-2 text-4xl font-bold leading-tight sm:my-3 sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-[1.15] lg:leading-15"
                  >
                    <span className="text-[#6C2C12]">
                      {slider.titleFirst}
                    </span>

                    <br />

                    <span className="text-[#F88897]">
                      {slider.titleSecond}
                    </span>
                  </motion.h1>

                  {/* Description */}
                  <motion.p 
                    variants={itemVariants}
                    className=" whitespace-pre-line text-sm leading-6 sm:text-base sm:leading-7 md:text-lg lg:text-xl text-gray-700"
                  >
                    {slider.desc}
                  </motion.p>

                  {/* Buttons */}
                  <motion.div 
                    variants={itemVariants}
                    className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-5"
                  >
                    <Link to="/shop" className="w-full sm:w-auto">
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className=" w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold
                          uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto"
                      >
                        Shop Now
                      </motion.button>
                    </Link>

                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const el = document.getElementById("category-section");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="w-full cursor-pointer rounded-sm border-2 border-[#F88897] bg-[#F88897] px-6 py-3 text-sm font-semibold
                        uppercase text-white transition-all duration-300 hover:bg-[#6C2C12] hover:border-[#6C2C12] sm:w-auto"
                    >
                      Explore Categories
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;