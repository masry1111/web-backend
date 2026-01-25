const { db } = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/authMiddleware');

//signup
const signup = (req, res) => {
    const ip = req.ip;
    const time = new Date().toISOString();
    const { name, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');

        const query = `INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`;

        db.run(query, [name, email, hashedPassword, 'user'], function (err) {
            if (err) {
                console.log(`[${time}] [AUTH-FAIL] Signup failed: ${email} | IP: ${ip}`);
                return res.status(400).send("Email already exists");
            }

            console.log(`[${time}] [AUTH-SUCCESS] User registered: ${email} | IP: ${ip}`);
            return res.status(200).send('Registration successful');
        });
    });
};

//login
const login = (req, res) => {
    const ip = req.ip;
    const time = new Date().toISOString();
    const { email, password } = req.body;

    //Find user by email
    db.get(`SELECT * FROM User WHERE email = ?`, [email], (err, user) => {
        if (err) {
            console.log(`[${time}] [AUTH-ERROR] DB error for: ${email} | IP: ${ip}`);
            return res.status(500).send("Internal server error");
        }

        if (!user) {
            console.log(`[${time}] [AUTH-FAIL] User not found: ${email} | IP: ${ip}`);
            return res.status(401).send("Invalid email or password");
        }

        //Compare passwords
        bcrypt.compare(password, user.password, (err, match) => {
            if (err || !match) {
                console.log(`[${time}] [AUTH-FAIL] Wrong password for: ${email} | IP: ${ip}`);
                return res.status(401).send("Invalid email or password");
            }

            //Create JWT with full user data
            const tokenPayload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });

            //Set cookie correctly (localhost-safe)
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 3600000
            });

            console.log(`[${time}] [AUTH-SUCCESS] ${email} logged in | Role: ${user.role}`);

            //Respond to frontend
            return res.status(200).json({
                message: `Welcome back, ${user.name}`,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        });
    });
};


//signout
const signout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).send("Logged out successfully");
};

module.exports = { signup, login, signout };
