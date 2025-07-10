const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    address: String,
    city: String,
    phone: String,
    notes: String,
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1 });

module.exports = mongoose.model("Address", AddressSchema);
