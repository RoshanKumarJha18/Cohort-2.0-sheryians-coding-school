const mongoose = require ('mongoose')


const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to Mongodb")
    }catch(err){
        console.log("error connecting to db",err)
    }
}

module.exports = connectDb;