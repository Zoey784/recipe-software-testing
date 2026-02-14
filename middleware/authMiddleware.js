const jwt = require('jsonwebtoken');
const config = require('../dbConfig');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(403).send("Access denied. No token provided.");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Invalid token.");
        }
        req.user = user; // Attach user data to request object
        next();
    });
};

module.exports = authenticateJWT;