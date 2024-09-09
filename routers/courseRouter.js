
const express = require('express');
const Course = require('../models/course');
const router = express.Router();
const path = require('path')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const upload = require('../middelware/multer')
const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
// const BASE_URL = 'https://finkaro-backend.onrender.com'; // Change this to your actual base URL

router.post('/add', jwtAuthMiddleWare, async (req, res) => {
    try {
        const tokenUser = req.user
        if (tokenUser?.role !== 'admin') return res.status(40).json({ message: 'User is not a admin ' });


        await upload(req, res, async (err) => {
            if (err) return res.status(400).json({ error: err });


            let path = req.file ? req.file.path.replace('public/', '') : null;

            const newCourse = new Course({
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                duration: req.body.duration,
                lessons: req.body.lessons,  // Assuming lessons will be passed as an array in req.body
                coverImage: path,  // Save the uploaded image path
                published: req.body.published,
                enrolledStudents: req.body.enrolledStudents || [],  // Default to an empty array if not provided
                mail: req.body.published === 'true' ? true : false,  // Conditionally set mail flag
            });

            console.log(newCourse);


            const response = await newCourse.save()
            res.status(201).json({ response: response, message: "Course created" })
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
router.put('/update/:id', jwtAuthMiddleWare, async (req, res) => {
    try {

        const tokenUser = req.user;
        if (tokenUser?.role !== 'admin') {
            return res.status(401).json({ message: 'User is not an admin' });
        }

        // Find the course by ID
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Update fields
            course.title = req.body.title || course.title;
            course.description = req.body.description || course.description;
            course.price = req.body.price || course.price;
            course.duration = req.body.duration || course.duration;
            course.lessons = req.body.lessons || course.lessons;
            course.coverImage = req.file ? req.file.path.replace('public/', '') : course.coverImage;
            course.published = req.body.published !== undefined ? req.body.published : course.published;
            course.mail = req.body.published === 'true' ? true : false;

            // Save the updated course
            const updatedCourse = await course.save();
            res.status(200).json({ updatedCourse, message: "Course updated" });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
router.get('/getcourses', async (req, res) => {
    try {

        const { page = 1, limit = 10, search = '', status } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Build the query object
        let query = {};

        // Add search filter if search term is provided
        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Add status filter if status is provided
        if (status !== undefined) {
            query.published = status === 'true';  // Convert string 'true' to boolean true
        }

        // Fetch the total count of courses for pagination
        const count = await Course.countDocuments(query);

        // Fetch the paginated and filtered courses
        const courses = await Course.find(query)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        // Send the response
        res.status(200).json({
            count, "data": courses
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
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
        res.status(200).json({ "data": course });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
router.delete('/delete/:id',  jwtAuthMiddleWare, async (req, res) => {
    try {
        const tokenUser = req.user
        if (tokenUser?.role !== 'admin') return res.status(40).json({ message: 'User is not a admin ' });

        // Extract course ID from URL parameters
        const { id } = req.params;

        // Find and delete the course by ID
        const course = await Course.findByIdAndDelete(id);

        // Check if course was found and deleted
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Send success message
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
