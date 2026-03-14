require("dotenv").config();
const app = require("./src/app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateContent = require("./src/services/ai.service");

const httpServer = createServer(app);
const io = new Server(httpServer, {
   cors:{
    origin:"http://localhost:5173"
   }
});

const chatHistory = [];

io.on("connection", (socket) => {
  //emit is used for
  console.log("A is connected");
  socket.on("disconnect", () => {
    console.log("A is disconnected");
  });
  socket.on("message", async (data) => {
    console.log("message recieved ", data.prompt);
    chatHistory.push({ //this is saving question in the history low level memory storage
      role: "user",
      parts: [{ text: data.prompt }],
    });

    const response = await generateContent(chatHistory);
    chatHistory.push({
      role:"model",
      parts:[{text:response}]
    })
    socket.emit("ai-message", response);
    console.log("response sent");
  });
});

httpServer.listen(3000, () => {
  console.log("server is conneted on port 3000");
});

/*
  .io -> server
    socket -> a single user 

    on -> event listen karna
    emit -> event fire karna
*/
