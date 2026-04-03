const {Server} = require('socket.io');
const langAgent = require('../services/agent.service');
const initSocketServer = (httpServer)=>{
    const io = new Server(httpServer, {});

    io.on('connection', (socket) => {
        socket.on("user-message",async (message)=>{
           langAgent(message);
        })

    });
}

module.exports = initSocketServer;