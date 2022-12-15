/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');
const Carts = require('../models/carts');
const Address = require('../models/address');
const Orders = require('../models/orders');
const Otp = require('../models/otp');
const mailer = require('../middlewares/otpValidation');
const instance = require('../middlewares/razorpay');

let message = '';

const loginRender = (req, res) => {
  const session = req.session;
  if (session.userid) {
    res.redirect('/user/home');
  }
  res.render('user/login', { message });
  message = '';
};

const loginPost = async (req, res) => {
  try {
    await Users.findOne({ email: req.body.email })
      .then((result) => {
        if (result) {
          if (result.isBlock === false) {
            if (result.password === req.body.password) {
              const { session } = req;
              session.accountType = 'user';
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
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
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

const getProductDetail = async (req, res) => {
  try {
    const { session } = req;
    const { id } = req.params;
    let count = 0;
    const userData = await Users.findOne({ _id: session.userid });
    const products = await Products.findOne({ _id: id });
    const cart = await Carts.find({ userId: userData._id });
    if (session.userid && session.accountType === 'user') {
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
  res.render('user/cart', { session, customer, cart, count, sum });
};

const getAddToCart = async (req, res) => {
  const id = req.params.id;
  const userId = req.session.userid;
  const products = await Products.findOne({ _id: id });
  const userData = await Users.findOne({ _id: userId });
  const objId = mongoose.Types.ObjectId(id);

  // const idUser = mongoose.Types.ObjectId(userData._id);
  const proObj = {
    productId: objId,
    quantity: 1,
  };
  if (products.stock >= 1) {
    const userCart = await Carts.findOne({ userId: userData._id });
    if (userCart) {
      const proExist = userCart.product.findIndex((product) => product.productId == id);
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
        // res.json({ status: true });
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

const getCheckout = async (req, res) => {
  const { session } = req;
  const uid = mongoose.Types.ObjectId(session.userid);
  const customer = true;
  const cart = await Carts.aggregate([
    {
      $match: { userId: uid },
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
  Address.find({ user_id: uid }).then((address) => {
    res.render('user/checkout', {
      allData: cart, count, sum, name: req.session.firstName, address, customer,
    });
  }).catch((e) => {
    console.log(e);
  });
};

const getaddAddress = (req, res) => {
  const { session } = req;
  if (session.userid && session.accountType === 'user') {
    res.render('user/addAddress');
  } else {
    res.redirect('/user/login');
  }
};

const postaddAddress = async (req, res) => {
  const uid = req.session.userid;
  // const { addressDetail } = Address;
  const addressDetails = await new Address({
    // eslint-disable-next-line no-underscore-dangle
    user_id: uid,
    address: req.body.address,
    city: req.body.city,
    district: req.body.district,
    state: req.body.state,
    pincode: req.body.pincode,
  });
  await addressDetails.save().then((results) => {
    if (results) {
      res.redirect('/user/checkout');
    } else {
      res.json({ status: false });
    }
  });
};

const confirmOrder = (req, res) => {
  const uid = mongoose.Types.ObjectId(req.session.userid);
  const paymethod = req.body.pay;
  const adrs = req.body.address;
  // const { Order } = Orders;
  // eslint-disable-next-line no-unused-vars
  Users.findOne({ user_id: uid }).then((userData) => {
    Carts.aggregate([
      {
        $match: { userId: uid },
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
    ])
      .then((result) => {
        console.log('required', result);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < result.length; i++) {
          const sold = result[i].productDetail.soldCount + result[i].productQuantity;
          console.log('total sold =', sold);
          Products.updateMany(
            // eslint-disable-next-line no-underscore-dangle
            { _id: result[i].productDetail._id },
            { soldCount: sold },
          ).then(() => {
          }).catch((err) => {
            console.log(err);
          });
        }
        // const count = result.length;
        const sum = result
          .reduce((accumulator, object) => accumulator + object.productPrice, 0);
        Carts.findOne({ userId: uid }).then((cartData) => {
          const order = new Orders({
            order_id: Date.now(),
            user_id: uid,
            // eslint-disable-next-line no-underscore-dangle
            address: adrs,
            order_placed_on: moment().format('DD-MM-YYYY'),
            products: cartData.product,
            totalAmount: sum,
            finalAmount: Math.round(sum + (sum * 0.15) + 100),
            paymentMethod: paymethod,
            expectedDelivery: moment().add(4, 'days').format('MMM Do YY'),
          });
          // eslint-disable-next-line no-unused-vars
          order.save().then((done) => {
            // eslint-disable-next-line semi, no-underscore-dangle
            const oid = done._id;
            Carts.deleteOne({ user_id: uid }).then(() => {
              if (paymethod === 'cod') {
                console.log('payment is cod');
                res.json([{ success: true, oid }]);
              } else if (paymethod === 'online') {
                console.log('payment is online');
                // const amount = done.totalAmount * 100;
                const amount = done.finalAmount * 100;
                const options = {
                  amount,
                  // amountFinal,
                  currency: 'INR',
                  receipt: `${oid}`,
                };
                instance.orders.create(options, (err, orders) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json([{ success: false, orders }]);
                    // console.log(orders);
                  }
                });
              }
            });
          });
        });
      });
  });
};

const orderSuccess = (req, res) => {
  const customer = true;
  console.log(req.params);
  const oid = mongoose.Types.ObjectId(req.params.oid);
  Orders.aggregate([
    { $match: { _id: oid } },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'address',
        foreignField: '_id',
        as: 'address',
      },
    },
  ]).then((result) => {
    console.log(result);
    res.render('user/orderSuccess', {
      // id: result[0].order_id,
      // amountFinal: result[0].finalAmount,
      // amount: result[0].totalAmount,
      // deladd: result[0].address[0],
      // count: result[0].products.length,
      // name: result[0].user.firstName,
      customer,
    });
  });
};

const verifyPayment = (req, res) => {
  console.log('reached verify paymet');
  const details = req.body;
  let hmac = crypto.createHmac('sha256', '0jLCJMFP9SLEOQ1prF1JlnOE');
  hmac.update(
    // eslint-disable-next-line operator-linebreak, prefer-template
    details.payment.razorpay_order_id +
    // eslint-disable-next-line operator-linebreak
    '|' +
    // eslint-disable-next-line comma-dangle
    details.payment.razorpay_payment_id
  );
  hmac = hmac.digest('hex');
  // eslint-disable-next-line eqeqeq
  console.log(details.payment.razorpay_signature  + "signatuer")
  if (hmac == details.payment.razorpay_signature) {
    const objId = mongoose.Types.ObjectId(details.order.receipt);
    console.log("objId");
    Orders
      .updateOne({ _id: objId }, { $set: { paymentStatus: 'Paid' } })
      .then(() => {
        res.json({ success: true, oid: details.order.receipt });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, err_message: 'payment failed' });
      });
  } else {
    res.json({ status: false, err_message: 'payment failed' });
  }
};

const paymentFailure = (req, res) => {
  const details = req.body;
  console.log(details);
  res.send('payment failed');
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
  getCheckout,
  getaddAddress,
  postaddAddress,
  confirmOrder,
  orderSuccess,
  verifyPayment,
  paymentFailure,
};
