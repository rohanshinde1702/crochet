const Order = require("../models/Order");

// @desc    Get all active orders
// @route   GET /api/orders
// @access  Public / Admin
const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = { isDeleted: false };

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { orderId: regex },
        { "customer.name": regex },
        { "customer.email": regex },
        { "items.title": regex }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by orderId or Mongo ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const param = req.params.id;
    let order = null;

    if (param.startsWith("ORD-")) {
      order = await Order.findOne({ orderId: param, isDeleted: false });
    } else {
      order = await Order.findOne({ _id: param, isDeleted: false });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order (from cart checkout)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customer, shippingAddress, items, totalAmount, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Generate unique Order ID e.g. ORD-9825
    const count = await Order.countDocuments();
    const orderId = `ORD-${9822 + count}`;

    const subtotal = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    const newOrder = new Order({
      orderId,
      customer: {
        name: customer?.name || "Guest Customer",
        email: customer?.email || "guest@cozyloops.com",
        phone: customer?.phone || ""
      },
      shippingAddress: shippingAddress || {
        street: "124 Marine Drive",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400020",
        country: "India"
      },
      items,
      subtotal,
      shippingFee: subtotal > 999 ? 0 : 99,
      totalAmount: totalAmount || (subtotal > 999 ? subtotal : subtotal + 99),
      paymentMethod: paymentMethod || "UPI",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      status: "Processing",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      notes: notes || ""
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const param = req.params.id;

    let order = null;
    if (param.startsWith("ORD-")) {
      order = await Order.findOne({ orderId: param });
    } else {
      order = await Order.findById(param);
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete order
// @route   DELETE /api/orders/:id
// @access  Admin
const softDeleteOrder = async (req, res) => {
  try {
    const param = req.params.id;
    let order = null;
    if (param.startsWith("ORD-")) {
      order = await Order.findOne({ orderId: param });
    } else {
      order = await Order.findById(param);
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();

    res.json({ message: "Order moved to Recycle Bin", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deleted orders (Recycle Bin)
// @route   GET /api/orders/recycle-bin
// @access  Admin
const getRecycleBinOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore soft deleted order
// @route   PUT /api/orders/:id/restore
// @access  Admin
const restoreOrder = async (req, res) => {
  try {
    const param = req.params.id;
    let order = null;
    if (param.startsWith("ORD-")) {
      order = await Order.findOne({ orderId: param, isDeleted: true });
    } else {
      order = await Order.findOne({ _id: param, isDeleted: true });
    }

    if (!order) return res.status(404).json({ message: "Deleted order not found" });

    order.isDeleted = false;
    order.deletedAt = null;
    await order.save();

    res.json({ message: "Order restored successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Permanently delete order
// @route   DELETE /api/orders/:id/permanent
// @access  Admin
const permanentlyDeleteOrder = async (req, res) => {
  try {
    const param = req.params.id;
    let order = null;
    if (param.startsWith("ORD-")) {
      order = await Order.findOneAndDelete({ orderId: param });
    } else {
      order = await Order.findByIdAndDelete(param);
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order permanently removed from database" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  softDeleteOrder,
  getRecycleBinOrders,
  restoreOrder,
  permanentlyDeleteOrder
};
