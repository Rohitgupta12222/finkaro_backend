
const express = require('express');
const Blog = require('../models/blogs');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const uploadDashboard = require('../middelware/dashboarMulter');
const cloudinary = require('../middelware/Cloudinary'); // Adjust the path to your Cloudinary configuration

const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
// const BASE_URL = 'https://finkaro-backend.onrender.com'; // Change this to your actual base URL
const fs = require('fs');
const path = require('path');

router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
  const { title, content, status, shortDescription, links } = req.body;
  const coverImage = req.file ? req.file.path.replace('public/', '') : ''; // Remove 'public/' prefix

  // Log the request body and file information for debugging

  const userId = req.user.id
  try {
    const newBlog = new Blog({
      title,
      content,
      status,
      shortDescription,
      links,
      coverImage: coverImage,
      userId
    });



    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error adding blog:', error); // Log the error details for debugging
    res.status(500).json({ error: 'An error occurred while adding the blog' });
  }
});
// ss

router.put('/update/:blogId', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
  const { blogId } = req.params;
  const { title, content, status, shortDescription, links } = req.body;
  const coverImage = req.file ? req.file.path : ''; // Cloudinary URL

  let updateFields = { title, content, status, shortDescription, links, updatedAt: Date.now() };

  try {
    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    // Check if the blog exists
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // If a new cover image is uploaded, delete the old one from Cloudinary
    if (coverImage) {
      updateFields.coverImage = coverImage;

      // Delete the old image from Cloudinary if it exists
      if (blog.coverImage) {
        const publicId = 'uploads/'+blog.coverImage.split('/').pop().split('.')[0]; // Extract the public ID

        console.log(' publicId' ,publicId);
        await cloudinary.uploader.destroy(publicId, function (error, result) {
          if (error) {
            console.error('Error deleting old image from Cloudinary:', error);
          } else {
            console.log('Old image deleted from Cloudinary:', result);
          }
        });
      }
    }

    // Update the blog with the new data
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateFields,
      { new: true }
    );

    // Send the updated blog as a response
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

    if (blog.coverImage) {
      const publicId = blog.coverImage.split('/').pop().split('.')[0]; 
      await cloudinary.uploader
        .destroy(['uploads/' + publicId],
          { type: 'upload', resource_type: 'image' })
        .then(console.log);
    }

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
