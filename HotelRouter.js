const express = require('express');
// Import the logic functions from the HotelController
const { 
    getAvailableRooms, 
    bookRoom, 
    processPayment, 
    cancelBooking 
} = require('../controller/OwnerHotelController');

//import middleware security
const { verifyToken } = require('../middleware/authMiddleware');

const HotelRouter = express.Router();

//room availability api
HotelRouter.get('/rooms', getAvailableRooms);

//booking api
HotelRouter.post('/booking', verifyToken, bookRoom);

//payment api
HotelRouter.post('/payment', verifyToken, processPayment);

//Cancel booking api
HotelRouter.put('/cancel/:id', verifyToken, cancelBooking);

module.exports = HotelRouter;