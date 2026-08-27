const Product = require("../models/Product");

// 1. GET ALL ACTIVE PRODUCTS (with optional category / search filters)
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (category && category !== "All Creations" && category !== "All") {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query).sort({ id: 1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// 2. GET RECYCLE BIN PRODUCTS (ADMIN)
const getRecycleBinProducts = async (req, res, next) => {
  try {
    const deletedProducts = await Product.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(deletedProducts);
  } catch (err) {
    next(err);
  }
};

// 3. GET SINGLE PRODUCT BY ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [
        { id: req.params.id },
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }
      ],
      isDeleted: { $ne: true }
    });

    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// 4. CREATE NEW PRODUCT (ADMIN)
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      category,
      price,
      img,
      rating,
      reviewsCount,
      badge,
      material,
      description,
      tags,
      inStock
    } = req.body;

    if (!title || !category || price === undefined || !img) {
      return res.status(400).json({
        message: "Title, Category, Price, and Image are required fields."
      });
    }

    let assignedId = req.body.id;
    if (!assignedId) {
      const lastProduct = await Product.findOne().sort({ id: -1 });
      assignedId = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;
    } else {
      const existing = await Product.findOne({ id: assignedId });
      if (existing) {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        assignedId = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;
      }
    }

    const newProduct = new Product({
      id: assignedId,
      title: title.trim(),
      category: category.trim(),
      price: Number(price),
      img: img.trim(),
      rating: rating !== undefined ? Number(rating) : 5.0,
      reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : 0,
      badge: badge ? badge.trim() : "",
      material: material ? material.trim() : "100% Cotton & Premium Acrylic Yarn",
      description: description ? description.trim() : "Lovingly handcrafted with premium quality yarn.",
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string" && tags.trim()
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [category],
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      isDeleted: false,
      deletedAt: null
    });

    const saved = await newProduct.save();
    res.status(201).json({
      message: "Product created successfully! 🧶",
      product: saved
    });
  } catch (err) {
    next(err);
  }
};

// 5. UPDATE PRODUCT (ADMIN)
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }
    if (updateData.reviewsCount !== undefined) {
      updateData.reviewsCount = Number(updateData.reviewsCount);
    }
    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const query = {
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    };

    const updated = await Product.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found to update." });
    }

    res.json({
      message: "Product updated successfully! ✨",
      product: updated
    });
  } catch (err) {
    next(err);
  }
};

// 6. SOFT DELETE PRODUCT -> MOVE TO RECYCLE BIN (ADMIN)
const softDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    res.json({
      message: `Product "${product.title}" moved to Recycle Bin.`,
      product
    });
  } catch (err) {
    next(err);
  }
};

// 7. RESTORE PRODUCT FROM RECYCLE BIN (ADMIN)
const restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ message: "Product not found to restore." });
    }

    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();

    res.json({
      message: `Product "${product.title}" restored successfully! ✨`,
      product
    });
  } catch (err) {
    next(err);
  }
};

// 8. PERMANENTLY DELETE PRODUCT (ADMIN)
const permanentDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    };

    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found to delete permanently." });
    }

    res.json({
      message: `Product "${deleted.title}" permanently deleted from database.`,
      deletedId: deleted.id
    });
  } catch (err) {
    next(err);
  }
};

// 9. EMPTY RECYCLE BIN (ADMIN)
const emptyRecycleBin = async (req, res, next) => {
  try {
    const result = await Product.deleteMany({ isDeleted: true });
    res.json({
      message: `Emptied Recycle Bin (${result.deletedCount} products permanently removed).`,
      count: result.deletedCount
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getRecycleBinProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  emptyRecycleBin
};
