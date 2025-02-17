
const express = require('express');
const Course = require('../models/course');
const router = express.Router();
const path = require('path')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload = require('../middelware/multer');
const processImage = require('../middelware/imagsProcess');
const fs = require('fs'); // To delete files if necessary
const { sendsubscribemail, sendBulkEmailsCourse } = require('../mail/subscribeMail');


router.post('/add', jwtAuthMiddleWare, upload.single('coverImage'), processImage, async (req, res) => {
  const tokenUser = req.user;
  if (tokenUser?.role !== 'admin') {
    return res.status(403).json({ message: 'User is not an admin' });
  }

  // Handle the coverImage path correctly
  const coverImage = req.file ? req.file.path.replace('public/', '') : '';
  const imagePath = coverImage ? `${process.env.BASE_URL}/${coverImage.replace(/\\/g, '/')}` : '';

  // Filter out null lessons
  const filteredLessons = req.body.lessons ? req.body.lessons.filter(lesson => lesson !== null) : [];

  const mail = req.body.published === 'public';

  const newCourse = new Course({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    actualPrice: req.body.price,
    duration: req.body.duration,
    link: req.body.link,
    lessons: filteredLessons,
    coverImage: imagePath,
    tags: req.body.tags,
    published: req.body.published,
    mail
  });

  console.log(newCourse);

  try {
    const response = await newCourse.save();
    res.status(201).json({ response, message: "Course created" });

    console.log(process.env.BULK_EMAIL_SEND, 'check env');

    // Send bulk emails if mail is true and bulk email sending is enabled
    if (mail && process.env.BULK_EMAIL_SEND !== 'false') {
      await sendBulkEmailsCourse(
        `${req.body.title} - New Course Available`,
        `${process.env.FRONTEND_LINK}/#/courses/${response._id}`
      );
    }

  } catch (error) {
    console.error('Error adding course:', error);

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
  try {
    // Check if the user is an admin
    const tokenUser = req.user;
    if (tokenUser?.role !== 'admin') {
      return res.status(403).json({ message: 'User is not an admin' });
    }

    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Filter lessons to remove null values
    const filteredLessons = req.body.lessons?.filter(lesson => lesson !== null) || [];

    const updateData = {
      title: req.body.title || course.title,
      description: req.body.description || course.description,
      price: req.body.price || course.price,
      actualPrice: req.body.actualPrice || course.actualPrice,
      duration: req.body.duration || course.duration,
      tags: req.body.tags || course.tags,
      link: req.body.link || course.link,
      lessons: filteredLessons.length > 0 ? filteredLessons : course.lessons,
      published: req.body.published || course.published,
      updatedAt: new Date(),
    };

    // Handle coverImage updates
    if (req.file) {
      // Delete old cover image if exists
      if (course.coverImage) {
        const oldImagePath = course.coverImage.replace(`${process.env.BASE_URL}/`, '');
        const oldFilePath = path.join(__dirname, '../public', oldImagePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old image:', err);
            else console.log('Old image deleted:', oldImagePath);
          });
        }
      }

      // Update coverImage with new image
      const newCoverImage = req.file.path.replace('public/', '').replace(/\\/g, '/');
      updateData.coverImage = `${process.env.BASE_URL}/${newCoverImage}`;
    }

    // Handle mail logic
    if (course.mail === false && process.env.BULK_EMAIL_SEND !== 'false' && updateData.published === 'public') {
      updateData.mail = true;
      updateData.createdAt = new Date();
      await sendBulkEmailsCourse(
        `${updateData.title} - New Course Available`,
        `${process.env.FRONTEND_LINK}/#/course/${courseId}`
      );
    }

    // Update the course in the database
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true, runValidators: true });

    res.status(200).json({ response: updatedCourse, message: "Course updated successfully" });
  } catch (error) {
    console.error('Error updating course:', error);

    // If an error occurred and a new image was uploaded, delete it
    if (req.file) {
      const newFilePath = req.file.path.replace('public/', '');
      const filePathToDelete = path.join(__dirname, '../public', newFilePath);
      if (fs.existsSync(filePathToDelete)) {
        fs.unlink(filePathToDelete, (err) => {
          if (err) console.error('Error deleting new image after failed update:', err);
          else console.log('New image deleted due to update error:', newFilePath);
        });
      }
    }

    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});




router.get('/getcourses', async (req, res) => {
  try {
    console.log(req.query.published, 'query published');
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const title = req.query.title || '';
    const published = req.query.published || req.query.status;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;


    console.log('User Role: published', published);

    const query = {
      title: { $regex: title, $options: 'i' }, // Case-insensitive title search
    };

    // Apply role-based filtering
    if (published == undefined ) {
      // Admin sees both public and private courses
      query.published = { $in: ['public', 'private'] };
    } else {
      // Regular users see only public courses
      query.published = 'public';
    }

    // Debugging Output
    console.log('Final Query:', JSON.stringify(query, null, 2));

    const sortOptions = {};
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      sortOptions[sortField] = sortOrder;
    }

    const [courses, count] = await Promise.all([
      Course.find(query).skip(skip).limit(limit).sort(sortOptions),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      count,
      data: courses,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving courses' });
  }
});


router.get('/getUsercourses', jwtAuthMiddleWare, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    const published = req.query.published; // Published filter, optional
    const sortField = req.query.sortField || 'createdAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Ascending or descending order, default is descending
    const userId = req.user?.id; // Get user ID from the authenticated user (assuming JWT is used)

    const skip = (page - 1) * limit;

    const query = {
      title: { $regex: title, $options: 'i' }, // Case-insensitive title search
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
