const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true    
    },
    password:{
        type:String
    }
})

const authModel = mongoose.model('Auth',authSchema)

module.exports = authModel;