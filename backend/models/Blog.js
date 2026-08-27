const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    readTime: { type: String },
    readMinutes: { type: Number },
    date: { type: String },
    isoDate: { type: String },
    featured: { type: Boolean, default: false },
    author: {
      name: { type: String },
      role: { type: String },
      avatar: { type: String }
    },
    img: { type: String, required: true },
    excerpt: { type: String },
    tags: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    content: [
      {
        type: { type: String, default: "paragraph" },
        title: { type: String, default: "" },
        text: { type: String, default: "" }
      }
    ],
    comments: [
      {
        id: { type: Number },
        name: { type: String },
        date: { type: String },
        avatar: { type: String },
        text: { type: String }
      }
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
