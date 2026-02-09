var express = require('express');
var app = express();
var dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
dotenv.config();
var path = require("path");
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/index.html", function(req, res) {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
app.use(express.json());
app.use(cookieParser());

// log to confirm CORS is applied
console.log(">>> index.js LOADED");

// Log all requests
app.use(function(req, res, next) {
    console.log("Incoming Request to: " + req.path);
    console.log("Request Body:", req.body);
    next();
});

// Routers
var AuthRouter = require('./routes/AuthRouter.js');
var HotelRouter = require('./routes/HotelRouter.js');
var AdminRouter = require('./routes/AdminRouter.js');

app.use('/auth', AuthRouter);
app.use('/api', HotelRouter);
app.use('/admin', AdminRouter);

module.exports = app;
