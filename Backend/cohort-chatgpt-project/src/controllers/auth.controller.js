const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




const registerController = async (req,res)=>{
    const{fullName:{firstName,lastName},email,password} = req.body;
    const exsistingUser = await userModel.findOne({email});
    
    if(exsistingUser){
        return res.status(404).json({
            message:"user already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const user = await userModel.create({
        fullName:{firstName,lastName},
        email,
        password:hashedPassword
    })
    const token = jwt.sign({userid:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
    res.cookie('token',token);

    res.status(201).json({
        message:"user created successfully",
        user:{
            fullName:{firtName:user.fullName.firstName,lastName:user.fullName.lastName},
            email:user.email
        },
        token
    })
    

    
}
module.exports = {
    registerController
};