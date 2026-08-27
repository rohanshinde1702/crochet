const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    avatar: { 
      type: String, 
      default: "https://api.dicebear.com/7.x/adventurer/svg?seed=CrochetArtisan" 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    cart: {
      type: Array,
      default: []
    },
    wishlist: {
      type: Array,
      default: []
    },
    isVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
