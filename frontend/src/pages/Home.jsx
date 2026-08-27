import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Category from "../components/category/Category";
import Hero from "../components/hero/Hero";
import TopBar from "../components/topBar/TopBar";
import WhyShop from "../components/whyShop/WhyShop";
import NewsLetter from "../components/newsLetter/NewsLetter";
import ProductSlider from "../components/productSlider/ProductSlider";
import MadeByHand from "../components/madeByHand/MadeByHand";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#category-section") {
      setTimeout(() => {
        const el = document.getElementById("category-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [location]);

  return (
    <div>
      <Hero />
      <TopBar />
      <Category />
      <WhyShop />
      <NewsLetter />
      <ProductSlider />
      <MadeByHand />
    </div>
  );
};

export default Home;
