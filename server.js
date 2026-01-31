var app  = require('./index');
var PORT = 5000;
var db = require('./models/db').db;
var bcrypt = require('bcryptjs');
    //manager info
   db.get("SELECT id FROM User WHERE email = ?", ["mohamed@diamondresort.com"], function(err, row) {
    if (err) {
        console.log("Error checking manager:", err);
        return;
    }

    if (row) {
        console.log("Manager already exists. Skipping manager seed.");
        return;
    }

    var managerPassword = 'admin_mohamed';
    bcrypt.hash(managerPassword, 10, function (err2, hash) {
        if (err2) {
            console.log("Error hashing manager password:", err2);
            return;
        }

        db.run(
            "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Mohamed', 'mohamed@diamondresort.com', hash, 'manager'],
            function(err3) {
                if (err3) console.log("Error inserting manager:", err3);
                else console.log("Manager created.");
            }
        );
    });
});


    db.serialize(function() {
db.get("SELECT COUNT(*) AS count FROM Room", [], function(err, row) {
    if (err) {
        console.log("Error counting rooms:", err);
        return;
    }

    if (row.count > 0) {
        console.log("Rooms already exist. Skipping room seed.");
        return;
    }
    //room info
    var rooms = [
        { type: 'Classic King', price: 150.00, desc: 'Luxury king bed with city view.' },
        { type: 'Ocean View Suite', price: 350.00, desc: 'Panoramic ocean views with balcony.' },
        { type: 'Diamond Penthouse', price: 900.00, desc: 'Top floor, private pool, and butler service.' }
    ];

    var insertRoom = "INSERT INTO Room (type, price, description, capacity) VALUES (?, ?, ?, ?)";

    rooms.forEach(function(room) {
        db.run(insertRoom, [room.type, room.price, room.desc, 10], function(err2) {
    if (err2) console.log("Room insert error:", err2);
     });
 });

    console.log(">> 3 Rooms Added with Capacity: 10");
});
});
//start server
app.listen(PORT, function() {
    console.log("Diamond Resort Server running on port " + PORT);
});
