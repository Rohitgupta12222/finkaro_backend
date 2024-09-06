
const express = require('express');
const Blog = require('../models/blogs');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload =require('../middelware/multer')


router.post('/addBlog', async (req, res) => {
    try {

   await   upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err });
        }
    
        const newBlog = new Blog({
          title: req.body.title,
          content: req.body.content,
          userId: req.body.userId,
          coverImage: req.file ? req.file.path : null, // Save the uploaded image path
          links: req.body.links, // Handle any additional fields
          status: req.body.status
        });

   
        const response = await newBlog.save()
        res.status(201).json({ response: response,message:"Blog created" })
      });


  } catch (message) {

    console.log('message ', message);
    res.status(500).json({
      message: "internal Server message",
      message: message
    })
  }
}
)

router.put('/updateBlog/:blogId', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err });
    }

    try {
      const { blogId } = req.params;
      const updates = {
        title: req.body.title,
        content: req.body.content,
        links: req.body.links ? JSON.parse(req.body.links) : [], // Parse JSON string if necessary
        status: req.body.status,
        updatedAt: Date.now()
      };

      if (req.file) {
        updates.coverImage = req.file.path; // Save the new image path if a file is uploaded
      }

      const updatedBlog = await Blog.findByIdAndUpdate(blogId, updates, { new: true });

      if (!updatedBlog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.status(200).json(updatedBlog);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the blog' });
    }
  });
});

router.delete('/deleteBlog/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find and delete the blog post by ID
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    // Check if the blog post was found and deleted
    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'An error occurred while deleting the blog' });
  }
});

router.get('/getBlog/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find the blog post by ID
    const blogPost = await Blog.findById(blogId);

    // Check if the blog post was found
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Respond with the blog post data
    res.status(200).json(blogPost);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'An error occurred while retrieving the blog post' });
  }
});

router.get('/getAllBlogs', async (req, res) => {
  try {
    // Find all blog posts
    const blogPosts = await Blog.find();
    const count = await Blog.count();

    // Respond with the list of blog posts
    res.status(200).json({"count":count,"result": blogPosts});
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'An error occurred while retrieving blog posts' });
  }
});


module.exports = router;
