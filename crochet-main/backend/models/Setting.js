const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "CozyLoops Studio" },
    email: { type: String, default: "cozyloops.crochet@gmail.com" },
    phone: { type: String, default: "+91 98765 43210" },
    whatsapp: { type: String, default: "+91 98765 43210" },
    address: { type: String, default: "Mumbai, Maharashtra, India" },
    businessHours: { type: String, default: "Mon - Sat: 10:00 AM - 7:00 PM" },
    socialLinks: {
      instagram: { type: String, default: "https://instagram.com/" },
      facebook: { type: String, default: "https://facebook.com/" },
      pinterest: { type: String, default: "https://pinterest.com/" },
      youtube: { type: String, default: "https://youtube.com/" },
      twitter: { type: String, default: "https://x.com/" }
    },
    freeShippingLimit: { type: Number, default: 999 },
    currency: { type: String, default: "INR (₹)" },
    maintenanceMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
