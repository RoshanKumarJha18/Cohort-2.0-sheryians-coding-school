const express = require('express')
const authRoutes = require('./routes/auth.routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes);

module.exports = app