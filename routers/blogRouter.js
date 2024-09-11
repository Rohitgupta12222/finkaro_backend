
const express = require('express');
const Blog = require('../models/blogs');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload =require('../middelware/multer');
const uploadDashboard = require('../middelware/dashboarMulter');
 const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
// const BASE_URL = 'https://finkaro-backend.onrender.com'; // Change this to your actual base URL
const fs = require('fs');
const path = require('path');

router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
  const { title, content, status, shortDescription, links } = req.body;
  const coverImage = req.file ? req.file.path.replace('public/', '') : ''; // Remove 'public/' prefix
  let imagepath =''
  if(coverImage){

     imagepath = `${BASE_URL}/${coverImage}`
  }

  // Log the request body and file information for debugging

  const userId = req.user.id
  try {
    const newBlog = new Blog({
      title,
      content,
      status,
      shortDescription,
      links,
      coverImage:imagepath,
      userId
    });



    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error adding blog:', error); // Log the error details for debugging
    res.status(500).json({ error: 'An error occurred while adding the blog' });
  }
});

router.put('/update/:blogId', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
  const { blogId } = req.params;
  const { title, content, status, shortDescription, links } = req.body;
  const coverImage = req.file ? req.file.path.replace('public/', '') : ''; // Remove 'public/' prefix
  let imagepath =''
  if(coverImage){

     imagepath = `${BASE_URL}/${coverImage}`
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content, status, shortDescription, links, coverImage:imagepath, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the blog' });
  }
});


router.delete('/delete/:blogId', jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user;
  
  // Ensure only admin can delete
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  try {
    const { blogId } = req.params;

    // Find the blog post by ID
    const blog = await Blog.findById(blogId);

    // Check if the blog post exists
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Helper function to delete a file
    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, '../public/uploads/', path.basename(filePath));
        fs.unlink(fullPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting file:', err);
          }
        });
      }
    };

    // Delete the cover image if it exists
    if (blog.coverImage) {
      deleteFile(blog.coverImage);
    }

    // Delete the blog post from the database
    await Blog.findByIdAndDelete(blogId);

    // Respond with a success message
    res.status(200).json({ message: 'Blog post and associated cover image deleted successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'An error occurred while deleting the blog' });
  }
});


router.get('/get/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the blog post by ID
    let blogPost = await Blog.findById(blogId);

    // Check if the blog post was found
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog not found' });
    }

 
    res.status(200).json(blogPost);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'An error occurred while retrieving the blog post' });
  }
});
router.get('/getAllBlogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    
    const skip = (page - 1) * limit;

    // Build the query with case-insensitive title search using a regular expression
    const query = title ? { title: { $regex: title, $options: 'i' } } : {};

    // Find blog posts based on title and apply pagination
    const [blogPosts, count] = await Promise.all([
      Blog.find(query).skip(skip).limit(limit),
      Blog.countDocuments(query) // Count documents matching the query
    ]);

    // Return the response with paginated results
    res.status(200).json({
      count,
      data: blogPosts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while retrieving blog posts' });
  }
});



module.exports = router;
