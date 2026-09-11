const User = require("../models/User");
const Order = require("../models/Order");

// @desc    Get all customers with aggregated spending, orders count, and membership status
// @route   GET /api/customers
// @access  Admin
const getCustomers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const orders = await Order.find({ isDeleted: false });

    const customersWithStats = users.map((user) => {
      const userOrders = orders.filter(
        (o) =>
          (o.user && String(o.user) === String(user._id)) ||
          (o.customer?.email && o.customer.email.toLowerCase() === user.email.toLowerCase())
      );

      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      let status = "New";
      if (user.isBlocked) {
        status = "Blocked";
      } else if (totalSpent >= 4000 || totalOrders >= 4) {
        status = "VIP";
      } else if (totalOrders >= 2) {
        status = "Regular";
      }

      return {
        _id: user._id,
        id: `CUST-${String(user._id).slice(-4).toUpperCase()}`,
        name: user.name,
        email: user.email,
        phone: user.phone || "+91 98200 00000",
        avatar: user.avatar,
        role: user.role || "user",
        isBlocked: Boolean(user.isBlocked),
        blockReason: user.blockReason || "",
        orders: totalOrders,
        spent: totalSpent,
        status,
        joined: new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        createdAt: user.createdAt
      };
    });

    res.json(customersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer profile with orders
// @route   GET /api/customers/:id
// @access  Admin
const getCustomerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Customer not found" });

    const userOrders = await Order.find({
      $or: [{ user: user._id }, { "customer.email": user.email }],
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({
      customer: user,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle block/unblock customer
// @route   PUT /api/customers/:id/block
// @access  Admin
const toggleBlockCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Customer not found" });

    if (user.email === "admin@cozyloops.com") {
      return res.status(400).json({ message: "Cannot block the primary Master Admin account." });
    }

    const { blockReason } = req.body || {};
    user.isBlocked = !user.isBlocked;
    if (user.isBlocked && blockReason) {
      user.blockReason = blockReason.trim();
    } else if (!user.isBlocked) {
      user.blockReason = "";
    }

    await user.save();

    res.json({
      message: user.isBlocked
        ? `Customer "${user.name}" has been blocked. 🚫`
        : `Customer "${user.name}" has been unblocked. ✅`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        role: user.role,
        blockReason: user.blockReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer role (Make Admin / Revoke Admin)
// @route   PUT /api/customers/:id/role
// @access  Admin
const updateCustomerRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Customer not found" });

    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Valid role ('user' or 'admin') is required." });
    }

    if (user.email === "admin@cozyloops.com" && role !== "admin") {
      return res.status(400).json({ message: "Cannot revoke admin privileges from the primary Master Admin." });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `Updated role for "${user.name}" to ${role === "admin" ? "Admin 👑" : "Customer 👤"}!`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently delete a customer
// @route   DELETE /api/customers/:id
// @access  Admin
const deleteCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Customer not found" });

    if (user.email === "admin@cozyloops.com") {
      return res.status(400).json({ message: "Cannot delete the primary Master Admin account." });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: `Customer account "${user.name}" (${user.email}) permanently removed. 🗑️`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  toggleBlockCustomer,
  updateCustomerRole,
  deleteCustomer
};
