const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getRecycleBinBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  softDeleteBlog,
  restoreBlog,
  permanentDeleteBlog,
  emptyRecycleBin
} = require("../controllers/blogController");

// Public Blog Catalog Routes
router.get("/", getAllBlogs);
router.get("/recycle-bin", getRecycleBinBlogs);
router.get("/:slug", getBlogBySlug);

// Admin Blog CRUD Operations
router.post("/", createBlog);
router.delete("/recycle-bin/empty", emptyRecycleBin);
router.put("/:id/restore", restoreBlog);
router.delete("/:id/permanent", permanentDeleteBlog);
router.put("/:id", updateBlog);
router.delete("/:id", softDeleteBlog);

module.exports = router;