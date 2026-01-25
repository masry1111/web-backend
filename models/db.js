const sqlite = require('sqlite3');
const db = new sqlite.Database('Travel.db');

// User Table (Modified to include role for Manager/User distinction)
const CreateUserTable = `CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' 
)`;

// room table(checking room type and availability)
const CreateRoomTable = `CREATE TABLE IF NOT EXISTS Room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,         -- e.g., 'Single', 'Suite', 'Sea View'
    price REAL NOT NULL,
    description TEXT,
    isAvailable INTEGER DEFAULT 1 -- 1 for true, 0 for false
)`;

// booking table (for bookings and payments)
const CreateBookingTable = `CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    roomId INTEGER NOT NULL,
    checkInDate TEXT NOT NULL,
    checkOutDate TEXT NOT NULL,
    paymentStatus TEXT DEFAULT 'Pending', -- 'Paid', 'Pending', 'Refunded'
    status TEXT DEFAULT 'Confirmed',      -- 'Confirmed', 'Cancelled'
    FOREIGN KEY(userId) REFERENCES User(id),
    FOREIGN KEY(roomId) REFERENCES Room(id)
)`;

module.exports = { 
    db, 
    CreateUserTable,
    CreateRoomTable,
    CreateBookingTable
};