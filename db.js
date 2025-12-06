const sqlite = require('sqlite3').verbose();

//Table Strings
const CreateUserTable = `CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' 
)`;

const CreateRoomTable = `CREATE TABLE IF NOT EXISTS Room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 10 
)`; 

const CreateBookingTable = `CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    roomId INTEGER NOT NULL,
    checkInDate TEXT NOT NULL,
    checkOutDate TEXT NOT NULL,
    paymentStatus TEXT DEFAULT 'Pending',
    status TEXT DEFAULT 'Confirmed',
    FOREIGN KEY(userId) REFERENCES User(id),
    FOREIGN KEY(roomId) REFERENCES Room(id)
)`;

//Export the ACTIVE db connection
module.exports = { 
    db, 
    CreateUserTable,
    CreateRoomTable,
    CreateBookingTable
};