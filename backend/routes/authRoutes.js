const express = require("express");
const router = express.Router();
const {
  sendSignupOTP,
  verifySignupOTP,
  signIn,
  syncData,
  getMe,
  updateProfile,
  changePassword,
  sendForgotPasswordOTP,
  resetPasswordWithOTP
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public Auth Routes
router.post("/send-signup-otp", sendSignupOTP);
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/signin", signIn);
router.post("/login", (req, res) => {
  req.url = "/signin";
  return router.handle(req, res);
});
router.post("/forgot-password-otp", sendForgotPasswordOTP);
router.post("/reset-password-otp", resetPasswordWithOTP);

// Protected User Routes (Require valid JWT Bearer token)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/sync-data", protect, syncData);

module.exports = router;