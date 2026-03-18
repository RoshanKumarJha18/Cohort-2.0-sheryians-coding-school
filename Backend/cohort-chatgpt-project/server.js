require('dotenv').config();
const app = require('./src/app');
const connectDb = require('./src/db/db');
const initSocketServer = require('./src/sockets/message.socket');
const httpServer = require('http').createServer(app);



connectDb();
initSocketServer(httpServer)


httpServer.listen(3000,()=>{
    console.log("server connected succesfully on port 3000")
})