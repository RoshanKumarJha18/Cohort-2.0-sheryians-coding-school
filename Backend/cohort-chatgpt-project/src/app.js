const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/auth.route');


// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth',authRoutes);


module.exports = app;