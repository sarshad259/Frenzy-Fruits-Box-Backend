const Order = require("../../models/Order");

// ✅ Get all orders of all users (admin view)
const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).lean();
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error("❌ Error fetching orders:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while fetching orders.",
    });
  }
};

// ✅ Get single order details (admin)
const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error("❌ Error getting order details:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred while getting order details.",
    });
  }
};

// ✅ Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (e) {
    console.error("❌ Error updating order status:", e);
    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};