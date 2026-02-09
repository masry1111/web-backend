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

  var bookingQuery =
    "SELECT id, userId, roomId, checkInDate, checkOutDate, status " +
    "FROM Booking ";

  var params = [];

  if (status) {
    bookingQuery += "WHERE status = ? ";
    params.push(status);
  }

  bookingQuery += "ORDER BY id DESC";

  db.all(bookingQuery, params, function (err, bookings) {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT id, name, email FROM User", [], function (err2, users) {
      if (err2) return res.status(500).json({ error: err2.message });

      db.all("SELECT id, type FROM Room", [], function (err3, rooms) {
        if (err3) return res.status(500).json({ error: err3.message });

        var userMap = {};
        for (var i = 0; i < users.length; i++) {
          userMap[users[i].id] = users[i];
        }

        var roomMap = {};
        for (var j = 0; j < rooms.length; j++) {
          roomMap[rooms[j].id] = rooms[j];
        }

        var result = [];
        for (var k = 0; k < bookings.length; k++) {
          var b = bookings[k];
          var u = userMap[b.userId];
          var r = roomMap[b.roomId];

          result.push({
            bookingId: b.id,
            roomType: r ? r.type : null,
            username: u ? u.name : null,
            email: u ? u.email : null,
            checkInDate: b.checkInDate,
            checkOutDate: b.checkOutDate,
            status: b.status
          });
        }

        return res.json(result);
      });
    });
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
        if (capacity === undefined || capacity === null || capacity === "") {
    return res.status(400).json({ error: "Capacity is required" });
}

capacity = parseInt(capacity, 10);

if (isNaN(capacity) || capacity < 0) {
    return res.status(400).json({ error: "Capacity must be a valid number (0 or more)" });
}
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
