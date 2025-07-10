const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    smallPrice: Number,
    mediumPrice: Number,
    largePrice: Number,
    smallSalePrice: Number,
    mediumSalePrice: Number,
    largeSalePrice: Number,
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ title: 1 });
ProductSchema.index({ title: 'text', description: 'text', category: 'text', brand: 'text' });

module.exports = mongoose.model("Product", ProductSchema);
