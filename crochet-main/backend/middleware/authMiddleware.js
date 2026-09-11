const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getAdminEmails = () => {
  const raw = process.env.ADMIN_EMAIL || "admin@cozyloops.com";
  const list = raw
    .split(",")
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  if (!list.includes("admin@cozyloops.com")) {
    list.push("admin@cozyloops.com");
  }
  return list;
};

const isEmailAdmin = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase().trim());
};

// Protect middleware: verifies JWT token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -__v");

    if (!user) {
      return res.status(401).json({ message: "User not found with this token." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been suspended by an administrator." });
    }

    // Auto-sync admin role for authorized emails
    if (isEmailAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token." });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || isEmailAdmin(req.user.email))) {
    return next();
  }
  return res.status(403).json({ message: "Access Denied: Admin privileges required." });
};

module.exports = {
  protect,
  adminOnly,
  getAdminEmails,
  isEmailAdmin
};
