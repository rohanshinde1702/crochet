const { getCategoryFolder } = require("../middleware/uploadMiddleware");

// Upload Image into backend/uploads/products/<category>/ or backend/uploads/blogs/ and return URL
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided for upload." });
    }

    const type = req.query.type || req.body?.type;
    const category = req.query.category || req.body?.category || "decor";
    const folder = getCategoryFolder(category);

    const isBlog = type === "blog" || type === "blogs" || category === "blogs" || category === "blog" || folder === "blogs";

    const serverUrl = isBlog
      ? `http://localhost:5000/uploads/blogs/${req.file.filename}`
      : `http://localhost:5000/uploads/products/${folder}/${req.file.filename}`;

    const relativeUrl = isBlog
      ? `/uploads/blogs/${req.file.filename}`
      : `/uploads/products/${folder}/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully! 📸",
      url: serverUrl,
      relativeUrl: relativeUrl,
      filename: req.file.filename,
      folder: isBlog ? "blogs" : folder,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadProductImage,
};
