const express = require('express');

const router = express.Router();
const controller = require('../controllers/adminControl');

router.route('/login').get(controller.adminLoginRender).post(controller.adminLoginPost);
router.get('/logout', controller.logout);
router.get('/home', controller.adminHomeRender);
router.get('/users', controller.adminUsersRender);
router.get('/blockuser/:id', controller.blockUser);
router.get('/unblockuser/:id', controller.unblockUser);
router.get('/adminCategory', controller.getAdminCategory);
router.route('/addCategory').get(controller.getAddCategory).post(controller.postAddCategory);
router.get('/deleteCategory/:id', controller.getDeleteCategory);
router.route('/editCategory/:id').get(controller.getEditCategory).post(controller.postEditCategory);
router.get('/products', controller.getAdminProducts);
router.route('/addProduct').get(controller.getAddProduct).post(controller.postAddProduct);
router.route('/editProduct/:id').get(controller.getEditProduct).post(controller.postEditProduct);
router.get('/isFeatured/:id', controller.isFeatured);
router.get('/notFeatured/:id', controller.notFeatured);
router.get('/deleteProduct/:id', controller.getDeleteProduct);

module.exports = router;
