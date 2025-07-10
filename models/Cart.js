const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          type: String,
        },
        sizeLabel: {
          type: String,
        },
        price: {
          type: Number,
        },
        salePrice: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ userId: 1 });
CartSchema.index({ 'items.productId': 1 });

module.exports = mongoose.model("Cart", CartSchema);
