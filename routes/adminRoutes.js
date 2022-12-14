const express = require('express');
const multer = require('multer');
const session = require('../middlewares/session');

const router = express.Router();
const controller = require('../controllers/adminControl');

const { storage } = require('../middlewares/cloudinary');

const upload = multer({ storage });

router.route('/login').get(controller.adminLoginRender).post(controller.adminLoginPost);
router.get('/logout', controller.logout);
router.get('/home', session.adminSession, controller.adminHomeRender);

router.get('/users', session.adminSession, controller.adminUsersRender);
router.get('/blockuser/:id', session.adminSession, controller.blockUser);
router.get('/unblockuser/:id', session.adminSession, controller.unblockUser);

router.get('/adminCategory', session.adminSession, controller.getAdminCategory);
router.get('/addCategory', session.adminSession, controller.getAddCategory);
router.post('/addCategory', session.adminSession, controller.postAddCategory);
router.get('/deleteCategory/:id', controller.getDeleteCategory);
router.get('/editCategory/:id', session.adminSession, controller.getEditCategory);
router.post('/editCategory/:id', session.adminSession, controller.postEditCategory);

router.get('/products', session.adminSession, controller.getAdminProducts);
router.get('/addProduct', session.adminSession, controller.getAddProduct);
router.post('/addProduct', upload.array('image', 4), session.adminSession, controller.postAddProduct);
router.get('/editProduct/:id', session.adminSession, controller.getEditProduct);
router.post('/editProduct/:id', upload.array('image', 4), session.adminSession, controller.postEditProduct);
router.get('/deleteProduct/:id', session.adminSession, controller.getDeleteProduct);

router.get('/banner', session.adminSession, controller.getBanner);
router.get('/addBanner', session.adminSession, controller.getAddBanner);
router.post('/addBanner', upload.array('image', 1), session.adminSession, controller.postAddBanner);
router.get('/deleteBanner/:id', session.adminSession, controller.getDeleteBanner);

router.get('/coupon', session.adminSession, controller.getCoupon);
router.get('/addCoupon', session.adminSession, controller.getAddCoupon);
router.post('/addCoupon', session.adminSession, controller.postAddCoupon);
router.get('/deleteCoupon/:id', session.adminSession, controller.getDeleteCoupon);

router.get('/orders', session.adminSession, controller.getOrders);
router.post('/changeStatus', session.adminSession, controller.changeOrderStatus);
router.post('/orderCompleted', session.adminSession, controller.orderCompeleted);
router.post('/orderCancel', session.adminSession, controller.orderCancel);

router.get('/salesReport', session.adminSession, controller.getSalesReport);

module.exports = router;
