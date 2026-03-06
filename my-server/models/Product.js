const mongoose = require('mongoose');

// Product schema for the MongoDB collection
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, default: 0, min: 0 }, // stock quantity
    category: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Product', productSchema);
