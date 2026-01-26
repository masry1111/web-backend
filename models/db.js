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
const CreateBookingTable = `CREATE TABLE Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    check_in_date TEXT NOT NULL,
    check_out_date TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (room_id) REFERENCES Room(id)
)`;
module.exports = { CreateUserTable, CreateBookingTable };