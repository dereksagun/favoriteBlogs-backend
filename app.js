const express = require('express')
const config = require('./utils/config')
const blogRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const app = express()

const mongooseURL = config.MONGODB_URI
mongoose.connect(mongooseURL)

app.use(express.json())
app.use('/api/blogs', blogRouter)

module.exports = app

