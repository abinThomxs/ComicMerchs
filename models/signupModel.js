const mongoose = require('mongoose');

const { Schema } = mongoose;

const signupSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    default: 'user',
  },
  isBlock: {
    type: Boolean,
    default: true,
  },
});
const Users = mongoose.model('User', signupSchema);
module.exports = Users;
