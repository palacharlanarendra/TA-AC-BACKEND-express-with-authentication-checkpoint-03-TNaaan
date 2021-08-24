var User = require('../models/User');
module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.status(401).send('Not Logged In');
    }
  },
  isNotVerified: (err, req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      console.log(user.isVerified);
      if (user.isVerified) {
        return next();
      } else {
        res.status(401).send('Not Verified');
      }
    });
  },
};

// isNotVerified: async function (req, res, next) {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user.isVerified) {
//       return next();
//     }
//     req.flash(
//       'error your account has not been verified.please check your email to verify your account'
//     );
//     return res.redirect('/');
//   } catch (error) {
//     console.log(error);
//     req.flash(
//       'error something went wrong. plaese contact us for assisstance'
//     );
//     res.redirect('/');
//   }
// },
// isLoggedIn = (req, res, next) => {
//   if (req.user) {
//     next();
//   } else {
//     res.status(401).send('Not Logged In');
//   }
// };
// isNotVerified = async function (req, res, next) {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user.isVerified) {
//       return next();
//     }
//     req.flash(
//       'error your account has not been verified.please check your email to verify your account'
//     );
//     return res.redirect('/');
//   } catch (error) {
//     console.log(error);
//     req.flash('error something went wrong. plaese contact us for assisstance');
//     res.redirect('/');
//   }
// };
// module.exports = auth;
