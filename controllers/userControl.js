/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
// const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const Users = require('../models/signupModel');
// const Categories = require('../models/categories');
const Products = require('../models/products');
const Carts = require('../models/carts');
const Address = require('../models/address');
const Orders = require('../models/orders');
const Coupons = require('../models/coupon');
const Otp = require('../models/otp');
const mailer = require('../middlewares/otpValidation');
const instance = require('../middlewares/razorpay');
const Wishlists = require('../models/wishlist');

let message = '';

const loginRender = (req, res) => {
  const session = req.session;
  const customer = false;
  if (session.userid) {
    res.redirect('/user/home');
  }
  res.render('user/login', { message, customer });
  message = '';
};

const loginPost = async (req, res) => {
  const customer = false;
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
              res.render('user/login', { message, customer });
            }
          } else {
            message = 'You are blocked';
            res.render('user/login', { message, customer });
          }
        } else {
          message = 'Register to continue';
          res.render('user/login', { message, customer });
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

const userHomeRender = async (req, res) => {
  const { session } = req;
  let count = 0;

  const products = await Products.find().sort({ soldCount: -1 }).limit(6);
  const discounts = await Products.find({ discount: true });
  if (session.userid && session.accountType === 'user') {
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    const customer = true;
    res.render('user/userHome', { customer, products, count, discounts });
  } else {
    const customer = false;
    res.render('user/userHome', { customer, products, count, discounts });
  }
};

const logout = (req, res) => {
  const { session } = req;
  session.destroy();
  console.log('logout');
  res.redirect('/');
};

const signupRender = (req, res) => {
  const customer = false;
  res.render('user/signup', { message, customer });
  message = '';
};

const signupPost = async (req, res) => {
  const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;
  if (req.body.password === req.body.confirmPassword) {
    const User = await Users.findOne({ email: req.body.email });
    if (User) {
      res.render('user/signup', { message: 'User Already Exist' });
      message = '';
    } else {
      const user = await Users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        accountType: 'user',
      });
      const mailDetails = {
        from: process.env.nodmailer_email,
        to: req.body.email,
        Subject: 'ComicMerchs OTP validation',
        html: `<p>Your OTP for ComicMerchs signup is  ${OTP}</p>`,
      };
      mailer.mailTransporter.sendMail(mailDetails, async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
          await Otp.create({
            userId: user.id,
            otp: OTP,
          });
          res.redirect(`/user/otp?email=${user.email}`);
        }
      });
    }
  } else {
    message = 'Passwords do not match';
    res.render('user/signup', { message });
    message = '';
  }
};

const getOTP = async (req, res) => {
  const { email } = req.query;
  const user = await Users.findOne({ email });
  console.log('getOtp user id is', user._id);
  res.render('user/otp', { user });
};

const postOTP = async (req, res) => {
  const verify = await Otp.findOne({
    userId: req.body.userId,
  });
  console.log('verify   =', verify);
  if (req.body.otp == verify.otp) {
    await Users.updateOne({ _id: req.body.userId }, { isBlock: false });
    res.redirect('/user/login');
  } else {
    res.redirect('/user/otp');
  }
};

const getStore = async (req, res) => {
  const { session } = req;
  const pageNum = req.query.page;
  const perPage = 6;
  let count = 0;
  const text = '';
  const searchvalue = '';
  const doCount = await Products.find().countDocuments();

  const products = await Products.find().skip((pageNum - 1) * perPage).limit(perPage);
  if (session.userid && session.accountType === 'user') {
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    const customer = true;
    res.render('user/store', { page: '/', doCount, pageNum, pages: Math.ceil(doCount / perPage), customer, products, count, searchvalue, text });
  } else {
    const customer = false;
    res.render('user/store', { page: '/', doCount, pageNum, pages: Math.ceil(doCount / perPage), customer, products, count, searchvalue, text });
  }
};

const search = async (req, res) => {
  const { session } = req;
  try {
    let customer;
    const pageNum = req.query.page;
    const perPage = 6;
    let count = 0;
    const searchvalue = req.body.searchinput;
    const text = 'Results for your search: ';
    const docCount = await Products.find({
      $and: [
        { difference: { $gt: 0 } },
        { difference: { $subtract: ['$stock', 'soldCount'] } },
        { product_name: new RegExp(searchvalue, 'i') },
      ],
    })
      .countDocuments();

    Products.find({
      $and: [
        { isBlock: false },
        { difference: { $subtract: ['$stock', 'soldCount'] } },
        { $gt: 0 },
        { productName: new RegExp(searchvalue, 'i') },
      ],
    })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .then((products) => {
        Carts.findOne({ user_id: req.session.userID }).then((doc) => {
          if (doc) {
            count = doc.product.length;
          }
          if (session.userid && session.accountType === 'user') {
            customer = true;
            res.render('user/store', { page: '/', docCount, pageNum, pages: Math.ceil(docCount / perPage), customer, products, count, searchvalue, text });
          } else {
            customer = false;
            res.render('user/store', { page: '/', docCount, pageNum, pages: Math.ceil(docCount / perPage), customer, products, count, searchvalue, text });
          }
        });
      })
      .catch(() => {
        res.redirect('/500');
      });
  } catch (error) {
    res.redirect('/500');
  }
};

const getActionFigures = async (req, res) => {
  const { session } = req;
  let count = 0;
  const actionFig = await Products.find({ productCategory: 'Action Figures' });
  if (session.userid && session.accountType === 'user') {
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    const customer = true;
    res.render('user/actionFigures', { customer, actionFig, count });
  } else {
    const customer = false;
    res.render('user/actionFigures', { customer, actionFig, count });
  }
};

const getAccessories = async (req, res) => {
  const { session } = req;
  let count = 0;
  const accessories = await Products.find({ productCategory: 'Accessories' });
  if (session.userid && session.accountType === 'user') {
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    const customer = true;
    res.render('user/accessories', { customer, accessories, count });
  } else {
    const customer = false;
    res.render('user/accessories', { customer, accessories, count });
  }
};

const getClothes = async (req, res) => {
  const { session } = req;
  let count = 0;
  const clothes = await Products.find({ productCategory: 'Clothes' });
  if (session.userid && session.accountType === 'user') {
    const userData = await Users.findOne({ _id: session.userid });
    const cart = await Carts.find({ userId: userData._id });
    if (cart.length) {
      count = cart[0].product.length;
    }
    const customer = true;
    res.render('user/clothes', { customer, clothes, count });
  } else {
    const customer = false;
    res.render('user/clothes', { customer, clothes, count });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { session } = req;
    const { id } = req.params;
    const products = await Products.findOne({ _id: id });

    if (session.userid && session.accountType === 'user') {
      let count = 0;
      const userData = await Users.findOne({ _id: session.userid });
      const cart = await Carts.find({ userId: userData._id });

      const customer = true;
      if (cart.length) {
        count = cart[0].product.length;
      } else {
        count = 0;
      }
      res.render('user/productDetail', { customer, products, count, session });
    } else {
      const count = null;
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

const getWishlist = async (req, res) => {
  try {
    const customer = true;
    const { session } = req;
    const userData = mongoose.Types.ObjectId(session.userid);
    const cartData = await Carts.findOne({ user_id: session.userid });
    let count = cartData?.product?.length;
    const wishlistDetails = await Wishlists.findOne({ userId: session.userid });
    let wishCount = wishlistDetails?.product?.length;
    if (wishlistDetails == null) {
      wishCount = 0;
    }
    if (cartData == null) {
      count = 0;
    }
    const wishlistData = await Wishlists.aggregate([
      {
        $match: { userId: userData },
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          productItem: '$product.productId',
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
          _id: 0,
          productDetail: { $arrayElemAt: ['$productDetail', 0] },
        },
      },
    ]);
    res.render(
      'user/wishlist',
      {
        customer,
        count,
        wishlistData,
        wishCount,
      },
    );
  } catch (error) {
    console.log(error);
    res.redirect('/500');
  }
};

const postAddToWishlist = async (req, res) => {
  try {
    const uid = req.session.userid;
    const { pid } = req.body;
    const proObj = {
      productId: pid,
    };
    const userWishlist = await Wishlists.findOne({ userId: uid });
    const verify = await Carts.findOne(
      { userId: uid },
      { product: { $elemMatch: { productId: pid } } },
    );
    if (verify?.product?.length) {
      res.json({ cart: true });
    } else {
      // eslint-disable-next-line no-lonely-if
      if (userWishlist) {
        const proExist = userWishlist.product.findIndex(
          (product) => product.productId === pid,
        );
        if (proExist !== -1) {
          res.json({ productExist: true });
        } else {
          Wishlists
            .updateOne({ userId: uid }, { $push: { product: proObj } })
            .then(() => {
              res.json({ success: true });
              // res.redirect('/user/home');
              console.log('added to wishlist');
            });
        }
      } else {
        Wishlists
          .create({
            userId: uid,
            product: [
              {
                productId: pid,
              },
            ],
          })
          .then(() => {
            res.json({ status: true });
          });
      }
    }
  } catch (error) {
    res.redirect('/500');
  }
};

const postDeleteWishlist = async (req, res) => {
  try {
    const pid = req.body.product;
    const uid = req.session.userid;
    console.log(pid);
    await Wishlists
      .updateOne(
        { userId: uid, 'product.productId': pid },
        { $pull: { product: { productId: pid } } },
      )
      .then(() => {
        res.json({ status: true });
      });
  } catch (error) {
    res.redirect('/500');
  }
};

const cartQuantity = async (req, res, next) => {
  const data = req.body;
  data.count = Number(data.count);
  data.quantity = Number(data.quantity);
  console.log('inside change');
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

const getEditAddress = (req, res) => {
  try {
    const aid = req.params.id;

    Address.findOne({ _id: aid }).then((doc) => {
      res.render('user/editAddress', { doc });
    }).catch(() => {
      res.redirect('/user/profile');
    });
  } catch (error) {
    res.redirect('/user/profile');
  }
};

const postEditAddress = (req, res) => {
  try {
    const aid = req.params.id;
    const {
      address,
      state,
      city,
      pincode,
    } = req.body;
    Address.updateOne(
      { _id: aid },
      {
        address, state, city, pincode,
      },
    ).then(() => {
      res.redirect('/user/profile');
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const getDeleteAddress = (req, res) => {
  try {
    const { id } = req.params;
    Address.findByIdAndDelete({ _id: id }).then(() => {
      res.redirect('/user/profile');
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const couponCheck = async (req, res) => {
  const uid = req.session.userid;
  console.log('entered into couponcheck');
  const { code, amount } = req.body;
  const check = await Coupons.findOne(
    { coupon_code: code },
  );
  if (check) {
    let used = false;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < check.used_user_id.length; i++) {
      const element = check.used_user_id[i];
      if (element === uid) {
        used = true;
      }
    }
    if (!used) {
      let discount = 0;
      const off = (Number(amount) * Number(check.offer)) / 100;
      if (off > Number(check.max_amount)) {
        discount = Number(check.max_amount);
      } else {
        discount = off;
      }
      res.json([
        {
          success: true, dis: discount, code,
        },
        { check },
      ]);
    } else {
      res.json([{ success: false, message: 'Coupon already used' }]);
    }
  } else {
    res.json([{ success: false, message: 'Coupon invalid' }]);
  }
};

const confirmOrder = async (req, res) => {
  const uid = mongoose.Types.ObjectId(req.session.userid);
  const paymethod = req.body.pay;
  const adrs = req.body.address;
  const coupon = await Coupons.findOne({ coupon_code: req.body.coupon });
  if (coupon) {
    await Coupons.updateOne(
      { coupon_code: req.body.coupon },
      {
        $push: { used_user_id: uid },
      },
    );
  }
  Users.findOne({ user_id: uid }).then(() => {
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
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < result.length; i++) {
          const sold = result[i].productDetail.soldCount + result[i].productQuantity;
          Products.updateMany(
            // eslint-disable-next-line no-underscore-dangle
            { _id: result[i].productDetail._id },
            { soldCount: sold },
          ).then(() => {
          }).catch((err) => {
            console.log(err);
          });
        }
        let dis = 0;
        let lastTotal = 0;
        const sum = result
          .reduce((accumulator, object) => accumulator + object.productPrice, 0);
        if (coupon) {
          dis = (Number(sum) * Number(coupon.offer)) / 100;
          if (dis > Number(coupon.max_amount)) {
            dis = Number(coupon.max_amount);
          }
          lastTotal = sum - dis;
        } else {
          lastTotal = sum;
        }
        Carts.findOne({ userId: uid }).then((cartData) => {
          const order = new Orders({
            order_id: Date.now(),
            user_id: uid,
            // eslint-disable-next-line no-underscore-dangle
            address: adrs,
            order_placed_on: moment().format('DD-MM-YYYY'),
            products: cartData.product,
            discount: dis,
            totalAmount: lastTotal,
            finalAmount: Math.round(lastTotal + (lastTotal * 0.15) + 100),
            paymentMethod: paymethod,
            expectedDelivery: moment().add(4, 'days').format('MMM Do YY'),
          });
          // eslint-disable-next-line no-unused-vars
          order.save().then((done) => {
            // eslint-disable-next-line semi, no-underscore-dangle
            const oid = done._id;
            Carts.deleteOne({ user_id: uid }).then(() => {
              if (paymethod === 'cod') {
                res.json([{ success: true, oid }]);
              } else if (paymethod === 'online') {
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
  console.log(`${details.payment.razorpay_signature}signatuer`);
  if (hmac == details.payment.razorpay_signature) {
    const objId = mongoose.Types.ObjectId(details.order.receipt);
    console.log('objId');
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

const getProfile = async (req, res) => {
  const { session } = req;
  let count = 0;
  const userid = session.userid;
  if (session.userid && session.accountType === 'user') {
    const customer = true;
    await Carts.findOne({ user_id: req.session.userID }).then((doc) => {
      if (doc) {
        count = doc.product.length;
      }
    });
    await Users.findOne({ _id: userid }).then((userdoc) => {
      Address.find({ user_id: userid }).then((address) => {
        console.log(userdoc);
        res.render('user/profile', { user: userdoc, address, customer, count });
      }).catch(() => {
        res.redirect('/404');
      });
    }).catch(() => {
      res.redirect('/404');
    });
  } else {
    res.redirect('/login');
  }
};

const getChangePassword = (req, res) => {
  res.render('user/changePassword', { message: '' });
};

const postChangePasswod = (req, res) => {
  try {
    const uid = req.session.userID;
    const { currentPassword, password } = req.body;
    Users.findOne({ user_id: uid }).then((result) => {
      if (result.password === currentPassword) {
        if (password === currentPassword) {
          res.render('user/changePassword', { message: 'old password and new pasword is same' });
        } else {
          Users.findOneAndUpdate({ user_id: uid }, { password }).then(() => {
            res.redirect('/user/profile');
          }).catch(() => {
            res.redirect('/404');
          });
        }
      } else {
        res.render('user/changePassword', { message: 'Current password do not match' });
      }
    }).catch(() => {
      res.redirect('/404');
    });
  } catch (error) {
    res.redirect('/404');
  }
};

const getOrders = async (req, res) => {
  const customer = true;
  const name = req.session.firstName;
  const uid = req.session.userid;
  const uidobj = mongoose.Types.ObjectId(uid);
  await Orders.aggregate([
    {
      $match: { user_id: uidobj },
    },
    {
      $unwind: '$products',
    },
    {
      $project: {
        productItem: '$products.productId',
        productQuantity: '$products.quantity',
        order_id: 1,
        address: 1,
        expectedDelivery: 1,
        finalAmount: 1,
        paymentMethod: 1,
        paymentStatus: 1,
        orderStatus: 1,
        createdAt: 1,
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
      $unwind: '$productDetail',
    },
    {
      $addFields: {
        productPrice: {
          $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
        },
      },
    },
  ]).then((result) => {
    // eslint-disable-next-line no-underscore-dangle
    console.log('helo', result);
    Orders.find({ user_id: uid }).then((doc) => {
      res.render('user/orders', {
        name, customer, count: 0, productData: result, allData: doc, items: 0,
      });
    });
  });
};

module.exports = {
  loginRender,
  loginPost,
  logout,
  userHomeRender,
  signupPost,
  signupRender,
  getStore,
  search,
  getActionFigures,
  getAccessories,
  getClothes,
  getProductDetail,
  getCart,
  getAddToCart,
  getWishlist,
  postAddToWishlist,
  postDeleteWishlist,
  getOTP,
  postOTP,
  cartQuantity,
  postDeleteProduct,
  getCheckout,
  getaddAddress,
  postaddAddress,
  getEditAddress,
  postEditAddress,
  getDeleteAddress,
  couponCheck,
  confirmOrder,
  orderSuccess,
  verifyPayment,
  paymentFailure,
  getProfile,
  getChangePassword,
  postChangePasswod,
  getOrders,
};
