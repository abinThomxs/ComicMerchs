/* eslint-disable no-console */
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');

let message = '';

const adminHomeRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    res.render('admin/adminHome');
  } else {
    res.redirect('/admin/login');
  }
};

const adminLoginRender = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    res.redirect('/admin/home');
  } else {
    res.render('admin/adminLogin', { message });
    message = '';
  }
};

const admin = 'admin@123';
const mypassword = '123';
const adminLoginPost = (req, res) => {
  if (req.body.email === admin && req.body.password === mypassword) {
    const { session } = req;
    session.userid = admin;
    session.accountType = 'admin';
    res.redirect('/admin/home');
  } else {
    message = 'Invalid email or password';
    res.render('admin/adminLogin', { message });
  }
};

const adminUsersRender = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const usersData = await Users.find();
    res.render('admin/adminUserslist', { users: usersData });
  } else {
    res.redirect('/admin/login');
  }
};

const blockUser = async (req, res) => {
  try {
    await Users.updateOne({ _id: req.params.id }, { $set: { isBlock: true } }).then(() => {
      res.redirect('/admin/users');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const unblockUser = async (req, res) => {
  try {
    await Users.updateOne({ _id: req.params.id }, { $set: { isBlock: false } }).then(() => {
      res.redirect('/admin/users');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  console.log('logout');
  res.redirect('/user/login');
};

const getAdminCategory = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    try {
      const categories = await Categories.find();
      res.render('admin/category', { categories });
    } catch (error) {
      console.log(error.message);
    }
  }
};

const getAddCategory = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    res.render('admin/addCategory');
  } else {
    res.redirect('/admin/login');
  }
};

const postAddCategory = async (req, res) => {
  try {
    console.log(req.body);
    const categories = new Categories({
      name: req.body.name,
      description: req.body.description,
    });
    const categoriesData = await categories.save();
    if (categoriesData) {
      res.redirect('/admin/adminCategory');
    } else {
      res.render('admin/addCategory');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getEditCategory = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const { id } = req.params;
    console.log(id);
    const categories = await Categories.findOne({ _id: id });
    res.render('admin/editCategory', { categoriesData: categories });
  } else {
    res.redirect('/admin/login');
  }
};

const postEditCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params.id);
    const categoriesData = await Categories.updateOne({ _id: id }, {
      name: req.body.name,
      description: req.body.description,
    });
    if (categoriesData) {
      res.redirect('/admin/adminCategory');
    } else {
      res.render('admin/editCategory');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Categories.deleteOne({ _id: id }).then(() => {
      res.redirect('/admin/adminCategory');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getAdminProducts = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const productsData = await Products.find();
    res.render('admin/products', { products: productsData });
  } else {
    res.redirect('/admin/login');
  }
};

const getAddProduct = async (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'admin') {
    const categories = await Categories.find();
    console.log(categories);
    res.render('admin/addProduct', { categories });
  } else {
    res.redirect('/admin/login');
  }
};

const postAddProduct = async (req, res) => {
  try {
    console.log(req.body);
    const products = new Products({
      productName: req.body.productName,
      productCategory: req.body.productCategory,
      stock: req.body.stock,
      cost: req.body.cost,
    });
    const productsData = await products.save();
    if (productsData) {
      res.redirect('/admin/products');
    } else {
      res.render('admin/addProduct');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Products.findOne({ _id: id }).then((product) => {
      if (product) {
        res.render('admin/editProduct', { productsData: product });
      } else {
        res.redirect('/admin/products');
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const postEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params.id);
    const productsData = await Products.updateOne({ _id: id }, {
      productName: req.body.productName,
      productCategory: req.body.productCategory,
      stock: req.body.stock,
      cost: req.body.cost,
      isFeatured: req.body.isFeatured,
      image: req.body.image,
    });
    if (productsData) {
      res.redirect('/admin/products');
    } else {
      res.render('admin/editProduct');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isFeatured = async (req, res) => {
  try {
    await Products.updateOne({ _id: req.params.id }, { $set: { isFeatured: true } }).then(() => {
      res.redirect('/admin/products');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const notFeatured = async (req, res) => {
  try {
    await Products.updateOne({ _id: req.params.id }, { $set: { isFeatured: false } }).then(() => {
      res.redirect('/admin/products');
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Products.deleteOne({ _id: id }).then(() => {
      res.redirect('/admin/products');
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminHomeRender,
  adminLoginRender,
  adminLoginPost,
  adminUsersRender,
  blockUser,
  unblockUser,
  getAdminCategory,
  getAddCategory,
  postAddCategory,
  getEditCategory,
  postEditCategory,
  getDeleteCategory,
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  isFeatured,
  notFeatured,
  getDeleteProduct,
  logout,
};
