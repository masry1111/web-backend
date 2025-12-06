const { db } = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/authMiddleware');

const signup = (req, res) => {
    // 1. Capture Security Info (IP & Time)
    const ip = req.ip || req.connection.remoteAddress;
    const time = new Date().toISOString();

    const { name, email, password } = req.body;
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');

        const query = `INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`;
        
        db.run(query, [name, email, hashedPassword, 'user'], function(err) {
            if (err) {
                // UPDATED LOG: Includes Timestamp and IP
                console.log(`[${time}] [AUTH-FAIL] Signup failed for: ${email} | IP: ${ip} | Error: ${err.message}`);
                return res.status(400).send("Email already exists");
            }
            // UPDATED LOG: Includes Timestamp and IP
            console.log(`[${time}] [AUTH-SUCCESS] User registered: ${email} | IP: ${ip}`);
            return res.status(200).send('Registration successful');
        });
    });
};

const login = (req, res) => {
    // 1. Capture Security Info (IP & Time)
    const ip = req.ip || req.connection.remoteAddress;
    const time = new Date().toISOString();

    const { email, password } = req.body;

    db.get(`SELECT * FROM User WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            // UPDATED LOG: Security Failure (User not found)
            console.log(`[${time}] [AUTH-FAIL] Login failed (User Not Found): ${email} | IP: ${ip}`);
            return res.status(401).send('Invalid credentials');
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                // UPDATED LOG: Security Failure (Wrong Password)
                console.log(`[${time}] [AUTH-FAIL] Login failed (Wrong Password): ${email} | IP: ${ip}`);
                return res.status(401).send('Invalid credentials');
            }

            const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

            res.cookie('token', token, { 
                httpOnly: true, 
                secure: false, 
                sameSite: 'strict',
                maxAge: 3600000 
            });

            // UPDATED LOG: Security Success
            console.log(`[${time}] [AUTH-SUCCESS] User logged in: ${user.email} | IP: ${ip}`);
            return res.status(200).json({ message: `Welcome back, ${user.name}`, role: user.role });
        });
    });
};

const signout = (req, res) => {
    // Optional: Log signout too
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${new Date().toISOString()}] [AUTH-INFO] User signed out | IP: ${ip}`);
    
    res.clearCookie('token');
    return res.status(200).send('Logged out successfully');
};

module.exports = { signup, login, signout };