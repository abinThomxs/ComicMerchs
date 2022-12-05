/* eslint-disable no-console */
const Users = require('../models/signupModel');
const Categories = require('../models/categories');
const Products = require('../models/products');

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
              session.userid = result.email;
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
  const categories = await Categories.find();
  const products = await Products.find();
  console.log(session.userid);
  if (session.userid && session.accountType === 'user') {
    console.log(session.userid);
    const customer = true;
    res.render('user/userHome', { customer, categories, products });
  } else {
    const customer = false;
    res.render('user/userHome', { customer, categories, products });
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
    console.log(id);
    const products = await Products.findOne({ _id: id });
    console.log(products);
    if (session.userid && session.accountType === 'user') {
      console.log(session.userid);
      const customer = true;
      res.render('user/productDetail', { customer, products });
    } else {
      const customer = false;
      res.render('user/productDetail', { customer, products });
    }
  } catch (error) {
    console.log(error.message);
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
};
