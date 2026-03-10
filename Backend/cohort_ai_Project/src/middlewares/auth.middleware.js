const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");

const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access please Login First",
    });
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await authModel.findOne({
        _id: decoded.userId,
    })
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({
        message: "Invalid token, please login again",
    })
  }
}

module.exports = authenticateUser;