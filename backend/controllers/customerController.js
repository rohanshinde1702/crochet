const User = require("../models/User");
const Order = require("../models/Order");

// @desc    Get all customers with aggregated spending, orders count, and membership status
// @route   GET /api/customers
// @access  Admin
const getCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
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
      if (totalSpent >= 4000 || totalOrders >= 4) {
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

module.exports = {
  getCustomers,
  getCustomerById
};
