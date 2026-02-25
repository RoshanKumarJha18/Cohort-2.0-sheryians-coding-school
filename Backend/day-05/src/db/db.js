const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const connectToDb = ()=>{
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log('Connected to MongoDB');
    })
}

module.exports = connectToDb;