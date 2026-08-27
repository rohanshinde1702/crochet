import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MadeByHand = () => {
  return (
    <div className="w-full bg-[#FAF6F0] overflow-hidden py-10 sm:py-16">
      <div className="container">

        <div>
          <div className="bg-[#faf3eb] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#eadfd4]">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex items-center px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-14 lg:px-12 xl:px-16"
              >

                <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <span className="w-10 sm:w-14 h-px bg-[#d7a87b]"></span>
                  <span className="text-[#ef7f8f] text-xl">♡</span>
                  <span className="w-10 sm:w-14 h-px bg-[#d7a87b]"></span>
                </div>

                <div className="w-full text-center lg:text-left pt-5 sm:pt-7">
                  <p className="text-[#6C2C12] uppercase tracking-[2px] text-xs sm:text-sm font-semibold mb-3">
                    - Handmade With Love -
                  </p>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight text-[#6C2C12]">
                    Made by <span className="text-[#ef7f8f]">Hand,</span>
                    <br />
                    Made to <span className="text-[#ef7f8f]">Keep</span>
                  </h1>

                  <div className="flex items-center justify-center lg:justify-start gap-3 my-5 sm:my-6">
                    <span className="w-12 sm:w-16 h-px bg-[#d7a87b]"></span>
                    <span className="text-[#ef7f8f] text-lg">♥</span>
                    <span className="w-12 sm:w-16 h-px bg-[#d7a87b]"></span>
                  </div>

                  <p className="text-[#6C2C12] text-sm sm:text-base md:text-lg leading-6 sm:leading-7 max-w-xl mx-auto lg:mx-0">
                    Every CozyLoops piece begins with a simple strand of yarn and a little imagination. From the first loop to the final stitch, each creation is carefully handmade with warmth,
                    patience, and attention to detail.
                  </p>

                  <Link to="/about">
                    <button className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-[#6C2C12] hover:bg-[#54210d] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 shadow-sm cursor-pointer">
                      Our Story
                      <span className="text-lg">→</span>
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative min-h-75 sm:min-h-100 lg:min-h-125"
              >
                <img
                  src="/uploads/others/madeByHand.png"
                  alt="Made by hand crochet"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MadeByHand;