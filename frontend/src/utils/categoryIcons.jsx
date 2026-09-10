import {
  LuFlower2,
  LuSparkles,
  LuPawPrint,
  LuHouse,
  LuBaby,
  LuBoxes,
  LuGift,
  LuHeartHandshake,
  LuPalette,
} from "react-icons/lu";
import { GiYarn } from "react-icons/gi";

/**
 * Returns a React Icon element corresponding to the given category name.
 * @param {string} category
 * @param {string} className
 * @returns {JSX.Element}
 */
export const getCategoryIcon = (category = "", className = "") => {
  const cat = (category || "").toLowerCase().trim();

  if (cat.includes("decor") || cat.includes("gift")) {
    return <LuFlower2 className={className} />;
  }
  if (cat.includes("pet") || cat.includes("animal")) {
    return <LuPawPrint className={className} />;
  }
  if (cat.includes("home") || cat.includes("living")) {
    return <LuHouse className={className} />;
  }
  if (cat.includes("kids") || cat.includes("baby")) {
    return <LuBaby className={className} />;
  }
  if (cat.includes("person") || cat.includes("custom")) {
    return <LuSparkles className={className} />;
  }
  if (cat.includes("all")) {
    return <LuBoxes className={className} />;
  }
  return <GiYarn className={className} />;
};

export const CategoryIcon = ({ category = "", className = "" }) => {
  return getCategoryIcon(category, className);
};

export default CategoryIcon;
