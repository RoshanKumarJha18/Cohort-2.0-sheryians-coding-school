const express = require('express');
const router = express.Router();
const authModel = require('../models/auth.model');


router.post('/register',async (req,res)=>{
    const data = req.body;
    const userauthModel = await authModel.create(data)
    console.log(userauthModel)
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
    res.status(200).json({
        message:"User logged in successfully",
    })
   
})



module.exports = router;