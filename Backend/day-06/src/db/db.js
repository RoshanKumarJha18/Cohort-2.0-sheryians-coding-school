require('dotenv').config();
const mongoose = require('mongoose');

const connectDb = () =>{
    mongoose.connect(process.env.MONGODB_URI).then(()=>{
        console.log('Connected to MongoDB');
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = connectDb;