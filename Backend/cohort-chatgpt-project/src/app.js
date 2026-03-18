const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/auth.route');
const chatRoutes = require('../src/routes/chat.routes');



// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);


module.exports = app;