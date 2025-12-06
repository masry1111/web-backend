const express = require('express');
// Import the controller functions we created in Step 2
const { signup, login, signout } = require('../controller/authController');

// We are keeping your existing validator import
const { validateLogin, validateSignup } = require('../validators/validator');

const AuthRouter = express.Router();

// Route for User Signup
AuthRouter.route('/signup')
    .post(validateSignup, signup); [cite_start]// [cite: 109]

// Route for User Login
AuthRouter.route('/login')
    .post(validateLogin, login); [cite_start]// [cite: 109]

// Route for User Signout (Logout)
AuthRouter.route('/signout')
    .post(signout); [cite_start]// [cite: 109]

module.exports = AuthRouter;