/* eslint-disable linebreak-style */
/* eslint-disable import/no-unresolved */
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_API_key,
  api_secret: process.env.cloud_API_secret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ComicMerchs',
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
  },
});
module.exports = {
  cloudinary, storage,
};
