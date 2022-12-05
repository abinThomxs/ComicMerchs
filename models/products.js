/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const products = new Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  productCategory: {
    type: String,
    ref: 'categories',
    required: true,
  },
  stock: {
    type: Number,
    min: 0,
    max: 250,
    required: true,
  },
  cost: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  soldCount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },

});
const Products = mongoose.model('Product', products);
module.exports = Products;
