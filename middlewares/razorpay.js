/* eslint-disable linebreak-style */
/* eslint-disable indent */
const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: process.env.razorpay_id,
    key_secret: process.env.razorpay_secret,
});

module.exports = instance;
