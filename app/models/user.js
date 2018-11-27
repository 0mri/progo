// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var uniqueString = require('unique-string');
// load mail
var mail = require('../../config/mail');
// define the schema for our user model
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  },
  profileImage: {
    type: String,
    required: true
  },
  socketID: {
    type: String
  },
  status: {
    type: String,
    default: 'offline'
  },
  lastseen: {
    type: Date
  }
}, {versionKey: false});
//send mails
userSchema.methods.sendMail = function (user) {
  var to = user.email,
    subject = 'Welcome to PROGO',
    message = 'To activate your email click <a href="' + process.env.URL + "/v/" + user._id + '/' + user.token + '">here</a>'; //activation link
  mail(to, subject, message);
}
//get rendom image
userSchema.methods.randomImage = function () {
  return 'images/profile/default' + Math.floor((Math.random() * 5) + 1) + '.png'
}
// get createAt
userSchema.methods.currentTime = function () {
  return Date.now();
}
// generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, 10);
};
// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
userSchema.methods.userToken = function () {
  return uniqueString();
};
userSchema.methods.escapeRegExp = function (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
userSchema.methods.clearPassword = function (user) {
  if (user) {
    user.password = undefined;
    return user;
  }
  return false;
}
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);