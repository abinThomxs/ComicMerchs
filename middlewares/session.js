/* eslint-disable linebreak-style */
const userSession = (req, res, next) => {
  if (req.session.userid && req.session.accountType === 'user') {
    next();
  } else {
    res.redirect('/user/login');
  }
};

const adminSession = (req, res, next) => {
  if (req.session.userid && req.session.accountType === 'admin') {
    next();
  } else {
    res.redirect('/user/login');
  }
};

module.exports = {
  userSession,
  adminSession,
};
