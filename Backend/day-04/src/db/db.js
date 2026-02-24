const mongoose = require("mongoose");
 // connecting database from db.js file to the server.js
const connectToDb = () => {
  mongoose
    .connect(
      "",
    )
    .then(() => {
      console.log("Connected to MongoDB");
    });
};

module.exports = connectToDb;
