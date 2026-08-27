const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper to determine destination folder by category
const getCategoryFolder = (category) => {
  if (!category) return "decor";
  const cat = category.toLowerCase().trim();
  if (cat === "blog" || cat === "blogs" || cat.includes("guide") || cat.includes("pattern") || cat.includes("yarn") || cat.includes("stitch") || cat.includes("story") || cat.includes("living")) return "blogs";
  if (cat.includes("decor") || cat.includes("gift")) return "decor";
  if (cat.includes("pet") || cat.includes("animal")) return "pet";
  if (cat.includes("home") || cat.includes("living")) return "home";
  if (cat.includes("kids") || cat.includes("baby")) return "kids";
  if (cat.includes("person") || cat.includes("custom")) return "custom";
  return "decor";
};

// Configure Multer to store in backend/uploads/products/<category>/ or backend/uploads/blogs/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check query param first (since Multer streams multipart before req.body is parsed)
    const type = req.query.type || req.body?.type;
    const category = req.query.category || req.body?.category || "decor";
    const folder = getCategoryFolder(category);

    let uploadDir;
    if (type === "blog" || type === "blogs" || category === "blogs" || category === "blog" || folder === "blogs") {
      uploadDir = path.join(__dirname, "../uploads/blogs");
    } else {
      uploadDir = path.join(__dirname, "../uploads/products", folder);
    }

    // Create directory in backend if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File validation filter: only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/svg+xml",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (.jpg, .jpeg, .png, .webp, .gif, .avif, .svg) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

module.exports = {
  upload,
  getCategoryFolder,
};
