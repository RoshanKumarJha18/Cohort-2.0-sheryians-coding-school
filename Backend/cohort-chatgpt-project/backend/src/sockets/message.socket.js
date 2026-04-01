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

    io.on("connection", (socket) => {

        socket.on('user-message', async (messagePayload) => {
            
            // const userResult = await messageModel.create({
            //     user: socket.user._id,
            //     chat: messagePayload.chat,
            //     content: messagePayload.content,
            //     role: 'user'
            // })

            // const vectors = await aiservice.generateVector(messagePayload.content)

            const[userResult, vectors] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: messagePayload.content,
                    role: 'user'
                }),
                aiservice.generateVector(messagePayload.content)
            ])

           

            let [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        user: socket.user._id,
                        chat: messagePayload.chat
                    }
                }).catch(() => []),
                messageModel.find({ chat: messagePayload.chat }).sort({ createdAt: 1 }).limit(20).lean().then(results => results.reverse())
            ]);

            // If there is no chat-specific memory, fall back to global memory search so generic terms like "Express" can be answered.
            if (!memory.length) {
                memory = await queryMemory({
                    queryVector: vectors,
                    limit: 3
                }).catch(() => []);
            }

            
            // const memory = await queryMemory({
            //     queryVector: vectors,
            //     limit: 3,
            //     metadata: {
            //         user: socket.user._id,

            //     }
            // })

           

            // const chatHistory = (await messageModel.find({ chat: messagePayload.chat }).sort({ createdAt: 1 }).limit(20).lean()).reverse()
           
        const memoryText = memory.length ? memory.map((i, index) => `${index + 1}. ${i.metadata.content}`).join('\n') : ''
        const chatText = chatHistory.map(item => `${item.role}: ${item.content}`).join('\n')

        const prompt = `You are a helpful assistant.
        First, try to use retrieved long-term memory and recent chat history to answer the user.
        If no retrieved memory is available, answer directly based on general knowledge.
        If the user asks about a general concept (like Express.js), provide a concise explanation.

        ${memoryText ? `Long-term memory:\n${memoryText}\n\n` : ''}Recent conversation:\n${chatText}\n\nUser question: ${messagePayload.content}\nAssistant:`

            const response = await aiservice.generateResponse(prompt)
              await createMemory({
                vectors: vectors,
                messageid: userResult._id,
                metadata: {
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: messagePayload.content
                }
            })

            const [aiResult, responseVectors] = await Promise.all([
                messageModel.create({
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: response,
                    role: 'model'
                }),
                aiservice.generateVector(response)
            ])

            // const aiResult = await messageModel.create({
            //     user: socket.user._id,
            //     chat: messagePayload.chat,
            //     content: response,
            //     role: 'model'
            // })
            // const responseVectors = await aiservice.generateVector(response)


            await createMemory({
                vectors: responseVectors,
                messageid: aiResult._id,
                metadata: {
                    user: socket.user._id,
                    chat: messagePayload.chat,
                    content: response
                }
            })

            socket.emit('ai-message', {
                response,
                chat: messagePayload.chat
            })
        })
    })




}

module.exports = initSocketServer;