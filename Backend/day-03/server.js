const express = require("express");

const app = express(); // creating the server

//mini project to create , delete, update and get the notes from the postman using the express framework

//creating notes from post method
app.use(express.json()); // to parse the incoming request body as JSON

const notes = []; // creating an array to store the notes

//Method POST to add the note to the array
app.post("/notes", (req, res) => {
  notes.push(req.body); // adding the note to the array
  res.json({
    message: "Note added successfully",
  });
});

//Method DELETE to delete the note from the array
app.delete("/notes/:index", (req, res) => {
  const index = req.params.index;
  delete notes[index];
  res.json({
    message: "Note deleted successfully",
  });
});

//Method PATCH to update the note from the array
app.patch("/notes/:index", (req, res) => {
  const index = req.params.index;
  let { title } = req.body;
  notes[index].title = title;
  res.json({
    message: "Note updated successfully",
  });
});

//Method GET to get the notes from the array
app.get("/notes", (req, res) => {
  // getting the notes from the array
  res.json(notes);
});

app.listen(3000, () => {
  // starting the server on port 3000
  console.log("Server is running on port 3000");
});
