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

const loginController = async (req,res)=>{
    const { username, email, password } = req.body;
    if (!password || (!email && !username)) {
        return res.status(400).json({ message: 'Username/email and password are required' });
    }

    const user = await userModel.findOne({
        $or: [
            { email: email || null },
            { username: username || null }
        ]
    });

    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            message:"invalid password"
        })
    }
    const token = jwt.sign({userid:user._id},process.env.JWT_SECRET,{expiresIn:'1d'});
    res.cookie('token',token);

    res.status(200).json({
        message:"user logged in successfully",
        user:{
            _id:user._id,
            username:user.username,
            email:user.email
        },
        token
    })
}

module.exports = {
    registerController,
    loginController

};