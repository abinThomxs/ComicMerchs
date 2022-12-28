/* eslint-disable linebreak-style */
const userSession = (req, res, next) => {
  if (req.session.userid && req.session.accountType === 'user') {
    next();
  } else {
    res.redirect('/login');
  }
};

const adminSession = (req, res, next) => {
  if (req.session.userid && req.session.accountType === 'admin') {
    next();
  } else {
    res.redirect('/login');
  }
};

module.exports = {
  userSession,
  adminSession,
};
