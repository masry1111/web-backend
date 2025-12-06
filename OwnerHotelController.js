const { db } = require('../models/db');

//Check Availability (Shows remaining capacity)
const getAvailableRooms = (req, res) => {
    // Show rooms that have capacity left
    db.all(`SELECT * FROM Room WHERE capacity > 0`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

//Book Room (decreases Capacity)
const bookRoom = (req, res) => {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const userId = req.user.id;

    // Check if room has capacity
    db.get(`SELECT capacity FROM Room WHERE id = ?`, [roomId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Room not found" });

        if (row.capacity <= 0) {
            return res.status(400).json({ error: "Room Sold Out!" });
        }

        // Create Booking
        db.run(`INSERT INTO Booking (userId, roomId, checkInDate, checkOutDate) VALUES (?, ?, ?, ?)`, 
            [userId, roomId, checkInDate, checkOutDate], function(err) {
                if (err) return res.status(500).json({ error: "Booking Failed" });
                
                // DECREASE CAPACITY
                db.run(`UPDATE Room SET capacity = capacity - 1 WHERE id = ?`, [roomId], () => {
                    res.status(200).json({ message: "Booking Successful", bookingId: this.lastID });
                });
        });
    });
};

//Payment
const processPayment = (req, res) => {
    const { bookingId, creditCard } = req.body;
    if (!bookingId || !creditCard) return res.status(400).json({ error: "Missing info" });

    db.get(`SELECT Room.price, Booking.checkInDate, Booking.checkOutDate, Room.type 
            FROM Booking JOIN Room ON Booking.roomId = Room.id WHERE Booking.id = ?`, 
            [bookingId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Booking not found" });

        const nights = Math.ceil(Math.abs(new Date(row.checkOutDate) - new Date(row.checkInDate)) / (86400000)) || 1;
        const total = nights * row.price;

        db.run(`UPDATE Booking SET paymentStatus = 'Paid' WHERE id = ?`, [bookingId], () => {
            res.status(200).json({ message: "Paid", totalPaid: total });
        });
    });
};

//Cancel (increases Capacity)
const cancelBooking = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get(`SELECT roomId FROM Booking WHERE id = ? AND userId = ?`, [id, userId], (err, row) => {
        if (!row) return res.status(404).json({ error: "Booking not found" });

        db.run(`UPDATE Booking SET status = 'Cancelled' WHERE id = ?`, [id], () => {
            // INCREASE CAPACITY
            db.run(`UPDATE Room SET capacity = capacity + 1 WHERE id = ?`, [row.roomId], () => {
                res.status(200).json({ message: "Cancelled. Capacity returned." });
            });
        });
    });
};

module.exports = { getAvailableRooms, bookRoom, processPayment, cancelBooking };