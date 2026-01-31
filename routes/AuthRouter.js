var express = require('express');
// Importing the controller functions
var authController = require('../controller/authController');
var signup = authController.signup;
var login = authController.login;
var signout = authController.signout;
var deleteAccount = authController.deleteAccount;

// importing validator
var validator = require('../validators/validator');
var validateLogin = validator.validateLogin;
var validateSignup = validator.validateSignup;

var AuthRouter = express.Router();

// Route for User Signup
AuthRouter.route('/signup')
    .post(validateSignup, signup);

// Route for User Login
AuthRouter.route('/login')
    .post(validateLogin, login);

// Route for User Signout
AuthRouter.route('/signout')
    .post(signout);

// Route for Deleting User Account
AuthRouter.route('/account')
    .post(deleteAccount);

    var verifyToken = require('../middleware/authMiddleware').verifyToken;
AuthRouter.route('/account')
  .post(verifyToken, deleteAccount);

module.exports = AuthRouter;