
const express = require('express');
const Course = require('../models/course');
const router = express.Router();
const path = require('path')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const fs = require('fs'); // To delete files if necessary
const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
const cloudinary = require('../middelware/Cloudinary'); // Adjust the path to your Cloudinary configuration

router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
    try {
        const tokenUser = req.user
        if (tokenUser?.role !== 'admin') return res.status(40).json({ message: 'User is not a admin ' });

        const coverImage = req.file ? req.file.path.replace('public/', '') : ''; // Remove 'public/' prefix
                   const newCourse = new Course({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                duration: req.body.duration,
                lessons: req.body.lessons,  // Assuming lessons will be passed as an array in req.body
                coverImage,  // Save the uploaded image path
                published: req.body.published,
                enrolledStudents: req.body.enrolledStudents || [],  // Default to an empty array if not provided
                mail: req.body.published === 'public' ? true : false,  // Conditionally set mail flag
            });

             const response = await newCourse.save()
            res.status(201).json({ response: response, message: "Course created" })
    

    } catch (message) {

        console.log('message ', message);
        res.status(500).json({
            message: "internal Server message",
            message: message
        })
    }
}
)
router.put('/update/:id', jwtAuthMiddleWare, upload.single('coverImage'), async (req, res) => {
  try {
      const tokenUser = req.user;
      if (tokenUser?.role !== 'admin') {
          return res.status(401).json({ message: 'User is not an admin' });
      }

      const course = await Course.findById(req.params.id);
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }
      const coverImage = req.file ? req.file.path : ''; // Cloudinary URL


      // Initialize the fields to update
      const updateFields = {
          title: req.body.title || course.title,
          description: req.body.description || course.description,
          price: req.body.price || course.price,
          duration: req.body.duration || course.duration,
          lessons: req.body.lessons || course.lessons,
          published: req.body.published || course.published,
          mail: req.body.published === 'public' ? true : course.mail, // Conditionally update mail field
          updatedAt: Date.now() // Update timestamp
      };

      if (coverImage) {
        updateFields.coverImage = coverImage;
  
        // Delete the old image from Cloudinary if it exists
        if (course.coverImage) {
          const publicId = 'uploads/'+course.coverImage.split('/').pop().split('.')[0]; // Extract the public ID
  
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
  

      // Update the course
      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateFields, { new: true });

      if (!updatedCourse) {
          return res.status(404).json({ message: 'Course not found' });
      }

      res.status(200).json({ updatedCourse, message: "Course updated successfully" });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get('/getcourses', async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1
      const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
      const title = req.query.title || ''; // Get the title query (default is an empty string)
      
      const skip = (page - 1) * limit;
  
      // Build the query with case-insensitive title search using a regular expression
      const query = title ? { title: { $regex: title, $options: 'i' } } : {};
  
      // Find Course posts based on title and apply pagination
      const [courses, count] = await Promise.all([
        Course.find(query).skip(skip).limit(limit),
        Course.countDocuments(query) // Count documents matching the query
      ]);
  
      // Return the response with paginated results
      res.status(200).json({
        count,
        data: courses
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred while retrieving courses' });
    }
  });


router.get('/getcourses/:id', async (req, res) => {
    try {
        // Extract course ID from URL parameters
        const { id } = req.params;

        // Find the course by ID
        const course = await Course.findById(id);

        // Check if course exists
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Send the course data in the response
        res.status(200).json( course );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.delete('/delete/:id', jwtAuthMiddleWare, async (req, res) => {
  const tokenUser = req.user;

  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.coverImage) {
      const publicId = course.coverImage.split('/').pop().split('.')[0]; 
      await cloudinary.uploader
        .destroy(['uploads/' + publicId],
          { type: 'upload', resource_type: 'image' })
        .then(console.log);
    }
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Course post and associated cover image deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while deleting the Course' });
  }
});

module.exports = router;
