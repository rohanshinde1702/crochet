const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "🧶" },
    description: { type: String, default: "" },
    image: { type: String, default: "/uploads/products/decor/sunflower.png" },
    featured: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
