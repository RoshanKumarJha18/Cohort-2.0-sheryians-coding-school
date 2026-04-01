const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const authMiddleware = async (req, res, next) => {
    let token = req.cookies.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "unauthorized"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof userModel === 'undefined') {
            throw new Error('userModel is not initialized');
        }

        const user = await userModel.findById(decoded.userid);
        if (!user) {
            return res.status(401).json({
                message: 'unauthorized',
                error: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            message: "unauthorized",
            error: err.message
        });
    }
};

module.exports = authMiddleware;