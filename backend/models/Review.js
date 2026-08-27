const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, index: true },
    productTitle: { type: String },
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      avatar: { type: String, default: "https://api.dicebear.com/7.x/adventurer/svg?seed=CrochetFan" }
    },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true },
    date: { type: String },
    verifiedPurchase: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
