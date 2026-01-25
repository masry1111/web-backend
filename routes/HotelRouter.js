const express = require('express');
const { 
    getAvailableRooms, 
    bookRoom, 
    cancelBooking 
} = require('../controller/OwnerHotelController');

const { verifyToken } = require('../middleware/authMiddleware');
const { db } = require('../models/db');

const HotelRouter = express.Router();

//Endpoint: GET /api/rooms

HotelRouter.get('/rooms', getAvailableRooms);

// Get ONE room by ID (public)
//Endpoint: GET /api/rooms/:id

HotelRouter.get('/rooms/:id', (req, res) => {
    const roomId = req.params.id;

    const query = `SELECT * FROM Room WHERE id = ?`;

    db.get(query, [roomId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Room not found" });

        return res.json(row);
    });
});

//Book a Room (protected)
//Endpoint: POST /api/booking

HotelRouter.post('/booking', verifyToken, bookRoom);

//cancel Booking (protected)
//Endpoint: PUT /api/cancel/:id

HotelRouter.put('/cancel/:id', verifyToken, cancelBooking);

//Get ALL Bookings for Logged-in User
//Endpoint: GET /api/my-bookings

HotelRouter.get('/my-bookings', verifyToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            Booking.id,
            Booking.checkInDate,
            Booking.checkOutDate,
            Booking.status,
            Room.type AS roomType
        FROM Booking
        JOIN Room ON Booking.roomId = Room.id
        WHERE Booking.userId = ?
        ORDER BY Booking.id DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(rows);
    });
});

module.exports = HotelRouter;
