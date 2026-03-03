const express = require("express");
const router = require("./routes/auth.route");

const app = express();
app.use(express.json()); // this middleware is used for parsing the json data which is coming from the client side in the request body

app.use("/auth", router); //this is middleare which says that the api routes is /auth and then it will go to auth.route.js file and check for the routes there

module.exports = app;
