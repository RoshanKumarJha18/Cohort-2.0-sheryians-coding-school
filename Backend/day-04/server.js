const express = require("express");
const connectToDb = require('./src/db/db')

const app = express();

const notes = [];
connectToDb();  // connecting to the database from server.js file
app.use(express.json());

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.post("/notes", (req, res) => {
  notes.push(req.body);
  console.log(req.body);
  res.json({
    message: "Note added successfully",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
