const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'mohamed_diamond_secure_access_2025';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
};

module.exports = { verifyToken, SECRET_KEY };