var express = require('express');
var hotelcontroller = require('../controller/OwnerHotelController');
var getAvailableRooms = hotelcontroller.getAvailableRooms;
var bookRoom = hotelcontroller.bookRoom;
var cancelBooking = hotelcontroller.cancelBooking;

var verifyToken  = require('../middleware/authMiddleware').verifyToken;
var db = require('../models/db').db;

var HotelRouter = express.Router();

//Endpoint: GET /api/rooms

HotelRouter.get('/rooms', getAvailableRooms);

// Get ONE room by ID (public)
//Endpoint: GET /api/rooms/:id

HotelRouter.get('/rooms/:id', function(req, res) {
    var roomId = req.params.id;

    var query = "SELECT * FROM Room WHERE id = ?";

    db.get(query, [roomId], function(err, row) {
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

HotelRouter.get('/my-bookings', verifyToken, function(req, res) {
    var userId = req.user.id;

    var query = 
        "SELECT " +
            "Booking.id, " +
            "Booking.checkInDate, " +
            "Booking.checkOutDate, " +
            "Booking.status, " +
            "Room.type AS roomType " +
        "FROM Booking " +
        "JOIN Room ON Booking.roomId = Room.id " +
        "WHERE Booking.userId = ? " +
        "ORDER BY Booking.id DESC";

    db.all(query, [userId], function(err, rows) {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(rows);
    });
});
HotelRouter.get('/bookings/:id', verifyToken, function (req, res) {
    var bookingId = req.params.id;
    var userId = req.user.id;

    var query =
        "SELECT " +
        "Booking.id, Booking.checkInDate, Booking.checkOutDate, Booking.status, " +
        "Room.type AS roomType, Room.price AS price " +
        "FROM Booking " +
        "JOIN Room ON Booking.roomId = Room.id " +
        "WHERE Booking.id = ? AND Booking.userId = ?";

    db.get(query, [bookingId, userId], function (err, row) {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Booking not found" });
        return res.json(row);
    });
});
module.exports = HotelRouter;
