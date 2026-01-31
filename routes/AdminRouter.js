var express = require('express');
var router = express.Router();
var db  = require('../models/db').db;
var verifyToken = require('../middleware/authMiddleware').verifyToken;
var verifyManager = require('../middleware/authMiddleware').verifyManager;

router.use(verifyToken);
router.use(verifyManager);

// get all bookings (admin command)
router.get('/bookings', function (req, res) {
    var status = req.query.status;

    var query =
        "SELECT " +
        "Booking.id AS bookingId, " +
        "Room.type AS roomType, " +
        "User.name AS username, " +
        "User.email AS email, " +
        "Booking.checkInDate, " +
        "Booking.checkOutDate, " +
        "Booking.status " +
        "FROM Booking " +
        "JOIN User ON Booking.userId = User.id " +
        "JOIN Room ON Booking.roomId = Room.id ";

    var params = [];

    if (status) {
        query += "WHERE Booking.status = ? ";
        params.push(status);
    }

    query += "ORDER BY Booking.id DESC";

    db.all(query, params, function (err, rows) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// create room
router.post('/rooms', function (req, res) {
    var type = req.body.type;
    var price = req.body.price;
    var description = req.body.description;

    if (!type || !price || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    var query = 
        "INSERT INTO Room (type, price, description, capacity) " +
        "VALUES (?, ?, ?, 10)";

    db.run(query, [type, price, description], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        return res.json({
            message: "Room successfully created",
            roomId: this.lastID
        });
    });
});

// update room
router.put('/rooms/:id', function (req, res) {
    var type = req.body.type;
    var price = req.body.price;
    var description = req.body.description;
    var capacity = req.body.capacity;

    var query = 
        "UPDATE Room " +
        "SET type = ?, price = ?, description = ?, capacity = ? " +
        "WHERE id = ?";

    db.run(query, [type, price, description, capacity, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Room not found" });

        res.json({ message: "Room updated successfully" });
    });
});

// delete room
router.delete('/rooms/:id', function (req, res) {
    db.run("DELETE FROM Room WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Room not found" });

        res.json({ message: "Room deleted successfully" });
    });
});

// booking status update
router.put('/booking/status', function (req, res) {
    var bookingId = req.body.bookingId;
    var status = req.body.status;

    if (!bookingId || !status) {
        return res.status(400).json({ error: "Missing bookingId or status" });
    }

    db.run(
        "UPDATE Booking SET status = ? WHERE id = ?",
        [status, bookingId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Booking not found" });

            res.json({ message: "Booking status updated" });
        }
    );
});

module.exports = router;
