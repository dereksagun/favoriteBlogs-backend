const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, user: 1})
  return response.json(blogs)
})

blogRouter.post('/', userExtractor, async (request, response) => {
  const blog = request.body
  const user = request.user

  if(!blog.title || !blog.url){
    return response.status(400).end()
  }
  
  const updatedBlog = new Blog({
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes || 0,
    user: user._id
  })

  const savedBlog = await updatedBlog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  return response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = request.params.id
  const user = request.user
  
  const blogToDelete = await Blog.findById(id)
  
  if(blogToDelete && blogToDelete.user.toString() !== user._id.toString()){
    return response.status(200).json({error: 'user does not have permission to delete this blog'})
  }
  
  const deletedBlog = await Blog.findByIdAndDelete(id)
  return response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body

  let blog = await Blog.findById(id)
  blog.title = body.title
  blog.author = body.author
  blog.url = body.url
  blog.likes = body.likes
  
  const updatedBlog = await blog.save()
  response.status(200).json(updatedBlog)

})

module.exports = blogRouter