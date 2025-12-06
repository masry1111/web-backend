const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

//Import Routers
const AuthRouter = require('./routes/AuthRouter.js');
const HotelRouter = require('./routes/HotelRouter.js');

app.use(cookieParser()); 
app.use(express.json());

//Prints every request body to the terminal
app.use((req, res, next) => {
    console.log(`Incoming Request to: ${req.path}`);
    console.log("Request Body:", req.body);
    next();
});

//Routes
app.use('/auth', AuthRouter);
app.use('/api', HotelRouter); 

module.exports = { app };