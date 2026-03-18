const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userid);
        
        req.user = user;
        next();
    } catch (err) {
        const error = err.message
        return res.status(401).json({
            message: "unauthorized",
            error

        })

    }

}

module.exports = authMiddleware;