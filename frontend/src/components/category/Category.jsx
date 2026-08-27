import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Category = () => {
  const navigate = useNavigate();

  const categoryMap = {
    'Decor & Gifts': 'Decor & Gifts',
    'Pet & Animal': 'Pet & Animal',
    'Home & Living': 'Home & Living',
    'Kids & Baby': 'Kids & Baby',
    'Personalized & Custom': 'Personalized',
    'Personalized': 'Personalized'
  };

  const handleCategoryClick = (categoryName) => {
    const target = categoryMap[categoryName] || categoryName;
    navigate(`/shop?category=${encodeURIComponent(target)}`);
  };

  const categories = [
    {
      id: 1,
      title: "Handcrafted Crochet Sunflower Pot",
      img: '/uploads/products/decor/category-1.png',
      category: 'Decor & Gifts',
    },
    {
      id: 2,
      title: "Cozy Crochet Chick Plushie",
      img: '/uploads/products/pet/category-1.png',
      category: 'Pet & Animal',
    },
    {
      id: 3,
      title: "Vintage Daisy Coaster Set",
      img: '/uploads/products/home/category-1.png',
      category: 'Home & Living',
    },
    {
      id: 4,
      title: "Soft Bunny Rattle Toy",
      img: '/uploads/products/kids/category-1.png',
      category: 'Kids & Baby',
    },
    {
      id: 5,
      title: "Custom Monogram Letter Keychain",
      img: '/uploads/products/custom/category-1.png',
      category: 'Personalized & Custom',
    }
  ];

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 60, 
        damping: 18,
        duration: 1,
      } 
    }
  };

  return (
    <div id="category-section" className="bg-[#F7EEE8] w-full overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20">

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-5 sm:py-8"
        >
          <h5 className="tracking-[1.5px] sm:tracking-[2px] font-semibold text-[#6C2C12] uppercase text-xs sm:text-sm">- Shop By Category -</h5>
          <h1 className="text-xl sm:text-3xl md:text-4xl my-1.5 sm:my-3 font-bold text-[#4A2E1B]">Shop Our Categories</h1>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-3.5 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 pb-8 sm:pb-12"
        >
          {categories.map((item, index) => (
            <motion.div 
              variants={cardVariants}
              whileHover={{ transition: { duration: 0.2 } }}
              onClick={() => handleCategoryClick(item.category)}
              className={`cursor-pointer group bg-white rounded-2xl shadow-xs hover:shadow-md border border-[#eadfd4] overflow-hidden transition-all ${
                index === 4 ? "col-span-2 sm:col-span-1" : ""
              }`}
              key={index}
            >
              <div className="aspect-square w-full overflow-hidden rounded-t-2xl relative bg-[#FFF9F5]">
                <img 
                  className="h-full w-full object-cover rounded-t-2xl transition-transform duration-500 ease-in-out group-hover:scale-105" 
                  src={item.img} 
                  alt={item.category}
                  onError={(e) => {
                    e.target.src = "/uploads/products/decor/sunflower.png";
                  }}
                />
              </div>
              <div className="bg-[#f88897] text-white rounded-b-2xl font-bold border-t border-[#eadfd4]">
                <h3 className="text-center py-2 sm:py-2.5 text-xs sm:text-sm font-semibold truncate px-2">{item.category}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Category;