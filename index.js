require('dotenv').config()
const express = require('express')
const Blog = require('./models/blog')
const blogRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const app = express()

const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(express.json())
app.use('/api/blogs', blogRouter)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})