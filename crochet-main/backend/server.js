require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const contactRoutes = require("./routes/contactRoutes");
const settingRoutes = require("./routes/settingRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Smart static image resolver for products (cross-category fallback)
app.get("/uploads/products/:folder/:filename", (req, res, next) => {
  const { folder, filename } = req.params;
  const exactPath = path.join(__dirname, "uploads/products", folder, filename);
  if (fs.existsSync(exactPath)) {
    return res.sendFile(exactPath);
  }

  // Cross-category fallback search
  const categories = ["decor", "pet", "home", "kids", "custom"];
  for (const cat of categories) {
    const candidate = path.join(__dirname, "uploads/products", cat, filename);
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }

  // Default fallback if asset is completely missing
  const defaultFallback = path.join(__dirname, "uploads/products/decor/sunflower.png");
  if (fs.existsSync(defaultFallback)) {
    return res.sendFile(defaultFallback);
  }

  next();
});

// Serve static backend uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Also serve /images for backward compatibility
app.use("/images", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/settings", settingRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));