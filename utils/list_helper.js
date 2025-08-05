const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if(blogs.length === 0){
    return 0
  }
  
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)

}

const favoriteBlog = (blogs) => {
  if(blogs.length === 0){
    return {}
  }
  return blogs.reduce((favorite, blog) => {
    if(!favorite.likes) return blog
    
    if(blog.likes >= favorite.likes){
      return blog
    } else {
      return favorite
    }
  }, {})
}

module.exports = { dummy, totalLikes, favoriteBlog }