const app = require('./src/app');
const http = require('http');
const httpServer = http.createServer(app);
const initSocketServer = require('./src/sockets/message.socket.js');




initSocketServer(httpServer);

httpServer.listen(3000,()=>{
    console.log('Server is running on port 3000');
})