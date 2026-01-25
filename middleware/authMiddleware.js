const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'mohamed_diamond_secure_access_2025';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

// manager only check
const verifyManager = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "manager") {
        return res.status(403).json({ error: "Access denied. Manager only." });
    }

    next();
};

module.exports = { verifyToken, verifyManager, SECRET_KEY };

