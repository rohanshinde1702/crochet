const Blog = require("../models/Blog");

// Helper to generate a clean URL slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper to format date
const formatDate = (dateObj = new Date()) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[dateObj.getMonth()];
  const d = dateObj.getDate();
  const y = dateObj.getFullYear();
  return `${m} ${d}, ${y}`;
};

// 1. GET ALL ACTIVE BLOGS (with search, category, and tag filters)
const getAllBlogs = async (req, res, next) => {
  try {
    const { category, search, tag } = req.query;
    let query = { isDeleted: { $ne: true } };

    if (category && category !== "All Stories" && category !== "All") {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    if (tag && tag.trim()) {
      query.tags = { $in: [new RegExp(`^${tag.trim()}$`, "i")] };
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
        { "author.name": searchRegex },
        { category: searchRegex }
      ];
    }

    const blogs = await Blog.find(query).sort({ featured: -1, id: -1 });
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};

// 2. GET RECYCLE BIN BLOGS (ADMIN)
const getRecycleBinBlogs = async (req, res, next) => {
  try {
    const deletedBlogs = await Blog.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(deletedBlogs);
  } catch (err) {
    next(err);
  }
};

// 3. GET SINGLE BLOG BY SLUG OR ID OR _ID
const getBlogBySlug = async (req, res, next) => {
  try {
    const param = req.params.slug;
    const isObjectId = param.match(/^[0-9a-fA-F]{24}$/);
    const numericId = Number(param);

    const orConditions = [{ slug: param }];
    if (!isNaN(numericId) && numericId > 0) {
      orConditions.push({ id: numericId });
    }
    if (isObjectId) {
      orConditions.push({ _id: param });
    }

    const blog = await Blog.findOne({
      $or: orConditions,
      isDeleted: { $ne: true }
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog Not Found" });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
};

// 4. CREATE NEW BLOG STORY (ADMIN)
const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      category,
      img,
      excerpt,
      author,
      readTime,
      readMinutes,
      featured,
      tags,
      content
    } = req.body;

    if (!title || !category || !img) {
      return res.status(400).json({
        message: "Title, Category, and Cover Image are required fields."
      });
    }

    // Auto calculate incremental numeric ID
    let assignedId = req.body.id;
    if (!assignedId) {
      const lastBlog = await Blog.findOne().sort({ id: -1 });
      assignedId = lastBlog && lastBlog.id ? lastBlog.id + 1 : 1;
    } else {
      const existing = await Blog.findOne({ id: assignedId });
      if (existing) {
        const lastBlog = await Blog.findOne().sort({ id: -1 });
        assignedId = lastBlog && lastBlog.id ? lastBlog.id + 1 : 1;
      }
    }

    // Generate unique slug
    let baseSlug = req.body.slug ? generateSlug(req.body.slug) : generateSlug(title);
    if (!baseSlug) baseSlug = `story-${assignedId}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Process Tags
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string" && tags.trim()) {
      parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    } else {
      parsedTags = [category.trim()];
    }

    // Process Author
    const authorData = {
      name: (author && author.name) ? author.name.trim() : "Rohan Shinde",
      role: (author && author.role) ? author.role.trim() : "Master Artisan & Founder",
      avatar: (author && author.avatar) ? author.avatar.trim() : "/uploads/others/maker.png"
    };

    // Calculate Read Time
    const minutes = readMinutes ? Number(readMinutes) : 5;
    const computedReadTime = readTime ? readTime.trim() : `${minutes} min read`;

    // Process Content
    let parsedContent = [];
    if (Array.isArray(content) && content.length > 0) {
      parsedContent = content.map((block) => ({
        type: block.type || "paragraph",
        title: block.title ? block.title.trim() : "",
        text: block.text ? block.text.trim() : ""
      }));
    } else if (typeof content === "string" && content.trim()) {
      // Split paragraphs by newlines
      const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
      parsedContent = paragraphs.map((p) => ({
        type: "paragraph",
        title: "",
        text: p.trim()
      }));
    } else {
      parsedContent = [
        {
          type: "paragraph",
          text: excerpt ? excerpt.trim() : "Handcrafted with passion and meticulous attention to every loop and stitch."
        }
      ];
    }

    const now = new Date();
    const formattedDate = formatDate(now);
    const isoDateStr = now.toISOString().split("T")[0];

    const newBlog = new Blog({
      id: assignedId,
      slug: uniqueSlug,
      title: title.trim(),
      category: category.trim(),
      readTime: computedReadTime,
      readMinutes: minutes,
      date: req.body.date || formattedDate,
      isoDate: req.body.isoDate || isoDateStr,
      featured: Boolean(featured),
      author: authorData,
      img: img.trim(),
      excerpt: excerpt ? excerpt.trim() : title.trim(),
      tags: parsedTags,
      likesCount: 0,
      commentsCount: 0,
      content: parsedContent,
      comments: [],
      isDeleted: false,
      deletedAt: null
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({
      message: "Handcrafted Story published successfully! 📝✨",
      blog: savedBlog
    });
  } catch (err) {
    next(err);
  }
};

// 5. UPDATE BLOG STORY (ADMIN)
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const numericId = Number(id);

    const orConditions = [{ slug: id }];
    if (!isNaN(numericId) && numericId > 0) {
      orConditions.push({ id: numericId });
    }
    if (isObjectId) {
      orConditions.push({ _id: id });
    }

    const existingBlog = await Blog.findOne({ $or: orConditions });
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found to update." });
    }

    const updateData = { ...req.body };

    // Format tags if provided as string
    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    // Format read minutes/time
    if (updateData.readMinutes !== undefined) {
      updateData.readMinutes = Number(updateData.readMinutes);
      if (!updateData.readTime) {
        updateData.readTime = `${updateData.readMinutes} min read`;
      }
    }

    // Format content if string
    if (typeof updateData.content === "string") {
      const paragraphs = updateData.content.split(/\n\n+/).filter((p) => p.trim());
      updateData.content = paragraphs.map((p) => ({
        type: "paragraph",
        title: "",
        text: p.trim()
      }));
    }

    const updated = await Blog.findByIdAndUpdate(existingBlog._id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      message: "Blog story updated successfully! ✨",
      blog: updated
    });
  } catch (err) {
    next(err);
  }
};

// 6. SOFT DELETE BLOG -> MOVE TO RECYCLE BIN (ADMIN)
const softDeleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const numericId = Number(id);

    const orConditions = [{ slug: id }];
    if (!isNaN(numericId) && numericId > 0) {
      orConditions.push({ id: numericId });
    }
    if (isObjectId) {
      orConditions.push({ _id: id });
    }

    const blog = await Blog.findOne({ $or: orConditions });
    if (!blog) {
      return res.status(404).json({ message: "Blog story not found." });
    }

    blog.isDeleted = true;
    blog.deletedAt = new Date();
    await blog.save();

    res.json({
      message: `Story "${blog.title}" moved to Recycle Bin.`,
      blog
    });
  } catch (err) {
    next(err);
  }
};

// 7. RESTORE BLOG FROM RECYCLE BIN (ADMIN)
const restoreBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const numericId = Number(id);

    const orConditions = [{ slug: id }];
    if (!isNaN(numericId) && numericId > 0) {
      orConditions.push({ id: numericId });
    }
    if (isObjectId) {
      orConditions.push({ _id: id });
    }

    const blog = await Blog.findOne({ $or: orConditions });
    if (!blog) {
      return res.status(404).json({ message: "Blog story not found to restore." });
    }

    blog.isDeleted = false;
    blog.deletedAt = null;
    await blog.save();

    res.json({
      message: `Story "${blog.title}" restored successfully to active stories! ✨`,
      blog
    });
  } catch (err) {
    next(err);
  }
};

// 8. PERMANENTLY DELETE BLOG (ADMIN)
const permanentDeleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const numericId = Number(id);

    const orConditions = [{ slug: id }];
    if (!isNaN(numericId) && numericId > 0) {
      orConditions.push({ id: numericId });
    }
    if (isObjectId) {
      orConditions.push({ _id: id });
    }

    const deleted = await Blog.findOneAndDelete({ $or: orConditions });
    if (!deleted) {
      return res.status(404).json({ message: "Blog story not found to delete permanently." });
    }

    res.json({
      message: `Story "${deleted.title}" permanently deleted from database.`,
      deletedId: deleted.id
    });
  } catch (err) {
    next(err);
  }
};

// 9. EMPTY RECYCLE BIN (ADMIN)
const emptyRecycleBin = async (req, res, next) => {
  try {
    const result = await Blog.deleteMany({ isDeleted: true });
    res.json({
      message: `Emptied Blog Recycle Bin (${result.deletedCount} stories permanently removed).`,
      count: result.deletedCount
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBlogs,
  getRecycleBinBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  softDeleteBlog,
  restoreBlog,
  permanentDeleteBlog,
  emptyRecycleBin
};
