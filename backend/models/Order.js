const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: { type: Number },
  product: { type: mongoose.Schema.Types.Mixed },
  title: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  img: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, trim: true }
    },
    shippingAddress: {
      street: { type: String, default: "124 Marine Drive" },
      city: { type: String, default: "Mumbai" },
      state: { type: String, default: "Maharashtra" },
      postalCode: { type: String, default: "400020" },
      country: { type: String, default: "India" }
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "NetBanking", "COD", "Razorpay"],
      default: "UPI"
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Paid"
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Pending"],
      default: "Processing"
    },
    date: { type: String },
    trackingNumber: { type: String },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
