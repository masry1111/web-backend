const express = require('express');
const router = express.Router();
const { db } = require('../models/db');
const { verifyToken, verifyManager } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(verifyManager);

// get all bookings (admin command)
router.get('/bookings', (req, res) => {
    const query = `
        SELECT 
            Booking.id AS bookingId,
            Room.type AS roomType,
            User.name AS username,
            User.email AS email,
            Booking.checkInDate,
            Booking.checkOutDate,
            Booking.status
        FROM Booking
        JOIN User ON Booking.userId = User.id
        JOIN Room ON Booking.roomId = Room.id
        ORDER BY Booking.id DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// create room
router.post('/rooms', (req, res) => {
    const { type, price, description } = req.body;

    if (!type || !price || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO Room (type, price, description, capacity)
        VALUES (?, ?, ?, 10)
    `;

    db.run(query, [type, price, description], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
            message: "Room successfully created",
            roomId: this.lastID
        });
    });
});

// update room
router.put('/rooms/:id', (req, res) => {
    const { type, price, description, capacity } = req.body;

    const query = `
        UPDATE Room 
        SET type = ?, price = ?, description = ?, capacity = ?
        WHERE id = ?
    `;

    db.run(query, [type, price, description, capacity, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Room not found" });

        res.json({ message: "Room updated successfully" });
    });
});

// delete room
router.delete('/rooms/:id', (req, res) => {
    db.run(`DELETE FROM Room WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Room not found" });

        res.json({ message: "Room deleted successfully" });
    });
});

// booking status update
router.put('/booking/status', (req, res) => {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
        return res.status(400).json({ error: "Missing bookingId or status" });
    }

    db.run(
        `UPDATE Booking SET status = ? WHERE id = ?`,
        [status, bookingId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Booking not found" });

            res.json({ message: "Booking status updated" });
        }
    );
});

module.exports = router;
