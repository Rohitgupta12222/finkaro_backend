
const express = require('express');
const router = express.Router();
const Services = require('../models/servicesModel')
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/add', async (req, res) => {
  try {
    const { id, imgSrc, title, shortDescription, description, plan } = req.body;

    if (!id || !imgSrc || !title || !shortDescription || !description || !plan) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const newServices = new Services({
      id,
      imgSrc,
      title,
      shortDescription,
      description,
      plan
    });

    await newServices.save();

    res.status(201).json({
      message: 'Service added successfully',
      data: Services
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      message: 'Error adding service',
      error: error.message
    });
  }
});

router.get('/get', async (req, res) => {
  try {
    // Find all services
    const services = await Services.find();

    res.json({
      services
    });
  } catch (error) {
    console.error('Error retrieving services:', error);
    res.status(500).json({
      message: 'Error retrieving services',
      error: error.message
    });
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID
    const services = await services.findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'services not found'
      });
    }

    res.json({
      services
    });
  } catch (error) {
    console.error('Error retrieving services:', error);
    res.status(500).json({
      message: 'Error retrieving services',
      error: error.message
    });
  }
});





module.exports = router;
