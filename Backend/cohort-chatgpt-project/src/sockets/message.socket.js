const { Server } = require("socket.io");

const initSocketServer = (httpServer)=>{
    const io = new Server(httpServer,{})
    io.on("connection",(socket)=>{
        console.log("new Socket Connection",socket.id)
    })
}

module.exports = initSocketServer;