
const express = require('express');
const Blog = require('../models/blogs');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload =require('../middelware/multer')
 const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
// const BASE_URL = 'https://finkaro-backend.onrender.com'; // Change this to your actual base URL

router.post('/add',jwtAuthMiddleWare, async (req, res) => {
    try {
      const tokenUser = req.user
      if(tokenUser?.role !== 'admin')   return res.status(40).json({ message: 'User is not a admin ' });


   await   upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err });
        }

        console.log(req.file , 'req.file ================= ',  req.file.path  );


        let path =  req.file ? req.file.path.replace('public/', '') : null;

    
        const newBlog = new Blog({
          title: req.body.title,
          content: req.body.content,
          userId: req.body.userId,
          coverImage: path,// Save the uploaded image path
          links: req.body.links, // Handle any additional fields
          status: req.body.status,
          shortDescription:req.body.shortDescription,
          mail:req.body.status === true ? true : false,
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

router.put('/update/:blogId',jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user
  if(tokenUser?.role !== 'admin')   return res.status(40).json({ message: 'User is not a admin ' });

  
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
        shortDescription:req.body.shortDescription,
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

router.delete('/delete/:blogId', jwtAuthMiddleWare,async (req, res) => {
  const tokenUser = req.user
  if(tokenUser?.role !== 'admin')   return res.status(40).json({ message: 'User is not a admin ' });

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

router.get('/get/:blogId', async (req, res) => {
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

    // Modify blog posts to include full coverImage URL
    const updatedBlogPosts = blogPosts.map(blog => {
      return {
        ...blog._doc,
        coverImage: blog.coverImage ? `${BASE_URL}/${blog.coverImage}` : null // Append the base URL to the coverImage
      };
    });

    // Return the response with paginated results
    res.status(200).json({
      count,
      data: updatedBlogPosts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while retrieving blog posts' });
  }
});



module.exports = router;
