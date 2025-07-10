const Order = require("../../models/Order");
const Product = require("../../models/Product");

// ✅ Create a new order and automatically decrement stock
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
    } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // ✅ Check stock availability
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (product.totalStock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}` });
      }
    }

    // ✅ Save the order
    const newOrder = new Order({
      userId, cartItems, addressInfo, totalAmount,
      orderStatus, paymentMethod, paymentStatus,
      orderDate, orderUpdateDate, paymentId, payerId,
    });
    await newOrder.save();

    // ✅ Atomically decrement the stock
    for (const item of cartItems) {
      const result = await Product.updateOne(
        { _id: item.productId, totalStock: { $gte: item.quantity } },
        { $inc: { totalStock: -item.quantity } }
      );
      if (!result.modifiedCount) {
        console.error(`❌ Stock not updated for ${item.productId}`);
      }
    }

    return res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get orders by user
const getAllOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).lean();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Fetch orders failed" });
  }
};

// ✅ Get order details
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Fetch order failed" });
  }
};

// ✅ Stub for payment capture
const capturePayment = async (req, res) => {
  return res.status(200).json({ success: true, message: "Payment captured" });
};

module.exports = {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
};
