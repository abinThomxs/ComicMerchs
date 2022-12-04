/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const products = new Schema({
  productName: {
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
  isFeatured: {
    type: Boolean,
    default: false,
  },
  soldCount: {
    type: Number,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },

});
const Products = mongoose.model('Product', products);
module.exports = Products;
