const express = require('express');

const app = express();// creating the server

//creating notes from post method
app.use(express.json()) // to parse the incoming request body as JSON

const notes =[];// creating an array to store the notes
app.post('/notes',(req,res)=>{
    notes.push(req.body); // adding the note to the array
    res.json({
         message:"Note added successfully"
    })
    
})
app.get('/notes',(req,res)=>{ // getting the notes from the array
    res.json({
        data:notes
    })
})

app.listen(3000,()=>{ // starting the server on port 3000
    console.log("Server is running on port 3000");
})