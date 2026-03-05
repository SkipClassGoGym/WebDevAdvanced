const mongoose = require('mongoose');

const FashionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    details: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    style: {
      type: String,
      required: true,
      enum: ['Streetwear', 'Minimalist', 'Vintage'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'Fashion',
  }
);

module.exports = mongoose.model('Fashion', FashionSchema);