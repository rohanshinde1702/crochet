import { GiYarn } from "react-icons/gi";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LuHandHeart } from "react-icons/lu";
import { IoColorPaletteOutline } from "react-icons/io5";
import { BiLeaf } from "react-icons/bi";
import { RiHeartsLine } from "react-icons/ri";
import { FaBullseye, FaRegEye, FaRegStar, FaRegHandshake } from "react-icons/fa";

const About = () => {

    const specialCrochet = [
        {
            icon: <LuHandHeart />,
            title: 'Handmade',
            subTitle: 'Every piece is carefulty handcrafted with love and attention to detail.',
        },
        {
            icon: <GiYarn />,
            title: 'Premium Quality',
            subTitle: 'We use soft, durable, and skin-friendly yarns for lasting comfort.',
        },
        {
            icon: <IoColorPaletteOutline />,
            title: 'Unique Design',
            subTitle: 'Thoughtful patterns that are timeless, cute, and functional.',
        },
        {
            icon: <BiLeaf />,
            title: 'Sustainable',
            subTitle: 'Eco-friendly materials and mindful packaging for a better tomorrow.',
        },
        {
            icon: <RiHeartsLine />,
            title: 'Made For You',
            subTitle: 'We create pieces that bring joy, warmth, and a personal touch.',
        },
    ]

    const visionMission = [
        {
            icon: <FaBullseye />,
            title: 'Our Mission',
            subTitle: 'To create handmade crochet pieces that bring joy, warmth, and comfort to everyday life.',
        },
        {
            icon: <FaRegEye />,
            title: 'Our Vision',
            subTitle: 'To spread handmade love worldwide and inspire mindful, slow living.',
        },
        {
            icon: <FaRegStar />,
            title: 'Unique Design',
            subTitle: 'Love, quality, creativity, sustainabilty, and customer happiness.',
        },
        {
            icon: <FaRegHandshake />,
            title: 'Made For You',
            subTitle: 'We promise to deliver handmade happiness in every stitch.',
        },
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.2
            }
        }
    };

    const heroContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.8
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        // Main Div //
        <div>
            {/* Hero Section Start Here */}
            <div className="relative h-150 overflow-hidden sm:h-162.5 md:h-175 lg:h-170 bg-gray-100">
                {/* Background Image with Framer Motion Animation */}
                <motion.div
                    className="absolute inset-0 bg-cover bg-center w-full h-full bg-[url('/uploads/hero/slider-3.png')]"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 1.5,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                />

                <motion.div
                    variants={heroContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="absolute left-5 top-1/2 w-[calc(100%-40px)] -translate-y-1/2 sm:left-10 sm:w-125 md:left-[8%] md:w-137.5 lg:left-[32%] xl:left-[26%] lg:-translate-x-1/2 z-10"
                >
                    <motion.h5 variants={itemVariants} className="text-sm font-medium uppercase text-[#6C2C12] sm:text-base md:text-lg">About Us</motion.h5>
                    <motion.h1 variants={itemVariants} className="my-2 text-3xl font-bold leading-tight sm:my-3 sm:text-5xl sm:leading-[1.1] md:text-6xl md:leading-[1.15] lg:leading-15">
                        <span className="text-[#6C2C12]">
                            Made By Hand,
                        </span>
                        <br />
                        <span className="text-[#F88897]">
                            Made With Heart
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="whitespace-pre-line text-sm leading-6 text-gray-700 sm:text-base sm:leading-7 md:text-lg lg:text-xl">
                        At CozyLoops, every stitch tells a story. We create handmade crochet pieces that bring warmth, comfort, and a touch of love to your everyday life.
                    </motion.p>

                    <motion.div variants={itemVariants} className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-4 md:gap-5">
                        <Link to="/shop" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full cursor-pointer rounded-sm border-2 border-[#6C2C12] bg-[#6C2C12] px-6 py-3 text-sm font-semibold uppercase text-white transition-all duration-300 hover:bg-transparent hover:text-[#6C2C12] sm:w-auto"
                            >
                                Shop Now
                            </motion.button>
                        </Link>

                        <Link to="/#category-section" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full cursor-pointer rounded-sm border-2 border-[#F88897] bg-[#F88897] px-6 py-3 text-sm font-semibold uppercase text-white transition-all duration-300 hover:bg-[#6C2C12] hover:border-[#6C2C12] sm:w-auto"
                            >
                                Explore Categories
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
            {/* Hero Section End Here */}


            {/* Our Story Section Start Here */}
            <div className="w-full">
                <div className="container flex flex-col gap-10 lg:gap-0 lg:flex-row items-center overflow-hidden">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start"
                    >
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                            <h3 className="font-semibold uppercase text-[#6C2C12]">Our Story</h3>
                            <div className="flex items-center justify-center lg:justify-start gap-2">
                                <span className="w-6 sm:w-5 h-px bg-[#d7a87b]"></span>
                                <span className="text-[#ef7f8f] text-lg">♥</span>
                                <span className="w-12 sm:w-16 h-px bg-[#d7a87b]"></span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight text-[#6C2C12] text-center lg:text-left mt-2">
                            A Small Dream That <br className="hidden sm:block" /> Grew With
                            <span className="text-[#ef7f8f] ml-2">Love</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 mx-auto lg:mx-0 mt-3 text-center lg:text-left lg:max-w-[95%]">
                            CozyLoops began with a simple love for yarn and creativity. What started as a few handmade gifts for family and friends soon turned into a passion
                            for crafting beautiful, meaningful pieces for homes and hearts around the world.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex gap-5 items-center mt-6 sm:mt-8">
                            <h1 className="text-4xl sm:text-5xl p-3 bg-[#d7a87b7d] rounded-full text-[#6C2C12]">
                                <GiYarn />
                            </h1>
                            <p className="flex flex-col text-sm sm:text-base">
                                <span>Made With Patience.</span>
                                <span>Created With Purpose.</span>
                                <span>Loved By You.</span>
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:w-1/2 w-full h-80 sm:h-96 md:h-120 lg:h-125 rounded-lg overflow-hidden"
                    >
                        <motion.img
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.5 }}
                            className="h-full w-full object-cover rounded-lg"
                            src="/uploads/others/ourStory.png"
                            alt=""
                        />
                    </motion.div>
                </div>
            </div>
            {/* Our Story Section End Here */}


            {/* What Makes Us Special Section Start Here */}
            <div className="w-full overflow-hidden bg-[#FAF3EB] border-t border-b border-[#eadfd4]">
                <div className="container mx-auto px-5 sm:px-8 md:px-12 lg:px-20">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h5 className="tracking-[1.5px] sm:tracking-[2px] font-semibold text-[#6C2C12] uppercase text-sm sm:text-base">- What Makes Us Special -</h5>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl my-2 sm:my-3 font-bold">More Than just <span className="text-[#F88897]">Crochet</span></h1>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-10 xl:gap-0 py-5"
                    >
                        {specialCrochet.map((special, index) => (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ transition: { duration: 0.2 } }}
                                key={index}
                                className="px-3 xl:border-r xl:border-[#EADDD5] xl:last:border-r-0"
                            >
                                <div className="flex flex-col justify-center items-center text-center">
                                    <h2 className="text-4xl sm:text-5xl">{special.icon}</h2>
                                    <h3 className="mt-4 text-base sm:text-lg font-semibold text-[#6C2C12]">{special.title}</h3>
                                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xs">{special.subTitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
            {/* What Makes Us Special Section End Here */}



            {/* Meet The Maker Section Start Here */}
            <div className="w-full">
                <div className="container flex flex-col gap-10 lg:gap-12 xl:gap-16 lg:flex-row items-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-1/2 h-80 sm:h-96 md:h-120 lg:h-125 rounded-lg overflow-hidden"
                    >
                        <motion.img
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.5 }}
                            className="h-full w-full object-cover rounded-lg"
                            src="/uploads/others/maker.png"
                            alt=""
                        />
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start"
                    >
                        <motion.h3 variants={itemVariants} className="font-semibold uppercase text-[#6C2C12]">- Meet The Maker -</motion.h3>
                        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight text-[#6C2C12] text-center lg:text-left mt-2">
                            Hello! <span className="text-black">I'm the heart of</span>
                            <span className="text-[#ef7f8f] ml-2">CozyLoops</span>
                        </motion.h1>

                        <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-2">
                            <span className="w-6 sm:w-5 h-px bg-[#d7a87b]"></span>
                            <span className="text-[#ef7f8f] text-lg">♥</span>
                            <span className="w-12 sm:w-16 h-px bg-[#d7a87b]"></span>
                        </motion.div>

                        <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg leading-6 sm:leading-7 mt-3 text-center lg:text-left max-w-xl lg:max-w-[95%]">
                            I'm a crochet lover, dreamer, and creator. Every design you see is made in my little space, with a lot of love, late nights. and endless cups
                            of tea. Thank you for supporting handmade and being a part of this beautiful journey.
                        </motion.p>

                        <motion.h1 variants={itemVariants} className="rouge-script-regular mt-5 text-3xl">
                            With Love,<br />
                            <span className="text-[#6C2C12]">Cozy</span><span className="text-[#ef7f8f]">Loops♡</span>
                        </motion.h1>
                    </motion.div>
                </div>
            </div>
            {/* Meet The Maker Section End Here */}


            {/* Vision Section Start Here */}
            <div className="w-full overflow-hidden bg-[#FAF3EB] border-t border-b border-[#eadfd4]">
                <div className="container mx-auto px-5 sm:px-8 md:px-12 lg:px-20">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 xl:gap-0"
                    >
                        {visionMission.map((vision, index) => (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ transition: { duration: 0.2 } }}
                                key={index}
                                className="px-3 xl:border-r xl:border-[#EADDD5] xl:last:border-r-0"
                            >
                                <div className="flex flex-col justify-center items-center text-center">
                                    <h2 className="text-4xl sm:text-5xl">{vision.icon}</h2>
                                    <h3 className="mt-4 text-base sm:text-lg font-semibold text-[#6C2C12]">{vision.title}</h3>
                                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xs">{vision.subTitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
            {/* Vision Section End Here */}
        </div>
    )
}

export default About
