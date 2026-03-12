require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateContent = require('./src/services/ai.service');

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => { //emit is used for 
  console.log("A is connected")
  socket.on("disconnect",()=>{
    console.log("A is disconnected")
  })
  socket.on("message",async(data)=>{
    console.log("message recieved ",data.prompt)
    const response = await generateContent(data.prompt);
    socket.emit("ai-message",response)
    console.log("response sent")
  })
});

httpServer.listen(3000,()=>{
    console.log("server is conneted on port 3000")
});

/*
  .io -> server
    socket -> a single user 

    on -> event listen karna
    emit -> event fire karna
*/