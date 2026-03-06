const express = require('express');
const router = express.Router();
const authModel = require('../models/auth.model');
const jwt = require('jsonwebtoken');
const cookies = require('cookie-parser');


router.post('/register',async (req,res)=>{
    const {username,password} = req.body;

    const existingUser = await authModel.findOne({
        username:username
    })
    if(existingUser){
        return res.status(409).json({
            message:"User already exists"
        })
    }
    const userauthModel = await authModel.create({username,password})
    
    const token = jwt.sign({
        id:userauthModel._id
    },process.env.JWT_SECRET)

    res.cookie("token",token)
    
    
    res.status(201).json({
        message:"User registered successfully",
        data:userauthModel
    })
})

router.post('/login',async (req,res)=>{
    const {username,password} = req.body;

    const user = await authModel.findOne({
        username:username
    })
   
    if(!user){
        return res.status(401).json({
            message:"Invalid username"
        })
    }
    const validPassword = password === user.password;

    if(!validPassword){
        return res.status(401).json({
            message:"Invalid password"
        })
    }
    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET,{expiresIn:"1h"})
    res.cookie("token",token)
    res.status(200).json({
        message:"User logged in successfully",
    })
   
})

router.get('/users',async(req,res)=>{
    const {token} = req.cookies;
    
   try{
     const decode = jwt.verify(token,process.env.JWT_SECRET);
     if(!decode){
        return res.status(401).json({
            message:"token is not valid"
        })
     }
    const user = await authModel.findOne({
        _id:decode.id
    }).select("-password -__v")
    if(!user){
        return res.status(401).json({
            message:"User not found"
        })
        }
    
      return res.status(200).json({
            message:"User found",
            data:user
        })  
    
   }catch(err){
    return res.status(401).json({
        message:"Invalid token"
    })
   }
})

router.get('/logout',(req,res)=>{
    res.clearCookie("token");
    res.status(200).json({
        message:"User logged out successfully"
    })
})

module.exports = router;