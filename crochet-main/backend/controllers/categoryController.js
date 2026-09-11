const Category = require("../models/Category");
const Product = require("../models/Product");

// @desc    Get all categories with dynamic live product counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ displayOrder: 1, createdAt: 1 });
    const products = await Product.find({ isDeleted: false });

    const categoriesWithCount = categories.map((cat) => {
      const count = products.filter(
        (p) => p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
      ).length;

      return {
        ...cat.toObject(),
        productCount: count
      };
    });

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res) => {
  try {
    const { name, icon, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const existing = await Category.findOne({ slug });

    if (existing) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCat = new Category({
      name: name.trim(),
      slug,
      icon: icon || "🧶",
      description: description || "Handcrafted bespoke collection",
      image: image || "/uploads/products/decor/sunflower.png"
    });

    const saved = await newCat.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res) => {
  try {
    const { name, icon, description, image } = req.body;
    const cat = await Category.findById(req.params.id);

    if (!cat) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) {
      cat.name = name.trim();
      cat.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (icon) cat.icon = icon;
    if (description !== undefined) cat.description = description;
    if (image) cat.image = image;

    const updated = await cat.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
