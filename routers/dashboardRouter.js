
const express = require('express');
const Dashboard = require('../models/dashboard');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const Dashboardupload =require('../middelware/dashboarMulter')
const upload =  require('../middelware/multer')
const fs = require('fs');
const path = require('path');
const  multipalprocessImage = require('../middelware/multipalImagesProcess');


router.post('/add', jwtAuthMiddleWare, upload.array('coverImage', 10), multipalprocessImage, async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    content,
    status,
    links,
    shortDescription,
    actualPrice,
    offerPrice,
    mail,
    excelFileLink,
    zipFileLink
  } = req.body;

  // Extract uploaded file paths
  const coverImagePaths = req.files ? req.files.map(file => {return file.path ? `${process.env.BASE_URL}/${file.path.replace('public/', '')}` : null}) : [];

  try {
    // Create a new dashboard entry
    const newDashboard = new Dashboard({
      title,
      content,
      userId,
      coverImage: coverImagePaths, // Use the array of uploaded file paths
      links,
      actualPrice,
      offerPrice,
      status,
      mail,
      shortDescription,
      excelFileLink,
      zipFileLink
    });

    const savedDashboard = await newDashboard.save();
    res.status(201).json(savedDashboard);

  } catch (error) {
    console.error('Error creating dashboard:', error);

    // Remove uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        const filePath = file.path;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`Deleted file: ${filePath}`);
          }
        });
      });
    }

    res.status(500).json({ message: 'Server error', error });
  }
});



router.put('/update/:id', jwtAuthMiddleWare, upload.array('coverImage', 10), multipalprocessImage, async (req, res) => {
  const dashboardId = req.params.id;
  const userId = req.user.id;
  const {
    title,
    content,
    status,
    links,
    shortDescription,
    actualPrice,
    offerPrice,
    mail,
    excelFileLink,
    zipFileLink
  } = req.body;

  // Extract new uploaded file paths
  const newCoverImagePaths = req.files ? req.files.map(file =>
    `${process.env.BASE_URL}/${file.path.replace('public/', '')}`
  ) : [];

  try {
    // Find the existing dashboard entry by ID
    const existingDashboard = await Dashboard.findById(dashboardId);

    if (!existingDashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Store old image paths before updating
    const oldCoverImagePaths = existingDashboard.coverImage;

    // If new images are uploaded, remove the old images from the server
    if (newCoverImagePaths.length > 0 && oldCoverImagePaths.length > 0) {
      oldCoverImagePaths.forEach(oldImagePath => {
        const filePath = `public/${oldImagePath.replace(`${process.env.BASE_URL}/`, '')}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting old file ${filePath}:`, err);
          } else {
            console.log(`Deleted old file: ${filePath}`);
          }
        });
      });
    }

    // Update the dashboard entry
    existingDashboard.title = title || existingDashboard.title;
    existingDashboard.content = content || existingDashboard.content;
    existingDashboard.status = status || existingDashboard.status;
    existingDashboard.links = links || existingDashboard.links;
    existingDashboard.actualPrice = actualPrice || existingDashboard.actualPrice;
    existingDashboard.offerPrice = offerPrice || existingDashboard.offerPrice;
    existingDashboard.mail = mail || existingDashboard.mail;
    existingDashboard.shortDescription = shortDescription || existingDashboard.shortDescription;
    existingDashboard.excelFileLink = excelFileLink || existingDashboard.excelFileLink;
    existingDashboard.zipFileLink = zipFileLink || existingDashboard.zipFileLink;

    // If new images are uploaded, update the cover image paths
    if (newCoverImagePaths.length > 0) {
      existingDashboard.coverImage = newCoverImagePaths;
    }

    // Save the updated dashboard entry
    const updatedDashboard = await existingDashboard.save();
    res.status(200).json(updatedDashboard);

  } catch (error) {
    console.error('Error updating dashboard:', error);

    // Remove newly uploaded files if error occurs during update
    if (req.files) {
      req.files.forEach(file => {
        const filePath = file.path;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting new file ${filePath}:`, err);
          } else {
            console.log(`Deleted new file: ${filePath}`);
          }
        });
      });
    }

    res.status(500).json({ message: 'Server error', error });
  }
});


router.delete('/delete/:id', jwtAuthMiddleWare, async (req, res) => {
  const dashboardId = req.params.id;

  try {
    // Find the existing dashboard entry by ID
    const existingDashboard = await Dashboard.findById(dashboardId);

    if (!existingDashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Extract the cover image paths to delete
    const coverImagePaths = existingDashboard.coverImage;

    // Delete the cover images from the server
    if (coverImagePaths && coverImagePaths.length > 0) {
      coverImagePaths.forEach(imagePath => {
        const filePath = `public/${imagePath.replace(`${process.env.BASE_URL}/`, '')}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`Deleted file: ${filePath}`);
          }
        });
      });
    }

    // Delete the dashboard entry from the database
    await Dashboard.findByIdAndDelete(dashboardId);

    res.status(200).json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


router.get('/get', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    const status = req.query.status; // Get the status query, optional
    const sortField = req.query.sortField || 'updatedAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // Ascending or descending order, default is descending

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
    const sortOptions = {};
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      sortOptions[sortField] = sortOrder; // Add the sorting field and order
    }

    // Find dashboards based on the query, apply pagination, and sort dynamically
    const [dashboards, count] = await Promise.all([
      Dashboard.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOptions), // Sort using the constructed sort options
      Dashboard.countDocuments(query) // Count documents matching the query
    ]);

    // Return the response with paginated results
    res.json({
      count,
      data: dashboards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/get/:id', async (req, res) => {
  try {
    const dashboardId = req.params.id;

    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    res.json({dashboard});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
