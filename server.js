const { app } = require('./index');
const PORT = 5000;
const { db } = require('./models/db');
const bcrypt = require('bcryptjs');

const CreateRoomTableNew = `CREATE TABLE Room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 10
)`;

//makes sure old tables are deleted to keep the database uptodate with bookings
db.serialize(() => {
    console.log(">> ⚠️  NUCLEAR RESET: Deleting old tables...");
    db.run("DROP TABLE IF EXISTS Booking");
    db.run("DROP TABLE IF EXISTS Room");
    db.run("DROP TABLE IF EXISTS User");

    const { CreateUserTable, CreateBookingTable } = require('./models/db');
    
    db.run(CreateUserTable);
    db.run(CreateRoomTableNew);
    db.run(CreateBookingTable);

    console.log(">> Tables Recreated with 'Capacity' column.");

    //manager info
    const managerPassword = 'admin_mohamed'; 
    bcrypt.hash(managerPassword, 10, (err, hash) => {
        db.run(`INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['Mohamed', 'mohamed@diamondresort.com', hash, 'manager']);
    });

    //room info
    const rooms = [
        { type: 'Classic King', price: 150.00, desc: 'Luxury king bed with city view.' },
        { type: 'Ocean View Suite', price: 350.00, desc: 'Panoramic ocean views with balcony.' },
        { type: 'Diamond Penthouse', price: 900.00, desc: 'Top floor, private pool, and butler service.' }
    ];

    const insertRoom = `INSERT INTO Room (type, price, description, capacity) VALUES (?, ?, ?, 10)`;
    
    rooms.forEach(room => {
        db.run(insertRoom, [room.type, room.price, room.desc]);
    });
    console.log(">> 3 Rooms Added with Capacity: 10");
});

app.listen(PORT, () => {
    console.log(`Diamond Resort Server running on port ${PORT}`);
});