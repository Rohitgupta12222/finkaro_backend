
const express = require('express');
const Blog = require('../models/blogs');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const  upload = require('../middelware/multer');
const  processImage = require('../middelware/imagsProcess');
const uploadDashboard = require('../middelware/dashboarMulter');
const fs = require('fs');
const path = require('path');


router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
  const { title, content, status, shortDescription, links } = req.body;

  // Handle the coverImage path correctly when using memoryStorage
  const coverImage = req.file && req.file.path ? req.file.path.replace('public/', '') : '';
  const imagePath = `${process.env.BASE_URL}/${coverImage}`;

  // Retrieve the user ID from the authenticated user
  const userId = req.user.id;

  let newBlog;

  try {
    // Create a new Blog instance with the provided data
    newBlog = new Blog({
      title,
      content,
      status,
      shortDescription,
      links,
      coverImage: imagePath,
      userId,
    });

    // Save the blog to the database
    await newBlog.save();

    // Return the newly created blog in the response
    res.status(201).json(newBlog);
  } catch (error) {
    // Log any errors and send a 500 error response
    console.error('Error adding blog:', error);
    
    // If an error occurred, remove the uploaded image
    if (req.file && coverImage) {
      const filePath = path.join(__dirname, '../public', coverImage);
      
      // Check if the file exists before trying to delete it
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('Uploaded image deleted due to error:', coverImage);
          }
        });
      }
    }

    res.status(500).json({ error: 'An error occurred while adding the blog' });
  }
});
router.put('/update/:id', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
  const { title, content, status, shortDescription, links } = req.body;
  const blogId = req.params.id;

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // If a new image is uploaded, delete the old image
    if (req.file) {
      const oldImagePath = blog.coverImage.replace(process.env.BASE_URL + '/', '');
      const oldFilePath = path.join(__dirname, '../public', oldImagePath);

      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err);
          } else {
            console.log('Old image deleted:', oldImagePath);
          }
        });
      }

      // Update the coverImage path with the new uploaded image
      const newCoverImage = req.file.path.replace('public/', '');
      blog.coverImage = `${process.env.BASE_URL}/${newCoverImage}`;
    }

    // Update the other fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.status = status || blog.status;
    blog.shortDescription = shortDescription || blog.shortDescription;
    blog.links = links || blog.links;

    // Save the updated blog post to the database
    await blog.save();

    // Return the updated blog post
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    
    // If an error occurs after uploading the new image, delete the new image
    if (req.file) {
      const newFilePath = req.file.path.replace('public/', '');
      const filePathToDelete = path.join(__dirname, '../public', newFilePath);

      if (fs.existsSync(filePathToDelete)) {
        fs.unlink(filePathToDelete, (err) => {
          if (err) {
            console.error('Error deleting new image after failed update:', err);
          } else {
            console.log('New image deleted due to error during update:', newFilePath);
          }
        });
      }
    }

    res.status(500).json({ error: 'An error occurred while updating the blog' });
  }
});

router.delete('/delete/:id', jwtAuthMiddleWare, async (req, res) => {
  const blogId = req.params.id;

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Extract the image path from the blog post
    const imagePath = blog.coverImage.replace(process.env.BASE_URL + '/', '');
    const filePath = path.join(__dirname, '../public', imagePath);

    // Delete the blog post from the database
    await Blog.findByIdAndDelete(blogId);

    // If the blog post had an associated image, delete the image file
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        } else {
          console.log('Image deleted:', imagePath);
        }
      });
    }

    // Return a success response
    res.status(200).json({ message: 'Blog post and associated image deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'An error occurred while deleting the blog post' });
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
