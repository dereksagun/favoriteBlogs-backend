const { test, after, beforeEach } = require('node:test')
const supertest = require('supertest')
const assert = require('node:assert')
const Blog = require('../models/blog')
const app = require('../app')
const mongoose = require('mongoose')
const User = require('../models/user')

const api = supertest(app)
const initialBlogs = [{
  title: 'title1',
  author: 'author1',
  url: 'url1',
  likes: 1
},
{
  title: 'title2',
  author: 'author2',
  url: 'url2',
  likes: 2
}]

let token
let userId

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
  await User.deleteMany({})

  const user = new User({username: 'username', name: 'name', password: 'password'})
  const addedUser = await api
    .post('/api/users')
    .send({
      username: 'username', 
      name: 'name', 
      password: 'password'
    })
  userId = addedUser.body.id
  
  const response = await api
    .post('/api/login')
    .send({
      username: 'username', 
      password: 'password'
    })
    
  token = response.body.token
})

test('correct amount of blogs', async () => {
  const blogs = await Blog.find({})

  const results = await api
    .get('/api/blogs')
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(results.body.length, blogs.length)

})

test('blog posts are returned with id not _id', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach(blog => {
    assert(blog.id)
    assert(!blog._id)
  })
})

test('adding a new blog post', async () => {
  const blogsBefore = await Blog.find({})

  const newBlog = {
    title: 'title3',
    author: 'author3',
    url: 'url3',
    likes: 3
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)

  const blogsAfter = await Blog.find({})

  assert.strictEqual(blogsBefore.length + 1, blogsAfter.length)
  
  const titles = blogsAfter.map(b => b.title)
  assert(titles.includes(newBlog.title))

  const authors = blogsAfter.map(b => b.author)
  assert(authors.includes(newBlog.author))

  const urls = blogsAfter.map(b => b.url)
  assert(urls.includes(newBlog.url))

  const likes = blogsAfter.map(b => b.likes)
  assert(likes.includes(newBlog.likes))

})

test.only('if like does not exist, then set to 0', async () => {
  const newBlog = {
    title: 'title3',
    author: 'author3',
    url: 'url3'
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
  const response = await Blog.find({})
  
  const addedBlog = response.find(blog => blog.title === newBlog.title)
  
  assert.strictEqual(addedBlog.likes, 0)

})

test.only('sends 400 error if title is missing', async () => {
  const newBlog = {
    author: 'author3',
    url: 'url3',
    likes: 0
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test.only('sends 400 error if url is missing', async () => {
  const newBlog = {
    title: 'title3',
    author: 'author3',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test.only('deleting a blog post', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0].toJSON()

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  let ids = blogsAtEnd.map(blog => blog.toJSON().id)
  
  assert(!ids.includes(blogToDelete.id))
  assert.strictEqual(blogsAtStart.length, blogsAtEnd.length + 1)

})

test.only('updating a blog post', async () => {
  //test if we can find the blog
  //test if the same size

  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0].toJSON()
  const newBlog = {
    title: 'title3',
    author: 'author3',
    url: 'url3',
    likes: 0
  }
  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtStart.length,blogsAtEnd.length)
  
  const updatedBlog = await Blog.findById(blogToUpdate.id)

  assert.strictEqual(updatedBlog.title, newBlog.title)
  assert.strictEqual(updatedBlog.author, newBlog.author)
  assert.strictEqual(updatedBlog.url, newBlog.url)
  assert.strictEqual(updatedBlog.likes, newBlog.likes)



})



after(async () => {
  await mongoose.connection.close()
})