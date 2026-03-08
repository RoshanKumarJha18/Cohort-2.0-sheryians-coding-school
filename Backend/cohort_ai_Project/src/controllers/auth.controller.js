const authModel = require('../models/auth.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const registerController = async (req,res)=>{
    const {username,password} = req.body;

    const existingUser = await authModel.findOne({
        username
    })

    if(existingUser){
        return res.status(400).json({message:'Username already exists'})
    }

    const newUser = await authModel.create({
        username,
        password:await bcrypt.hash(password,10)
    })

    const token = jwt.sign({
        userId:newUser._id
    },process.env.JWT_SECRET,{
        expiresIn:'1h'
    })
    res.cookie('token',token)
    
    res.status(201).json({message:'User registered successfully',user:newUser,token})
}

const loginController = async (req,res)=>{
    const {username,password} = req.body;
    const user = await authModel.findOne({
        username
    })

    if(!user){
        return res.status(400).json({message:'User not found'})
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({message:'Invalid password'})
    }
    const token = jwt.sign({
        userId:user._id
    },process.env.JWT_SECRET,{
        expiresIn:'1h'
    })
    res.cookie('token',token)
    res.status(200).json({message:'Login successful',user,token})
}


module.exports = {
    registerController,
    loginController
}