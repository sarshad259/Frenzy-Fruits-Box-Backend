const express = require("express");
const router = express.Router();

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

// ✅ Get all orders (admin)
router.get("/get", getAllOrdersOfAllUsers);

// ✅ Get specific order by ID (admin)
router.get("/details/:id", getOrderDetailsForAdmin);

// ✅ Update order status (admin)
router.put("/update/:id", updateOrderStatus);

module.exports = router;
