const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiservice = require('../services/ai.service')
const messageModel = require('../models/message.model')
const { createMemory, queryMemory } = require('../services/vectordb.service')





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
           const userResult = await messageModel.create({
                user:socket.user._id,
                chat:messagePayload.chat,
                content:messagePayload.content,
                role:'user'
            })
            
          const vectors = await aiservice.generateVector(messagePayload.content)
          const memory = await queryMemory({
            queryVector:vectors,
            limit:1,
            metadata:{
                user:socket.user._id,
                chat:messagePayload.chat
            }
          })
          await createMemory({
            vectors:vectors,
            messageid:userResult._id,
            metadata:{
                user:socket.user._id,
                chat:messagePayload.chat,
                content:messagePayload.content
            }
          })

          
          console.log(memory)
            const chatHistory = await messageModel.find({chat:messagePayload.chat})
            
            const response = await aiservice.generateResponse(chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }))
           const aiResult = await messageModel.create({
                user:socket.user._id,
                chat:messagePayload.chat,
                content:response,
                role:'model'
            })
            const responseVectors = await aiservice.generateVector(response)
            await createMemory({
            vectors:responseVectors,
            messageid:aiResult._id,
            metadata:{
                user:socket.user._id,
                chat:messagePayload.chat,
                content:response
            }
          })

            socket.emit('ai-message',{
                response,
                chat:messagePayload.chat
            })
       })
    })

    

    
}

module.exports = initSocketServer;