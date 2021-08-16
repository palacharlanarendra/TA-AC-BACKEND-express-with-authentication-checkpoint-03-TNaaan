var express = require('express');
var passport = require('passport');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middleware/auth');
// const { isLoggedIn, isNotVerified } = require('../middleware/auth');
/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('logged');
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
    console.log('user,err', user, err, req);
    if (err) {
      console.log('enterd1');
      req.flash('error', err.message);
      return res.redirect('/users/register');
    } else if (user) {
      // Step 1
      console.log('enterd2');
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'taruntej.me@gmail.com',
          pass: 'iamahack',
        },
      });

      // Step 2
      var mailOptions = {
        from: 'taruntej.me@gmail.com',
        to: req.body.email,
        subject: 'Download your files',
        text: `Hello user , thanks for registering  on our site , please click the link below
          http://${req.headers.host}/users/verify-email?token=${user.emailToken}`,
      };

      // Step 3
      transporter.sendMail(mailOptions, (err, data) => {
        var emailSent = 'Email Successfully Sent!';
        var emailerror = 'Error Occured while Sending Mail!';
        if (err) {
          console.log(emailerror);
          return res.redirect('/');
        }
        console.log(emailSent);
        return res.redirect('/users/login');
      });
    }
  });
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash('error ,token is invalid');
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
router.get('/loginSuccess', function (req, res, next) {
  let email = req.session.email;
  User.findOne({ email }, (err, user) => {
    res.render('success');
  });
});

// router.post(
//   '/login',
//   isNotVerified,
//   passport.authenticate('local', {
//     successRedirect: '/users/loginSuccess',
//     failureRedirect: '/users/login',
//   }),
//   function (req, res) {}
// );

router.post('/login', auth.isNotVerified, function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    console.log(user);
    if (user) {
      return res.redirect('/users/loginSuccess');
    }
    return res.redirect('/users/login');
  })(req, res, next);
});
// router.post('/login', function (req, res, next) {
//   passport.authenticate('local', function (err, user, info) {
//     console.log(user);
//     if (user) {
//       return res.redirect('/users/loginSuccess');
//     }
//     return res.redirect('/users/login');
//   })(req, res, next);
// });

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
// router.get('/logout', function (req, res, next) {
//   req.session.destroy();
//   res.clearCookie('connect.sid');
//   res.redirect('/users/login');
// });

module.exports = router;
