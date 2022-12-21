/* eslint-disable no-console */
const moment = require('moment');
// const multer = require('multer');
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');
const Orders = require('../models/orders');

let message = '';

const adminHomeRender = async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const userCount = await Users.countDocuments({});
    const productCount = await Products.countDocuments({});
    const orderData = await Orders.find({ orderStatus: { $ne: 'Cancelled' } });
    const orderCount = await Orders.countDocuments({});
    const pendingOrder = await Orders.find({ orderStatus: 'Pending' }).count();
    const completed = await Orders.find({ orderStatus: 'Completed' }).count();
    const delivered = await Orders.find({ orderStatus: 'Delivered' }).count();
    const cancelled = await Orders.find({ orderStatus: 'Cancelled' }).count();
    const cod = await Orders.find({ paymentMethod: 'cod' }).count();
    const online = await Orders.find({ paymentMethod: 'online' }).count();
    // eslint-disable-next-line arrow-body-style
    const totalAmount = orderData.reduce((accumulator, object) => {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      return (accumulator += object.totalAmount);
    }, 0);
    res.render('admin/adminHome', {
      usercount: userCount,
      productcount: productCount,
      totalamount: totalAmount,
      ordercount: orderCount,
      pending: pendingOrder,
      completed,
      delivered,
      cancelled,
      cod,
      online,
    });
  } catch (error) {
    res.redirect('/500');
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

const admin = process.env.adminID;
const mypassword = process.env.adminPassword;
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

// const postAddProduct = async (req, res) => {
//   try {
//     console.log(req.body);
//     const products = new Products({
//       productName: req.body.productName,
//       description: req.body.description,
//       productCategory: req.body.productCategory,
//       stock: req.body.stock,
//       cost: req.body.cost,
//       soldCount: req.body.soldCount,
//       image: req.body.image,
//       discount: req.body.discount,
//     });
//     const productsData = await products.save();
//     if (productsData) {
//       res.redirect('/admin/products');
//     } else {
//       res.render('admin/addProduct');
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const postAddProduct = async (req, res) => {
  try {
    const products = new Products({
      productName: req.body.productName,
      description: req.body.description,
      productCategory: req.body.productCategory,
      stock: req.body.stock,
      cost: req.body.cost,
      soldCount: req.body.soldCount,
      discount: req.body.discount,
    });
    products.image = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    console.log(req.files);
    console.log('product after map', products);

    const productsData = await products.save();
    console.log(productsData);
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
      description: req.body.description,
      productCategory: req.body.productCategory,
      stock: req.body.stock,
      cost: req.body.cost,
      image: req.body.image,
      soldCount: req.body.soldCount,
      discount: req.body.discount,
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

const getOrders = (req, res) => {
  try {
    Orders.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userfields',
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'userAddress',
        },
      },
      {
        $unwind: '$userfields',
      },
    ]).then((result) => {
      console.log(result);
      res.render('admin/orders', { allData: result });
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const changeOrderStatus = (req, res) => {
  try {
    const { orderID, paymentStatus, orderStatus } = req.body;
    Orders.updateOne(
      { _id: orderID },
      {
        paymentStatus, orderStatus,
      },
    ).then(() => {
      res.send('success');
    }).catch(() => {
      res.redirect('/500');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const orderCompeleted = (req, res) => {
  try {
    const { orderID } = req.body;
    Orders.updateOne(
      { _id: orderID },
      { orderStatus: 'Completed' },
    ).then(() => {
      res.send('done');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const orderCancel = (req, res) => {
  try {
    const { orderID } = req.body;
    Orders.updateOne(
      { _id: orderID },
      { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' },
    ).then(() => {
      res.send('done');
    });
  } catch (error) {
    res.redirect('/500');
  }
};

const getSalesReport = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const endtoday = moment().endOf('day');
    const monthstart = moment().startOf('month');
    const monthend = moment().endOf('month');
    const yearstart = moment().startOf('year');
    const yearend = moment().endOf('year');
    const daliyReport = await Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today.toDate(),
            $lte: endtoday.toDate(),
          },
        },
      },
      {
        $lookup:
              {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
              },
      },

      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          finalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]);
    console.log(daliyReport);
    const monthReport = await Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: monthstart.toDate(),
            $lte: monthend.toDate(),
          },
        },
      },
      {
        $lookup:
              {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
              },
      },

      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          finalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]);
    const yearReport = await Orders.aggregate([
      {
        $match: {
          createdAt: {
            $gte: yearstart.toDate(),
            $lte: yearend.toDate(),
          },
        },
      },
      {
        $lookup:
              {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
              },
      },
      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          totalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]);
    res.render('admin/salesReport', { today: daliyReport, month: monthReport, year: yearReport });
  } catch (error) {
    res.redirect('/500');
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
  getDeleteProduct,
  getOrders,
  changeOrderStatus,
  orderCompeleted,
  orderCancel,
  getSalesReport,
  logout,
};
