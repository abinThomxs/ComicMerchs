/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');
const Carts = require('../models/carts');
const Otp = require('../models/otp');
const mailer = require('../middlewares/otpValidation');

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

// const signupPost = (req, res) => {
//   const { email } = req.body;
//   body = new Users({ ...req.body });
//   console.log(body);
//   if (req.body.password === req.body.confirm_password) {
//     Users.findOne({ email }).then((result) => {
//       if (result) {
//         message = 'Email is already registered';
//         res.redirect('/user/signup');
//       } else {
//         const mailDetails = {
//           from: process.env.nodmailer_email,
//           to: body.email,
//           subject: 'ComicMerchs OTP validation',
//           html: `<p>Your OTP for ComicMerchs signup is ${mailer.OTP}</p>`,
//         };
//         mailer.mailTransporter.sendMail(mailDetails, (err) => {
//           if (err) {
//             console.log(err);
//           } else {
//             console.log('Email sent successfully');
//             res.redirect('/user/otpValidation');
//           }
//         });
//       }
//     });
//   } else {
//     message = 'passwords do not match ';
//     res.redirect('/user/signup');
//   }
// };

const signupPost = async (req, res) => {
  console.log('entered');

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const gender = req.body.gender;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const accountType = req.body.accountType;

  const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;

  const mailDetails = {
    from: process.env.nodmailer_email,
    to: email,
    Subject: 'ComicMerchs OTP validation',
    html: `<p>Your OTP for ComicMerchs signup is  ${OTP}</p>`,
  };

  const User = await Users.findOne({ email });
  // console.log(User);
  if (User) {
    res.render('user/signup', { message: 'User Already Exist' });
  } else {
    const user = await Users.create({
      firstName,
      lastName,
      gender,
      email,
      phone,
      password,
      accountType,
    });
    mailer.sendMail(mailDetails, async (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const otpActive = await Otp.create({
          userId: user.id,
          otp: OTP,
        });
        res.redirect(`/otp?email=${user.email}`);
      }
    });
  }
};

const getOTP = async (req, res) => {
  const { email } = req.query;
  const user = await Users.findOne({ Email: email });
  res.render('user/otp', { user });
};

const postOTP = async (req, res) => {
  const body = req.body;
  console.log(body);
  const verify = await Otp.findOne({
    userId: body.userId,
  });
  if (body.otp == verify.otp) {
    const user = await Users.findByIdAndUpdate({ _id: body.userId }, { isActive: true });
    res.redirect('/userLogin');
  } else {
    res.redirect(`/otp?email=${user.email}`);
  }
};

//     if (password === confirmPassword) {
//       user = new Users({
//         firstName,
//         lastName,
//         gender,
//         email,
//         phone,
//         password,
//         accountType: 'user',
//       });
//       user.save().then((results) => {
//         console.log(results);
//         message = 'Successfully Registered';
//         res.render('user/successful');
//         message = '';
//       });
//     } else {
//       message = 'passwords do not match ';
//       res.redirect('/user/signup');
//     }
//   });
// };
let count = 0;
const getProductDetail = async (req, res) => {
  try {
    const { session } = req;
    const { id } = req.params;

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
  count = cart.length;
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
        res.redirect(`/user/productDetail/${id}`);
      } else {
        Carts
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            res.redirect(`/user/productDetail/${id}`);
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

const cartQuantity = async (req, res, next) => {
  const data = req.body;
  data.count = Number(data.count);
  data.quantity = Number(data.quantity);
  const objId = mongoose.Types.ObjectId(data.product);
  const productDetail = await Products.findOne({ _id: data.product });
  if (
    (data.count == -1 && data.quantity == 1)
    || (data.count == 1 && data.quantity == productDetail.stock)
  ) {
    res.json({ quantity: true });
  } else {
    await Carts
      .aggregate([
        {
          $unwind: '$product',
        },
      ])
      .then(() => {
        Carts
          .updateOne(
            { _id: data.cart, 'product.productId': objId },
            { $inc: { 'product.$.quantity': data.count } },
          )
          .then(() => {
            res.json({ status: true });
            next();
          });
      });
  }
};

const postDeleteProduct = (req, res) => {
  const cartid = req.body.cart;
  const pid = req.body.product;
  Carts.updateOne(
    { _id: cartid },
    { $pull: { product: { productId: pid } } },
  ).then(() => {
    // console.log(cart);
    res.redirect('/user/cart');
  }).catch((error) => {
    console.log(error);
  });
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
  getOTP,
  postOTP,
  cartQuantity,
  postDeleteProduct,
};
