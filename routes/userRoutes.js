const express = require('express');

const session = require('../middlewares/session');

const router = express.Router();
const controller = require('../controllers/userControl');

router.get('/login', controller.loginRender);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);
router.get('/signup', controller.signupRender);
router.post('/signup', controller.signupPost);
router.get('/otp', controller.getOTP);
router.post('/otp', controller.postOTP);
router.get('/home', controller.userHomeRender);
router.get('/store', controller.getStore);
router.post('/store', controller.search);
router.get('/actionFigures', controller.getActionFigures);
router.get('/accessories', controller.getAccessories);
router.get('/clothes', controller.getClothes);
router.get('/productDetail/:id', controller.getProductDetail);
router.get('/addToCart/:id', session.userSession, controller.getAddToCart);
router.get('/cart', session.userSession, controller.getCart);
router.route('/otpValidation').get(controller.getOTP).post(controller.postOTP);
router.post('/cartQuantity', session.userSession, controller.cartQuantity);
router.post('/deleteProduct', session.userSession, controller.postDeleteProduct);
router.get('/checkout', session.userSession, controller.getCheckout);
router.get('/addAddress', session.userSession, controller.getaddAddress);
router.post('/addAddress', session.userSession, controller.postaddAddress);
router.get('/editAddress/:id', session.userSession, controller.getEditAddress);
router.post('/editAddress/:id', session.userSession, controller.postEditAddress);
router.get('/deleteAddress/:id', session.userSession, controller.getDeleteAddress);
router.post('/orderConfirmed', session.userSession, controller.confirmOrder);
router.post('/verifyPayment', session.userSession, controller.verifyPayment);
router.get('/paymentFail', session.userSession, controller.paymentFailure);
router.get('/orderSuccess', session.userSession, controller.orderSuccess);
router.get('/profile', session.userSession, controller.getProfile);
router.get('/changePassword', session.userSession, controller.getChangePassword);
router.post('/changePassword', session.userSession, controller.postChangePasswod);
router.get('/orders', session.userSession, controller.getOrders);

module.exports = router;
