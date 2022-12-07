/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');
const Carts = require('../models/carts');

let message = '';

const loginRender = (req, res) => {
  res.render('user/login', { message });
  message = '';
};

const loginPost = async (req, res) => {
  try {
    await Users.findOne({ email: req.body.email })
      .then((result) => {
        if (result) {
          if (result.isBlock === false) {
            console.log(result.isBlock);
            if (result.password === req.body.password) {
              console.log(result.password);
              const { session } = req;
              session.accountType = 'user';
              console.log(result._id);
              session.userid = result._id;
              res.redirect('/user/home');
            } else {
              message = 'wrong password';
              res.render('user/login', { message });
            }
          } else {
            message = 'You are blocked';
            res.render('user/login', { message });
          }
        } else {
          message = 'Register to continue';
          res.render('user/login', { message });
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

const userHomeRender = async (req, res) => {
  const { session } = req;
  let count = 0;
  const categories = await Categories.find();
  const products = await Products.find();
  if (session.userid && session.accountType === 'user') {
    console.log(session.userid);
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    console.log(count);
    console.log(session.userid);
    const customer = true;
    res.render('user/userHome', { customer, categories, products, count });
  } else {
    const customer = false;
    res.render('user/userHome', { customer, categories, products, count });
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  console.log('logout');
  res.redirect('/');
};

const signupRender = (req, res) => {
  res.render('user/signup', { message });
  message = '';
};

const signupPost = (req, res) => {
  const { firstName } = req.body;
  const { lastName } = req.body;
  const { gender } = req.body;
  const { email } = req.body;
  const { phone } = req.body;
  const { password } = req.body;
  const { confirmPassword } = req.body;
  Users.findOne({ email }).then((result) => {
    if (result) {
      message = 'Email is already registered';
      res.redirect('/user/signup');
    } else if (password === confirmPassword) {
      const user = new Users({
        firstName,
        lastName,
        gender,
        email,
        phone,
        password,
        accountType: 'user',
      });
      user.save().then((results) => {
        console.log(results);
        message = 'Successfully Registered';
        res.render('user/successful');
        message = '';
      });
    } else {
      message = 'passwords do not match ';
      res.redirect('/user/signup');
    }
  });
};

const getProductDetail = async (req, res) => {
  try {
    const { session } = req;
    const { id } = req.params;
    let count = 0;
    const userData = await Users.findOne({ _id: session.userid });
    const products = await Products.findOne({ _id: id });
    const cart = await Carts.find({ userId: userData._id });
    if (session.userid && session.accountType === 'user') {
      console.log(session.userid);
      const customer = true;
      if (cart.length) {
        count = cart[0].product.length;
      } else {
        count = 0;
      }
      res.render('user/productDetail', { customer, products, count, session });
    } else {
      const customer = false;
      res.render('user/productDetail', { customer, products, count, session });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getCart = async (req, res) => {
  const { session } = req;
  const userData = mongoose.Types.ObjectId(session.userid);
  const customer = true;
  const cart = await Carts.aggregate([
    {
      $match: { userId: userData },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        productItem: '$product.productId',
        productQuantity: '$product.quantity',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productItem',
        foreignField: '_id',
        as: 'productDetail',
      },
    },
    {
      $project: {
        productItem: 1,
        productQuantity: 1,
        productDetail: { $arrayElemAt: ['$productDetail', 0] },
      },
    },
    {
      $addFields: {
        productPrice: {
          $sum: { $multiply: ['$productQuantity', '$productDetail.cost'] },
        },
      },
    },
  ]);

  const sum = cart.reduce((accumulator, object) => accumulator + object.productPrice, 0);
  const count = cart.length;
  console.log(count);
  res.render('user/cart', { session, customer, cart, count, sum });
};

const getAddToCart = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userid;
  const products = await Products.findOne({ _id: id });
  const userData = await Users.findOne({ _id: userId });
  const objId = mongoose.Types.ObjectId(id);
  console.log(userData);

  // const idUser = mongoose.Types.ObjectId(userData._id);
  const proObj = {
    productId: objId,
    quantity: 1,
  };
  if (products.stock >= 1) {
    const userCart = await Carts.findOne({ userId: userData._id });
    if (userCart) {
      const proExist = userCart.product.findIndex((product) => product.productId == id);
      console.log(proExist);
      if (proExist !== -1) {
        await Carts.aggregate([
          {
            $unwind: '$product',
          },
        ]);
        await Carts.updateOne(
          { userId: userData._id, 'product.productId': objId },
          { $inc: { 'product.$.quantity': 1 } },
        );
        res.json({ productExist: true });
      } else {
        Carts
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            res.json({ status: true });
          });
      }
    } else {
      const newCart = new Carts({
        userId: userData._id,
        product: [
          {
            productId: objId,
            quantity: 1,
          },
        ],
      });
      newCart.save().then(() => {
        res.json({ status: true });
      });
    }
  } else {
    res.json({ stock: true });
  }
};

module.exports = {
  loginRender,
  loginPost,
  logout,
  userHomeRender,
  signupPost,
  signupRender,
  getProductDetail,
  getCart,
  getAddToCart,
};
