const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Unread", "Read", "Replied"],
      default: "Unread"
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
