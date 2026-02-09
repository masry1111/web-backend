var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Travel.db');

var CreateUserTable =
  "CREATE TABLE IF NOT EXISTS User (" +
  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "name TEXT NOT NULL," +
  "email TEXT NOT NULL UNIQUE," +
  "password TEXT NOT NULL," +
  "role TEXT NOT NULL DEFAULT 'user'" +
  ")";

var CreateRoomTable =
  "CREATE TABLE IF NOT EXISTS Room (" +
  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "type TEXT NOT NULL," +
  "price REAL NOT NULL," +
  "description TEXT," +
  "capacity INTEGER NOT NULL DEFAULT 10" +
  ")";

var CreateBookingTable =
  "CREATE TABLE IF NOT EXISTS Booking (" +
  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "userId INTEGER NOT NULL," +
  "roomId INTEGER NOT NULL," +
  "checkInDate TEXT NOT NULL," +
  "checkOutDate TEXT NOT NULL," +
  "status TEXT DEFAULT 'Confirmed'," +
  "FOREIGN KEY(userId) REFERENCES User(id)," +
  "FOREIGN KEY(roomId) REFERENCES Room(id)" +
  ")";

db.serialize(function () {
  db.run(CreateUserTable);
  db.run(CreateRoomTable);
  db.run(CreateBookingTable);
});

module.exports = {db: db,CreateUserTable: CreateUserTable,CreateRoomTable: CreateRoomTable,CreateBookingTable: CreateBookingTable};
