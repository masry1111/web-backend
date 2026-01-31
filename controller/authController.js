var db  = require('../models/db').db;
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SECRET_KEY = require('../middleware/authMiddleware').SECRET_KEY;

//signup
var signup = function (req, res) {
    var ip = req.ip;
    var time = new Date().toISOString();
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    bcrypt.hash(password, 10, function (err, hashedPassword) {
        if (err) return res.status(500).send('Error hashing password');

        var query = "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)";

        db.run(query, [name, email, hashedPassword, 'user'], function (err2) {
            if (err2) {
                console.log("[" + time + "] [AUTH-FAIL] Signup failed: " + email + " | IP: " + ip);
                return res.status(400).send("Email already exists");
            }

            console.log("[" + time + "] [AUTH-SUCCESS] User registered: " + email + " | IP: " + ip);
            return res.status(200).send('Registration successful');
        });
    });
};

//login
var login = function (req, res) {
    var ip = req.ip;
    var time = new Date().toISOString();
    var email = req.body.email;
    var password = req.body.password;

    //Find user by email
   db.get("SELECT * FROM User WHERE email = ?", [email], function (err, user) {
        if (err) {
            console.log("[" + time + "] [AUTH-ERROR] DB error for: " + email + " | IP: " + ip);
            return res.status(500).send("Internal server error");
        }

        if (!user) {
            console.log("[" + time + "] [AUTH-FAIL] User not found: " + email + " | IP: " + ip);
            return res.status(401).send("Invalid email or password");
        }

        //Compare passwords
        bcrypt.compare(password, user.password, function (err, match) {
            if (err || !match) {
                console.log("[" + time + "] [AUTH-FAIL] Wrong password for: " + email + " | IP: " + ip);
                return res.status(401).send("Invalid email or password");
            }

            //Create JWT with full user data
            var tokenPayload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            var token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });

            //Set cookie correctly (localhost-safe)
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 3600000
            });

            console.log("[" + time + "] [AUTH-SUCCESS] " + email + " logged in | Role: " + user.role);

            //Respond to frontend
            return res.status(200).json({
                message: "Welcome back, " + user.name,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: token
            });
        });
    });
};


//signout
var signout = function (req, res) {
    res.clearCookie("token");
    return res.status(200).send("Logged out successfully");
};

//deleteAccount
var deleteAccount = function (req, res) {
    var ip = req.ip;
    var time = new Date().toISOString();
    var userId = req.user.id;
    var email = req.user.email;

    db.serialize(function() {
        // Delete all bookings for user first
        db.run("DELETE FROM Booking WHERE userId = ?", [userId], function(err) {
            if (err) {
                console.log("[" + time + "] [DELETE-FAIL] Booking deletion failed for: " + email + " | IP: " + ip);
                return res.status(500).send('Delete failed');
            }

            // Delete the user
            db.run("DELETE FROM User WHERE id = ?", [userId], function(err) {
                if (err) {
                    console.log("[" + time + "] [DELETE-FAIL] User deletion failed for: " + email + " | IP: " + ip);
                    return res.status(500).send('Delete failed');
                }

                if (this.changes === 0) {
                    console.log("[" + time + "] [DELETE-FAIL] User not found: " + email + " | IP: " + ip);
                    return res.status(404).send('User not found');
                }

                console.log("[" + time + "] [DELETE-SUCCESS] Account deleted: " + email + " | IP: " + ip);
                res.clearCookie("token");
                return res.status(200).json({ message: 'Account deleted successfully' });
            });
        });
    });
};

module.exports = { 
    signup: signup, 
    login: login, 
    signout: signout, 
    deleteAccount: deleteAccount 
};
