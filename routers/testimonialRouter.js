const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonial.js'); // Adjust the path as needed
const { jwtAuthMiddleWare } = require('../jwt/jwt')

router.post('/create', jwtAuthMiddleWare, async (req, res) => {
    const { name, profession, content } = req.body;
    
    try {
        // Check if there are already 20 testimonials in the database
        const count = await Testimonial.countDocuments();
        if (count >= 20) {
            return res.status(400).json({ message: 'Cannot add more than 20 testimonials.' });
        }

        // Create and save the new testimonial
        const newTestimonial = new Testimonial({
            name,
            profession,
            content
        });

        await newTestimonial.save();
        res.status(201).json({ message: 'Testimonial added successfully!' });
    } catch (error) {
        res.status(400).json({ message: 'Error adding testimonial', error: error.message });
    }
});

router.get('/get', async (req, res) => {
    try {
        const name = req.query.name || ''; // Search by name
        const status = req.query.status; // Optional status filter
        const sortField = req.query.sortField || 'createdAt'; // Default sorting field
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Default to descending

        // Build query with case-insensitive name search
        const query = {
            name: { $regex: name, $options: 'i' }
        };

        // Conditionally add the status filter if provided
        if (status) {
            query.status = status;
        }

        // Create sorting object
        const sortOptions = { [sortField]: sortOrder };

        // Fetch all testimonials with filtering and sorting
        const testimonials = await Testimonial.find(query).sort(sortOptions);

        res.status(200).json({
            data: testimonials
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
    }
});


router.delete('/delete/:id',jwtAuthMiddleWare, async (req, res) => {
    const { id } = req.params;

    try {
        const testimonial = await Testimonial.findByIdAndDelete(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        res.status(200).json({ message: 'Testimonial deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting testimonial', error: error.message });
    }
});


module.exports = router;
