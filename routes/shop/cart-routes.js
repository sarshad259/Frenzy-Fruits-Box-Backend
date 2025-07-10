const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  clearCart,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update-cart", updateCartItemQty);
router.delete("/delete/:userId/:productId", deleteCartItem);
router.delete("/clear/:userId", clearCart);

// Test route for debugging
router.get("/test", (req, res) => {
  res.json({ message: "Cart routes working" });
});

module.exports = router;
