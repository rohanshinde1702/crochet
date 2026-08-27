const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const transporter = require("../config/nodemailer");
const { isEmailAdmin } = require("../middleware/authMiddleware");

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to send email OTP
const sendOtpEmail = async (email, otp, purpose) => {
  const isEmailConfigured =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes("your_email") &&
    !process.env.EMAIL_PASS.includes("your_gmail");

  if (!isEmailConfigured) {
    console.log(
      `⚠️ [GMAIL NOT CONFIGURED] Real email was skipped because EMAIL_USER/EMAIL_PASS in backend/.env are placeholders.\n👉 Verification Code for ${email}: [ ${otp} ]`
    );
    return { success: false, reason: "unconfigured" };
  }

  const mailOptions = {
    from: `"Crochet Handcrafted" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🧶 Your Crochet Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #FAF6F0; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #EADFD4;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #6C2C12; margin: 0;">🧶 Crochet Handcrafted</h2>
          <p style="color: #8C6D58; font-size: 14px; margin-top: 5px;">Pure Artisanal Warmth</p>
        </div>
        <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; border: 1px solid #EADFD4;">
          <p style="font-size: 15px; color: #333; margin-bottom: 10px;">Use the following code to complete your <strong>${purpose}</strong>:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #6C2C12; background: #FAF3EB; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 15px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 10px;">This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP ${otp} sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.log(`⚠️ Email sending failed: ${err.message}. 👉 (OTP for testing: ${otp})`);
    return { success: false, reason: err.message };
  }
};

// 1. SEND SIGN UP OTP
const sendSignupOTP = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "An account with this email already exists. Please Sign In." });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail, type: "signup" });
    await OTP.create({ email: normalizedEmail, otp, type: "signup" });

    const emailStatus = await sendOtpEmail(normalizedEmail, otp, "Account Registration");
    res.json({
      message: `Verification code sent to ${normalizedEmail}`,
      previewOtp: !emailStatus.success ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// 2. VERIFY SIGN UP OTP & CREATE ACCOUNT
const verifySignupOTP = async (req, res, next) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields and OTP are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const record = await OTP.findOne({ email: normalizedEmail, otp, type: "signup" });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdminUser = isEmailAdmin(normalizedEmail);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: isAdminUser ? "admin" : "user",
      cart: [],
      wishlist: [],
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`
    });

    await OTP.deleteMany({ email: normalizedEmail });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "Account verified and created successfully! Welcome to Crochet.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        cart: user.cart,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. DIRECT SIGN IN
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended by an administrator. Please contact support.",
      });
    }

    // Ensure authorized admin emails always have admin role
    if (isEmailAdmin(normalizedEmail) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Welcome back!",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || (isEmailAdmin(normalizedEmail) ? "admin" : "user"),
        phone: user.phone || "",
        avatar: user.avatar,
        bio: user.bio || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        cart: user.cart || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3.5 SOCIAL LOGIN (Google & Facebook)
const socialLogin = async (req, res, next) => {
  try {
    const { email, name, avatar, provider } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for social authentication." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user account with social data
      const randomPassword = Math.random().toString(36).slice(-10) + "Aa1!";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      const isAdminUser = isEmailAdmin(normalizedEmail);

      user = await User.create({
        name: name ? name.trim() : normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: hashedPassword,
        role: isAdminUser ? "admin" : "user",
        avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        cart: [],
        wishlist: [],
        isVerified: true,
      });
    } else {
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      if (isEmailAdmin(normalizedEmail) && user.role !== "admin") {
        user.role = "admin";
      }
      await user.save();
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended by an administrator. Please contact support.",
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: `Successfully authenticated with ${provider || "Social Login"}! Welcome to CozyLoops.`,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        cart: user.cart || [],
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. SYNC CART & WISHLIST TO DATABASE
const syncData = async (req, res, next) => {
  try {
    const { cart, wishlist } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (Array.isArray(cart)) user.cart = cart;
    if (Array.isArray(wishlist)) user.wishlist = wishlist;
    await user.save();

    res.json({
      message: "Synced with DB successfully",
      cart: user.cart,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// 5. GET CURRENT USER PROFILE
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// 6. UPDATE PROFILE
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, bio, address, city, state, pincode } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (state !== undefined) user.state = state.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();

    if (isEmailAdmin(user.email) && user.role !== "admin") {
      user.role = "admin";
    }

    await user.save();

    res.json({
      message: "Profile updated successfully! ✨",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        cart: user.cart || [],
        wishlist: user.wishlist || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 7. CHANGE PASSWORD
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully! 🔒" });
  } catch (error) {
    next(error);
  }
};

// 8. SEND FORGOT PASSWORD OTP
const sendForgotPasswordOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail, type: "forgot_password" });
    await OTP.create({ email: normalizedEmail, otp, type: "forgot_password" });

    const emailStatus = await sendOtpEmail(normalizedEmail, otp, "Password Reset");
    res.json({
      message: `Password reset code sent to ${normalizedEmail}`,
      previewOtp: !emailStatus.success ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// 9. VERIFY OTP & RESET PASSWORD
const resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields and OTP are required." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await OTP.findOne({ email: normalizedEmail, otp, type: "forgot_password" });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await OTP.deleteMany({ email: normalizedEmail, type: "forgot_password" });

    res.json({ message: "Password reset successfully! You can now log in with your new password. 🔒" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendSignupOTP,
  verifySignupOTP,
  signIn,
  socialLogin,
  syncData,
  getMe,
  updateProfile,
  changePassword,
  sendForgotPasswordOTP,
  resetPasswordWithOTP
};
