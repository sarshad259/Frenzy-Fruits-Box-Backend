const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// ✅ Add to Cart
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, sizeLabel, price, salePrice } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const castedUserId = new mongoose.Types.ObjectId(userId);

    let cart = await Cart.findOne({ userId: castedUserId });

    if (!cart) {
      cart = new Cart({
        userId: castedUserId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && ((item.size || null) === (size || null))
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        ...(size !== undefined && { size }),
        ...(sizeLabel !== undefined && { sizeLabel }),
        ...(price !== undefined && { price }),
        ...(salePrice !== undefined && { salePrice }),
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      data: {
        productId,
        quantity,
        size,
        sizeLabel,
        price,
        salePrice,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Fetch Cart Items
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const castedUserId = new mongoose.Types.ObjectId(userId);

    const cart = await Cart.findOne({ userId: castedUserId })
      .populate({
        path: "items.productId",
        select: "image title price salePrice",
      })
      .lean();

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Cart is empty",
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.price !== undefined ? item.price : item.productId.price,
      salePrice: item.salePrice !== undefined ? item.salePrice : item.productId.salePrice,
      quantity: item.quantity,
      ...(item.size && { size: item.size }),
      ...(item.sizeLabel && { sizeLabel: item.sizeLabel }),
    }));

    res.status(200).json({
      success: true,
      data: populateCartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// ✅ Update Cart Item Quantity
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const castedUserId = new mongoose.Types.ObjectId(userId);

    const cart = await Cart.findOne({ userId: castedUserId });
    if (!cart || !Array.isArray(cart.items)) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && ((item.size || null) === (size || null))
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    const updatedItem = cart.items[findCurrentProductIndex];

    res.status(200).json({
      success: true,
      data: {
        productId: updatedItem.productId,
        quantity: updatedItem.quantity,
        size: updatedItem.size || null,
        sizeLabel: updatedItem.sizeLabel || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// ✅ Delete Cart Item
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    let { size } = req.query;
    // Normalize size: treat undefined, null, empty string as no size
    if (typeof size !== 'string' || size === 'undefined' || size.trim() === '') size = undefined;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const castedUserId = new mongoose.Types.ObjectId(userId);

    let cart = await Cart.findOne({ userId: castedUserId })
      .populate({
        path: "items.productId",
        select: "image title price salePrice",
      });
    if (!cart) {
      cart = await Cart.findOne({ userId: userId })
        .populate({
          path: "items.productId",
          select: "image title price salePrice",
        });
    }

    if (!cart || !Array.isArray(cart.items)) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const beforeLength = cart.items.length;
    cart.items = cart.items.filter((item) => {
      // Use _id if populated, otherwise use as is
      const itemProductId = (item.productId && item.productId._id)
        ? item.productId._id.toString()
        : item.productId.toString();
      // Normalize item size
      const itemSize = (typeof item.size === 'string' && item.size.trim() !== '') ? item.size : undefined;
      const match = (itemProductId === productId && itemSize === size);
      return !match;
    });

    if (cart.items.length === beforeLength) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found!",
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart.items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

// ✅ Clear Cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const castedUserId = new mongoose.Types.ObjectId(userId);

    let cart = await Cart.findOne({ userId: castedUserId });

    if (!cart) {
      cart = new Cart({
        userId: castedUserId,
        items: [],
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
};
