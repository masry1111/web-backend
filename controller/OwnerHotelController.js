var db  = require('../models/db').db;

//Check Availability (Shows remaining capacity)
var getAvailableRooms = function (req, res) {

    // Show rooms that have capacity left
    db.all("SELECT * FROM Room WHERE capacity > 0", [], function (err, rows) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
};

//Book Room (decreases Capacity)
var bookRoom = function (req, res) {
    var roomId = req.body.roomId;
    var checkInDate = req.body.checkInDate;
    var checkOutDate = req.body.checkOutDate;
    var userId = req.user.id;

    // Check if room has capacity
    db.get("SELECT capacity FROM Room WHERE id = ?", [roomId], function(err, row) {
        if (err || !row) return res.status(404).json({ error: "Room not found" });

        if (row.capacity <= 0) {
            return res.status(400).json({ error: "Room Sold Out!" });
        }

        // Create Booking
        db.run("INSERT INTO Booking (userId, roomId, checkInDate, checkOutDate) VALUES (?, ?, ?, ?)", 
            [userId, roomId, checkInDate, checkOutDate], function(err) {
                if (err) return res.status(500).json({ error: "Booking Failed" });

                var bookingId = this.lastID;

                // decrease capacity
                db.run("UPDATE Room SET capacity = capacity - 1 WHERE id = ?", [roomId], function() {
                    res.status(200).json({ message: "Booking Successful", bookingId: bookingId });
                });
        });
    });
};

// Cancel booking (increases capacity)
var cancelBooking = function (req, res) {
    var id = req.params.id;
    var userId = req.user.id;

    db.get(
        "SELECT roomId FROM Booking WHERE id = ? AND userId = ? AND status != 'Cancelled'",
        [id, userId],
        function (err, row) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ error: "Booking not found" });
            }

            db.run(
                "UPDATE Booking SET status = 'Cancelled' WHERE id = ?",
                [id],
                function (err2) {
                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }

                    db.run(
                        "UPDATE Room SET capacity = capacity + 1 WHERE id = ?",
                        [row.roomId],
                        function (err3) {
                            if (err3) {
                                return res.status(500).json({ error: err3.message });
                            }

                            return res.status(200).json({
                                message: "Cancelled. Capacity returned."
                            });
                        }
                    );
                }
            );
        }
    );
};

module.exports = {
    getAvailableRooms: getAvailableRooms,
    bookRoom: bookRoom,
    cancelBooking: cancelBooking
};