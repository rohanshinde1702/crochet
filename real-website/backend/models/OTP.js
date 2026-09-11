const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  type: { type: String, default: "signup" },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-deletes after 300 seconds (5 min)
});

module.exports = mongoose.model("OTP", otpSchema);
