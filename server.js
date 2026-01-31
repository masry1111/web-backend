var app  = require('./index');
var PORT = 5000;
var db = require('./models/db').db;
var bcrypt = require('bcryptjs');

var CreateRoomTableNew = "CREATE TABLE IF NOT EXISTS Room (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "type TEXT NOT NULL," +
    "price REAL NOT NULL," +
    "description TEXT," +
    "capacity INTEGER DEFAULT 10" +
")";
db.serialize(function() {
    console.log(">>NUCLEAR RESET: Deleting old tables...");
    db.run("DROP TABLE IF EXISTS Booking");
    db.run("DROP TABLE IF EXISTS Room");
    db.run("DROP TABLE IF EXISTS User");

    var dbModule = require('./models/db');
    var CreateUserTable = dbModule.CreateUserTable;
    var CreateBookingTable = dbModule.CreateBookingTable;

    db.run(CreateUserTable);
    db.run(CreateRoomTableNew);
    db.run(CreateBookingTable);

    console.log(">> Tables Recreated with 'Capacity' column.");

    //manager info
    var managerPassword = 'admin_mohamed';
    bcrypt.hash(managerPassword, 10, function (err, hash) {
        db.run(
            "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Mohamed', 'mohamed@diamondresort.com', hash, 'manager']
        );
    });

    //room info
    var rooms = [
        { type: 'Classic King', price: 150.00, desc: 'Luxury king bed with city view.' },
        { type: 'Ocean View Suite', price: 350.00, desc: 'Panoramic ocean views with balcony.' },
        { type: 'Diamond Penthouse', price: 900.00, desc: 'Top floor, private pool, and butler service.' }
    ];

    var insertRoom = "INSERT INTO Room (type, price, description, capacity) VALUES (?, ?, ?, 10)";

    rooms.forEach(function(room) {
        db.run(insertRoom, [room.type, room.price, room.desc]);
    });

    console.log(">> 3 Rooms Added with Capacity: 10");
});

//start server
app.listen(PORT, function() {
    console.log("Diamond Resort Server running on port " + PORT);
});
