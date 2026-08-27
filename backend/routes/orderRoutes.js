const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  softDeleteOrder,
  getRecycleBinOrders,
  restoreOrder,
  permanentlyDeleteOrder
} = require("../controllers/orderController");

// Specific routes first
router.get("/recycle-bin", getRecycleBinOrders);
router.put("/:id/restore", restoreOrder);
router.delete("/:id/permanent", permanentlyDeleteOrder);
router.put("/:id/status", updateOrderStatus);

// General routes
router.get("/", getOrders);
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.delete("/:id", softDeleteOrder);

module.exports = router;
