const express = require('express');
// Importing the controller functions
const { signup, login, signout, deleteAccount } = require('../controller/authController');

// importing validator
const { validateLogin, validateSignup } = require('../validators/validator');

const AuthRouter = express.Router();

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

module.exports = AuthRouter;