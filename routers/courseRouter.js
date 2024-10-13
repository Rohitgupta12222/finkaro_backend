
const express = require('express');
const Course = require('../models/course');
const router = express.Router();
const path = require('path')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const processImage = require('../middelware/imagsProcess');
const fs = require('fs'); // To delete files if necessary

router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
  // Check if the user is an admin
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  // Handle the coverImage path correctly
  const coverImage = req.file ? req.file.path.replace('public/', '') : ''; // Remove 'public/' from path
  const imagePath = coverImage ? `${process.env.BASE_URL}/${coverImage.replace(/\\/g, '/')}` : ''; // Construct the URL

  // Filter out null lessons
  const filteredLessons = req.body.lessons.filter(lesson => lesson !== null);

  // Create a new Course instance with the provided data
  const newCourse = new Course({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    actualPrice: req.body.price,
    duration: req.body.duration,
    link: req.body.link,
    lessons: filteredLessons,
    coverImage: imagePath, // Updated to remove 'public/'
    tags: req.body.tags,
    published: req.body.published,
    enrolledStudents: req.body.enrolledStudents || [],
    mail: req.body.published === 'public',
  });

  console.log(newCourse); // Log for debugging

  try {
    const response = await newCourse.save();
    return res.status(201).json({ response, message: "Course created" });
  } catch (error) {
    console.error('Error adding course:', error);

    // Error handling and file deletion
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

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});


router.put('/update/:id', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
  // Check if the user is an admin
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  const filteredLessons =  req.body.lessons.filter(lesson => lesson !== null);

  const courseId = req.params.id;
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    actualPrice: req.body.actualPrice,
    duration: req.body.duration,
    tags: req.body.tags,
    link: req.body.link,
    lessons: filteredLessons,
    published: req.body.published,
    enrolledStudents: req.body.enrolledStudents || [],
    mail: req.body.published === 'public' ? true : false,
  };

  // Handle the coverImage path correctly
  if (req.file) {
    const coverImage = req.file && req.file.path ? req.file.path.replace('public/', '').replace(/\\/g, '/') : '';

    updateData.coverImage = `${process.env.BASE_URL}/${coverImage}`;
  }

  try {
    // Find the course by ID and update it
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true, runValidators: true });

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Return the updated course in the response
    res.status(200).json({ response: updatedCourse, message: "Course updated successfully" });
  } catch (error) {
    console.error('Error updating course:', error);

    // If an error occurred while trying to delete the previously uploaded image
    if (req.file) {
      const filePath = path.join(__dirname, '../public', req.file.path.replace('public/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting previous image:', err);
          } else {
            console.log('Previous image deleted due to update error');
          }
        });
      }
    }

    // Send a 500 error response
    res.status(500).json({
      message: "Internal server error",
      error: error.message  // Return the specific error message for debugging
    });
  }
});



router.get('/getcourses', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    const published = req.query.published; // Published filter, optional
    const sortField = req.query.sortField || 'updatedAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Ascending or descending order, default is descending

    const skip = (page - 1) * limit;

    // Build the query with case-insensitive title search
    const query = {
      title: { $regex: title, $options: 'i' } // Case-insensitive title search
    };

    // Conditionally add the published filter to the query if provided
    if (published) {
      query.published = published;
    }

    // Create sorting object for Mongoose
    const sortOptions = {};
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      sortOptions[sortField] = sortOrder;
    }

    // Find courses based on the query, apply pagination, and sort dynamically
    const [courses, count] = await Promise.all([
      Course.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions), // Sort using the constructed sort options
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
    course.lessons = course.lessons.filter(lesson => lesson !== null);

    // Send the course data in the response
    res.status(200).json(course);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
router.delete('/delete/:id', jwtAuthMiddleWare, async (req, res) => {
  // Check if the user is an admin
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  const courseId = req.params.id;

  try {
    // Find the course by ID
    const courseToDelete = await Course.findById(courseId);

    if (!courseToDelete) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete the course from the database
    await Course.findByIdAndDelete(courseId);

    // If there is a coverImage, remove the associated file
    if (courseToDelete.coverImage) {
      const coverImagePath = courseToDelete.coverImage.replace(`${process.env.BASE_URL}/`, 'public/');
      const filePath = path.join(__dirname, '../', coverImagePath);

      // Check if the file exists before trying to delete it
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting cover image:', err);
          } else {
            console.log('Cover image deleted:', coverImagePath);
          }
        });
      }
    }

    // Return a success response
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,  // Return the specific error message for debugging
    });
  }
});


module.exports = router;
