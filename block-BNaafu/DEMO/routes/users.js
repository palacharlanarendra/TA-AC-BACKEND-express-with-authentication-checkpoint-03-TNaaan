var express = require('express');
var passport = require('passport');

// var passport = require('passport-local');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('logged');
});
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  User.create(req.body, (err, user) => {
    res.redirect('/users/login');
  });
});
router.get('/login', function (req, res, next) {
  res.render('login');
});
router.get('/loginSuccess', function (req, res, next) {
  let email = req.session.email;
  User.findOne({ email }, (err, user) => {
    res.render('success');
  });
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (user) {
      return res.redirect('/users/loginSuccess');
    }
    return res.redirect('/users/login');
  })(req, res, next);
});

// router.post('/login', passport.authenticate('local'), function (req, res) {
//   console.log('passport user', req, res);
// });
// router.post('/login', (req, res, next) => {
//   var { email, password } = req.body;
//   if (!email || !password) {
//     return res.redirect('/users/login');
//   }
//   User.findOne({ email }, (err, user) => {
//     if (err) return next(err);
//     if (!user) {
//       return res.redirect('/users/login');
//     }
//     user.verifyPassword(password, (err, result) => {
//       if (err) return next(err);
//       console.log(result);
//       if (!result) {
//         console.log(password);
//         return res.redirect('/users/login');
//       }
//       req.session.userId = user.id;
//       req.session.email = user.email;
//       res.redirect('/users/loginSuccess');
//     });
//   });
// });
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
