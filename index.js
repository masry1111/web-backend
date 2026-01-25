const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

//cors config
const cors = require('cors');
const corsOptions = {
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
app.use((req, res, next) => {
    console.log(`Incoming Request to: ${req.path}`);
    console.log("Request Body:", req.body);
    next();
});

// Routers
const AuthRouter = require('./routes/AuthRouter.js');
const HotelRouter = require('./routes/HotelRouter.js');
const AdminRouter = require('./routes/AdminRouter.js');

app.use('/auth', AuthRouter);
app.use('/api', HotelRouter);
app.use('/admin', AdminRouter);

module.exports = { app };
