const express = require('express');

const router = express.Router();
const controller = require('../controllers/userControl');

router.get('/login', controller.loginRender);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);
router.get('/signup', controller.signupRender);
router.post('/signup', controller.signupPost);
router.get('/home', controller.userHomeRender);
router.get('/productDetail/:id', controller.getProductDetail);
router.get('/addToCart/:id', controller.getAddToCart);
router.get('/cart', controller.getCart);
router.route('/otpValidation').get(controller.getOTP).post(controller.postOTP);
router.post('/cartQuantity', controller.cartQuantity);
router.post('/deleteProduct', controller.postDeleteProduct);

module.exports = router;
