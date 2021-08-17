var express = require('express');
var passport = require('passport');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middleware/auth');
var mg = require('nodemailer-mailgun-transport');
var bcrypt = require('bcrypt');
var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
// const { isLoggedIn, isNotVerified } = require('../middleware/auth');
/* GET users listing. */

router.get('/', (req, res, next) => {
  var userEmail = req.user.email;
  console.log(userEmail);
  // var email = req.user.email;
  // Income.find({ userEmail }, (err, income) => {
  //   Expense.find({ userEmail }, (err, expense) => {
  //     res.render('details', { expense, income, email });
  //   });
  // });
});
router.get('/register', function (req, res, next) {
  res.render('register');
});

// router.post('/register', (req, res, next) => {
//   User.create(req.body, (err, user) => {
//     res.redirect('/users/login');
//   });
// });

router.post('/register', async (req, res) => {
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    emailToken: crypto.randomBytes(64).toString('hex'),
    isVerified: false,
  });

  User.register(user, req.body.password, async function (err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/users/register');
    } else if (user) {
      var auth = {
        auth: {
          api_key: 'af27c69572207b9e1cf6e34f16d5b5dc-64574a68-de32e4a7',
          domain: 'sandboxcf73c7e45f0249f8a8b5efd168bef94a.mailgun.org',
        },
      };

      var nodemailerMailgun = nodemailer.createTransport(mg(auth));

      nodemailerMailgun.sendMail(
        {
          from: 'myemail@example.com',
          to: req.body.email,
          subject: 'verification link',
          text: `Hello user , thanks for registering  on our site , please click the link below
          http://${req.headers.host}/users/verify-email?token=${user.emailToken}`,
        },
        function (err, info) {
          if (err) {
            console.log('Error: ' + err);
            console.log(req.flash('error', err));
            return res.redirect('/');
          } else {
            console.log('email Sent');
            return res.redirect('/users/login');
          }
        }
      );
    }
  });
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash('error', 'token is invalid');
      return res.redirect('/');
    }
    user.emailToken = null;
    user.isVerified = true;
    await user.save();
    await req.login(user, async (err) => {
      if (err) return next(err);
      req.flash('success', `Welcome to the website ${user.username}`);
      const redirectUrl = req.session.redirectTo || '/';
      delete req.session.redirectTo;
      res.redirect(redirectUrl);
    });
  } catch (error) {
    console.log(error);
    req.flash(
      'error',
      `somethiong went wrong. please contact us for assistance`
    );
    res.redirect('/');
  }
});

router.get('/login', function (req, res, next) {
  res.render('login');
});
router.get('/loginSuccess/:email', function (req, res, next) {
  var email = req.params.email;
  var userEmail = email;
  User.findOne({ email }, (err, user) => {
    Income.find({ userEmail }, (err, income) => {
      Expense.find({ userEmail }, (err, expense) => {
        res.render('success', { user, expense, income, email });
      });
    });
  });
});

router.post('/login', auth.isNotVerified, function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    console.log('mmmmmmmm', user);
    if (user) {
      return res.redirect(`/users/loginSuccess/${user.email}`);
    }
    return res.redirect('/users/login');
  })(req, res, next);
});

//render forgot password page
router.get('/login/forgotpassword', (req, res, next) => {
  let error = req.flash('error')[0];
  let info = req.flash('info')[0];
  res.render('forgotPassword', { error, info });
});
function random() {
  return Math.floor(100000 + Math.random() * 900000);
}
//process forgot password
router.post('/login/forgotpassword', (req, res, next) => {
  var { email } = req.body;
  console.log('WWWWWWWWW', email);
  req.body.random = random();
  console.log(req.body.random);
  User.findOneAndUpdate({ email }, req.body, (err, user) => {
    if (err) return next(err);

    if (!user) {
      req.flash(
        'error',
        'The Email entered is not Registered, Please entered the registered Email'
      );
      return res.redirect('/users/login/forgotpassword');
    }
    var auth = {
      auth: {
        api_key: 'af27c69572207b9e1cf6e34f16d5b5dc-64574a68-de32e4a7',
        domain: 'sandboxcf73c7e45f0249f8a8b5efd168bef94a.mailgun.org',
      },
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: 'myemail@example.com',
        to: req.body.email,
        subject: 'password change',
        html: `<h1>${req.body.random}</h1>
       <h2>Please Copy above 6 digit number and click this link http://localhost:3000/users/login/resetpassword/verify/${req.body.email} </h2>`,
      },
      function (err, info) {
        if (err) {
          console.log('Error: ' + err);
          return res.redirect('/');
        } else {
          console.log('email Sent');
          return res.redirect('/users/login/forgotpassword');
        }
      }
    );
  });
});

//render reset password verification code page
router.get('/login/resetpassword/verify/:slug', (req, res, next) => {
  var email = req.params.slug;

  console.log(email, 'something');
  let error = req.flash('error')[0];
  res.render('resetPasswordVerificationCode', { error, email });
});

//process verification code
router.post('/login/resetpassword/verify', (req, res, next) => {
  let { email, passcode } = req.body;
  console.log(email);
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (passcode == user.random) {
      return res.redirect(`/users/login/resetpassword/${email}`);
    } else {
      req.flash('error', 'Enter the correct verification code');
      res.redirect('/users/login/resetpassword/verify');
    }
  });
});

//render reset password page
router.get('/login/resetpassword/:email', (req, res, next) => {
  let email = req.params.email;
  let error = req.flash('error')[0];
  res.render('resetPassword', { error, email });
});

//reset password
router.post('/login/resetpassword', (req, res, next) => {
  let { email, newPasswd1, newPasswd2 } = req.body;
  if (newPasswd1 === newPasswd2) {
    User.findOne({ email }, (err, user) => {
      console.log(user);
      if (err) return next(user);
      bcrypt.hash(newPasswd1, 10, (err, hashed) => {
        if (err) return next(err);
        req.body.password = hashed;
        User.findOneAndUpdate({ email }, req.body, (err, user) => {
          if (err) return next(err);
          console.log('info', 'Password is Successfully Changed');
          return res.redirect('/users/login');
        });
      });
    });
  } else {
    console.log('error', 'Password does not match');
    req.flash('error', 'Password does not match');
    res.redirect('/users/login/resetpassword');
  }
});

module.exports = router;
