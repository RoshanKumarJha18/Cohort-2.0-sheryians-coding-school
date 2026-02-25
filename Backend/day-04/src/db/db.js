const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
 // connecting database from db.js file to the server.js
const connectToDb = () => {
  mongoose
    .connect(
      "mongodb+srv://roshanjha20041118_db_user:qd7SDU6ndELchrK3@cluster0.g8fvhrw.mongodb.net/cohort",
    )
    .then(() => {
      console.log("Connected to MongoDB");
    });
};

module.exports = connectToDb;
