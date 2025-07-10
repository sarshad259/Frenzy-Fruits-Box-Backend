const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    productId: String,
    userId: String,
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true }
);

ProductReviewSchema.index({ productId: 1 });
ProductReviewSchema.index({ userId: 1 });

module.exports = mongoose.model("ProductReview", ProductReviewSchema);
