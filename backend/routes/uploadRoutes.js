const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadMiddleware");
const { uploadProductImage } = require("../controllers/uploadController");

// POST /api/upload -> Uploads file into products/<category>/ folder
router.post("/", upload.single("image"), uploadProductImage);

module.exports = router;
