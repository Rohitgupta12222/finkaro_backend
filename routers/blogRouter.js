
const express = require('express');
const Blog = require('../models/blogs');
const nodemailer = require('nodemailer');
const router = express.Router();
const { jwtAuthMiddleWare } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const processImage = require('../middelware/imagsProcess');
const fs = require('fs');
const {sendsubscribemail,sendBulkEmails} = require('../mail/subscribeMail');
const path = require('path');
require('dotenv').config();





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
      content,
      status,
      shortDescription,
      links,
      coverImage: imagePath,
      userId,
      mail,
    });

    // Save the blog to the database
    let BlogDAta = await newBlog.save();

    // If mail is true, send bulk emails
     res.status(201).json(newBlog);

    if (mail && process.env.BULK_EMAIL_SEND !== 'false') {
      await sendBulkEmails(title + 'New Blog Post', BlogDAta ,process.env.FRONTEND_LINK +'/#/blog/'+newBlog._id);
    }

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
      const oldImagePath = blog.coverImage.replace(`${process.env.BASE_URL}/`, '');
      const oldFilePath = path.join(__dirname, '../public', oldImagePath);

      // Delete the old image if it exists
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
          else console.log('Old image deleted:', oldImagePath);
        });
      }

      // Update the coverImage path with the new uploaded image
      const newCoverImage = req.file.path.replace('public/', '').replace(/\\/g, '/');
      blog.coverImage = `${process.env.BASE_URL}/${newCoverImage}`;
    }

    // Update other fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.status = status || blog.status;
    blog.shortDescription = shortDescription || blog.shortDescription;
    blog.links = links || blog.links;

    // Handle mail and updatedAt logic
    if (blog.mail === false) {
      if ( blog.mail == false && process.env.BULK_EMAIL_SEND !== 'false' && blog.status === 'public') {
        blog.mail = true;
        blog.createdAt = new Date();
        blog.updatedAt = new Date();
        await sendBulkEmails(blog.title + 'New Blog Post', blog.shortDescription ,process.env.FRONTEND_LINK +'/#/blog/'+blog._id);
      }
     
    
    } else {
      // If mail is not false, set mail to true and update updatedAt to current date
      blog.updatedAt = new Date();
    }

    await blog.save();
   

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
      const status = req.query.status; // Get the status query, optional
      const sortField = req.query.sortField || 'createdAt'; // Default sort field is createdAt
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Default is descending

      const skip = (page - 1) * limit;

      // Build the query with case-insensitive title search
      const query = {
          title: { $regex: title, $options: 'i' } // Case-insensitive title search
      };

      // Conditionally add the status filter to the query if provided
      if (status) {
          query.status = status;
      }

      // Create sorting object for Mongoose
      const sortOptions = { [sortField]: sortOrder };

      // Fetch blogs but exclude the 'content' field
      const [blogPosts, count] = await Promise.all([
          Blog.find(query)
              .select('-content') // Excludes 'content' field
              .skip(skip)
              .limit(limit)
              .sort(sortOptions), 
          Blog.countDocuments(query) // Count documents matching the query
      ]);

      // Return the response with paginated results
      res.json({
          count,
          data: blogPosts,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

router.put('/addcomment/:id', async (req, res) => {
  try {
    const id = req.params?.id
    console.log(id);
   
    const { name, comment } = req.body
    if(name == '')return  res.status(404).json({
      message: 'Name is Required'
    })
    if(comment == '')return  res.status(404).json({
      message: 'Comment is Required'
    })
    const blog = await Blog.findById(id)


    if(!blog) return  res.status(404).json({
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
  if (tokenUser?.role !== 'admin' ) {
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

router.delete('/deletecomment/:blogId/:commentId',jwtAuthMiddleWare, async (req, res) => {
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
