const express = require('express');

const session = require('../middlewares/session');

const router = express.Router();
const controller = require('../controllers/adminControl');

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
router.post('/addProduct', session.adminSession, controller.postAddProduct);
router.get('/editProduct/:id', session.adminSession, controller.getEditProduct);
router.post('/editProduct/:id', session.adminSession, controller.postEditProduct);
router.get('/deleteProduct/:id', session.adminSession, controller.getDeleteProduct);
router.get('/orders', session.adminSession, controller.getOrders);
router.post('/changeStatus', session.adminSession, controller.changeOrderStatus);
router.post('/orderCompleted', session.adminSession, controller.orderCompeleted);
router.post('/orderCancel', session.adminSession, controller.orderCancel);

module.exports = router;
