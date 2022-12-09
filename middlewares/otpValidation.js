/* eslint-disable linebreak-style */
const nodemailer = require('nodemailer');

module.exports = {
  mailTransporter: nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.nodmailer_email,
      pass: process.env.nodmailer_pass,
    },
  }),

  OTP: `${Math.floor(1000 + Math.random() * 9000)}`,

};
