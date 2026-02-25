const express = require("express");
const connectToDb = require("./src/db/db");
const noteModel = require("./src/models/notes.model");

const app = express();
app.use(express.json());

app.get("/notes", async (req, res) => {
  const data = await noteModel.find();
  res.json({
    message: "Notes fetched successfully",
    data,
  });
});

app.post("/notes", (req, res) => {
  const { title, content } = req.body;
  noteModel.create({ title, content });
  res.json({
    message: "Note created successfully",
  });
});

app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  await noteModel.findByIdAndDelete({
    _id: id,
  });
  res.json({
    message: "Note deleted successfully",
  });
});

app.patch("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  await noteModel.findByIdAndUpdate(
    {
      _id: id,
    },
    {
      title: title,
    },
  );
  res.json({
    message: "Note updated successfully",
  });
});
connectToDb();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
