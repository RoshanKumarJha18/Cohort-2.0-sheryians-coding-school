const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiservice = require('../services/ai.service')
const messageModel = require('../models/message.model')





const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {})

    //middleware [protected routes]
    io.use(async (socket, next) => {
        const { token } = cookie.parse(socket.handshake.headers?.cookie || "") //this is used for gettng token in socket
        if (!token) {
            next(new Error("Authentication Error : no token provided"))
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.userid);
            socket.user = user
            next()
        } catch (err) {
            next(new Error("Authentication Error : Invalid token"))
        }
    })

    io.on("connection",(socket) => {

       socket.on('user-message',async(messagePayload)=>{
           
            await messageModel.create({
                user:socket.user._id,
                chat:messagePayload.chat,
                content:messagePayload.content,
                role:'user'
            })
            const chatHistory = await messageModel.find({chat:messagePayload.chat})
            
            const response = await aiservice.generateResponse(chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }))
            await messageModel.create({
                user:socket.user._id,
                chat:messagePayload.chat,
                content:response,
                role:'model'
            })
            socket.emit('ai-message',{
                response,
                chat:messagePayload.chat
            })
       })
    })

    

    
}

module.exports = initSocketServer;