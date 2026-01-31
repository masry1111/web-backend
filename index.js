var express = require('express');
var app = express();
var dotenv = require('dotenv');
var cookieParser = require('cookie-parser');
dotenv.config();

//cors config
var cors = require('cors');
var corsOptions = {
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        null
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

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
