var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String },
    isVerified: { type: Boolean },
    emailToken: { type: String },
  },
  { timestamps: true }
);
userSchema.plugin(passportLocalMongoose);
userSchema.pre('save', function (next) {
  console.log(this, this.password);
  if (this.password && this.isModified('password')) {
    console.log('inside if');
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      console.log('some');
      this.password = hashed;
      next();
    });
  } else {
    console.log('some2');
    next();
  }
});
userSchema.methods.fullName = function () {
  return this.firstname + ' ' + this.lastname;
};
userSchema.methods.verifyPassword = function (password, cb) {
  console.log(password, this.password, this.hash);
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};
module.exports = mongoose.model('User', userSchema);
