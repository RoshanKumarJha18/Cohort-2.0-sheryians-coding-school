const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({ //schema for notes 
    title: String,
    content: String
})

const noteModel = mongoose.model('note',noteSchema); //model for notes


module.exports = noteModel;