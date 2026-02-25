const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
 // connecting database from db.js file to the server.js
const connectToDb = () => {
  mongoose
    .connect(
      process.env.MONGODB_URI,
    )
    .then(() => {
      console.log("Connected to MongoDB");
    });
};

module.exports = connectToDb;