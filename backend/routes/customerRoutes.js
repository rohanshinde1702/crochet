const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  toggleBlockCustomer,
  updateCustomerRole,
  deleteCustomer
} = require("../controllers/customerController");

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id/block", toggleBlockCustomer);
router.put("/:id/role", updateCustomerRole);
router.delete("/:id", deleteCustomer);

module.exports = router;
