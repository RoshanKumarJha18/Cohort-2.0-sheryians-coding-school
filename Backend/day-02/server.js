const express = require('express');

const app = express(); // create an server

app.get('/',(req,res)=>{
    res.send('Hello from Express');
})
app.get('/about',(req,res)=>{
    res.send('This is the about page');
})

app.listen(3000,()=>{ //calling the server
    console.log('Server is running on port 3000');
})