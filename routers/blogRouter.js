
const express = require('express');
const Blog = require('../models/blogs');
const nodemailer = require('nodemailer');
const router = express.Router();
const { jwtAuthMiddleWare } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const processImage = require('../middelware/imagsProcess');
const fs = require('fs');
const { sendsubscribemail, sendBulkEmails } = require('../mail/subscribeMail');
const path = require('path');
require('dotenv').config();
const { addBlogContent,
  updateBlogContent,
  getBlogContent,
  deleteBlogContent } = require('../routers/blogcontentRouter')


  router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
      const { title, content, status, shortDescription, links } = req.body;
  
      // Handle the coverImage path correctly when using memoryStorage
      const coverImage = req.file && req.file.path ? req.file.path.replace('public/', '').replace(/\\/g, '/') : '';
      const imagePath = `${process.env.BASE_URL}/${coverImage}`;
  
      // Retrieve the user ID from the authenticated user
      const userId = req.user.id;
  
      let newBlog;
  
      try {
          // Determine the value of the mail field based on the status
          const mail = status === 'public';
  
          // Create a new Blog instance with the provided data
          newBlog = new Blog({
              title,
              status,
              shortDescription,
              links,
              coverImage: imagePath,
              userId,
              mail,
          });
  
          // Save the blog to the database
          let BlogData = await newBlog.save();
  
          // After saving, add blog content using the blogId
          const blogContentResponse = await addBlogContent(BlogData._id, content);
  
          if (!blogContentResponse.success) {
              console.error('Error adding blog content:', blogContentResponse.error);
              return res.status(500).json({ error: 'Error saving blog content' });
          }
  
          // Send response
          res.status(201).json({ newBlog, blogContent: blogContentResponse.data });
  
          // If mail is true, send bulk emails
          if (mail && process.env.BULK_EMAIL_SEND !== 'false') {
               await sendBulkEmails(BlogData, process.env.FRONTEND_LINK + '/blog/' + newBlog._id);
          }
  
      } catch (error) {
          console.error('Error adding blog:', error);
  
          // If an error occurred, remove the uploaded image
          if (req.file && coverImage) {
              const filePath = path.join(__dirname, '../public', coverImage);
  
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
        const oldImagePath = blog.coverImage?.replace(`${process.env.BASE_URL}/`, '');
        const oldFilePath = oldImagePath ? path.join(__dirname, '../public', oldImagePath) : null;
  
        if (oldFilePath && fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old image:', err);
            else console.log('Old image deleted:', oldImagePath);
          });
        }
  
        // Update coverImage path
        const newCoverImage = req.file.path.replace('public/', '').replace(/\\/g, '/');
        blog.coverImage = `${process.env.BASE_URL}/${newCoverImage}`;
      }
  
      // Update blog details
      blog.title = title || blog.title;
      blog.status = status || blog.status;
      blog.shortDescription = shortDescription || blog.shortDescription;
      blog.links = links || blog.links;
  
      // Handle email notification logic
      if (!blog.mail && process.env.BULK_EMAIL_SEND !== 'false' && blog.status === 'public') {
        blog.mail = true;
        blog.createdAt = new Date();
        blog.updatedAt = new Date();
         await sendBulkEmails(blog.title + ' - New Blog Post', blog.shortDescription, process.env.FRONTEND_LINK + '/blog/' + blog._id);
      } else {
        blog.updatedAt = new Date();
      }
  
      // Save the updated blog
      await blog.save();
  
      // **Update Blog Content**
      if (content) {
        await updateBlogContent(blogId, content);
      }
  
      res.status(200).json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
  
      // Delete the new image if the update fails
      if (req.file) {
        const newFilePath = req.file.path.replace('public/', '');
        const filePathToDelete = path.join(__dirname, '../public', newFilePath);
  
        if (fs.existsSync(filePathToDelete)) {
          fs.unlink(filePathToDelete, (err) => {
            if (err) console.error('Error deleting new image after failed update:', err);
            else console.log('New image deleted due to error during update:', newFilePath);
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
  
      // Extract and delete the blog cover image if it exists
      if (blog.coverImage) {
        const imagePath = blog.coverImage.replace(`${process.env.BASE_URL}/`, '');
        const filePath = path.join(__dirname, '../public', imagePath);
  
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting image:', err);
            } else {
              console.log('Image deleted:', imagePath);
            }
          });
        }
      }
  
      // Delete associated blog content if exists
      const deletedBlogContent = await getBlogContent(blogId);
      if (deletedBlogContent) {
        await Blog.findByIdAndDelete(blogId);
        await deleteBlogContent(blogId);
        console.log('Blog content deleted:', deletedBlogContent);
      }
  
    
  
      // Return a success response
      res.status(200).json({ message: 'Blog post, content, and associated image deleted successfully' });
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

    // Fetch blog content using blogId
    let blogContentResponse = await getBlogContent(blogId);

    if (!blogContentResponse.success) {
      return res.status(500).json({ error: 'Error retrieving blog content' });
    }

    // Merge content into the response
    let blogData = {
      ...blogPost._doc,  // Spread the blog post data
      content: blogContentResponse.data.content  // Bind content from BlogContent
    };

    res.status(200).json(blogData);

  } catch (error) {
    console.error('Error retrieving blog post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the blog post' });
  }
});


Blog.createIndexes({ status: 1 });


router.get('/getAllBlogs', async (req, res) => {
  try {
    let { page, limit, status, title } = req.query;

    // Convert query parameters to numbers and set defaults
    page = parseInt(page, 10) || 1; // Fix: Use base 10
    limit = parseInt(limit, 10) || 5; // Fix: Use base 10

    if (page < 1) {
      return res.status(400).json({ error: 'Page number must be at least 1.' });
    }

    const skip = (page - 1) * limit;

    // Build the query object
    let query = {};
    if (status) query.status = status; // Filter by status
    if (title) query.title = { $regex: title, $options: 'i' }; // Case-insensitive title search
    const countPromise = Blog.countDocuments(query);

    // Fetch paginated blog data using aggregation
    const blogsPromise = Blog.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          createdAt: 1,
          coverImage: 1,
          updatedAt: 1,
          shortDescription: 1,
        }
      }
    ]).allowDiskUse(true); // Prevent memory limit errors

    const [count, blogs] = await Promise.all([countPromise, blogsPromise]);

    const totalPages = Math.ceil(count / limit);

    // Validate page number
    if (page > totalPages && totalPages !== 0) {
      return res.status(400).json({
        error: `Invalid page number. You requested page ${page}, but there are only ${totalPages} pages.`,
      });
    }

    res.json({
      count,
      data: blogs,
      totalPages,
      currentPage: page,
    });

  } catch (err) {
    console.error('Error fetching blogs:', err.message);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});


router.put('/addcomment/:id', async (req, res) => {
  try {
    const id = req.params?.id
    console.log(id);

    const { name, comment } = req.body
    if (name == '') return res.status(404).json({
      message: 'Name is Required'
    })
    if (comment == '') return res.status(404).json({
      message: 'Comment is Required'
    })
    const blog = await Blog.findById(id)


    if (!blog) return res.status(404).json({
      message: 'Blog not Found'
    })
    blog.comments.push({
      name, comment
    })
    res.status(201).json({
      message: 'Comment Added Successfully'
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.put('/updatecomment/:blogId/:commentId', jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }
  try {
    const { blogId, commentId } = req.params;
    const { name, email, phone, comment } = req.body;

    // Find the blog by its ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        message: 'Blog not Found'
      });
    }

    // Find the comment by its ID in the blog's comments array
    const commentToUpdate = blog.comments.id(commentId);
    if (!commentToUpdate) {
      return res.status(404).json({
        message: 'Comment not Found'
      });
    }
    commentToUpdate.status = true

    // Save the updated blog
    await blog.save();

    res.status(200).json({
      message: 'Comment Updated Successfully',
      updatedComment: commentToUpdate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deletecomment/:blogId/:commentId', jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }
  try {
    const { blogId, commentId } = req.params;

    // Find the blog by its ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        message: 'Blog not Found'
      });
    }

    // Find the index of the comment to delete
    const commentIndex = blog.comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        message: 'Comment not Found'
      });
    }

    // Remove the comment from the comments array
    blog.comments.splice(commentIndex, 1);

    // Save the updated blog
    await blog.save();

    res.status(200).json({
      message: 'Comment Deleted Successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});






module.exports = router;
