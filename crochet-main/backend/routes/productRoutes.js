const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getRecycleBinProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  emptyRecycleBin
} = require("../controllers/productController");

// Public Product Catalog Routes
router.get("/", getAllProducts);
router.get("/recycle-bin", getRecycleBinProducts);
router.get("/:id", getProductById);

// Admin Product CRUD Operations
router.post("/", createProduct);
router.delete("/recycle-bin/empty", emptyRecycleBin);
router.put("/:id/restore", restoreProduct);
router.delete("/:id/permanent", permanentDeleteProduct);
router.put("/:id", updateProduct);
router.delete("/:id", softDeleteProduct);

module.exports = router;