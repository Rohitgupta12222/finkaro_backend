
const express = require('express');
const Dashboard = require('../models/dashboard');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const Dashboardupload =require('../middelware/dashboarMulter')
const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
const fs = require('fs');
const path = require('path');


router.post('/add', jwtAuthMiddleWare, Dashboardupload.fields([
  { name: 'coverImage', maxCount: 10 },
  { name: 'zipfile', maxCount: 1 },
  { name: 'excelFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const coverImage = req.files['coverImage'] ? req.files['coverImage'].map(file => `${BASE_URL}/uploads/${file.filename}`) : [];
    const zipfile = req.files['zipfile'] ? `${BASE_URL}/uploads/${req.files['zipfile'][0].filename}` : null;
    const excelFile = req.files['excelFile'] ? `${BASE_URL}/uploads/${req.files['excelFile'][0].filename}` : null;

    const userId = req.user.id;
    const { title, content, status, links, mail, shortDescription, actualPrice, offerPrice, start } = req.body;

    const newDashboard = new Dashboard({
      title,
      content,
      userId,
      status,
      links,
      shortDescription,
      actualPrice,
      offerPrice,
      start,
      mail,
      coverImage,
      zipfile,
      excelFile
    });

    await newDashboard.save();

    res.json({ message: 'Dashboard created successfully', dashboard: newDashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.put('/update/:id', jwtAuthMiddleWare, Dashboardupload.fields([
  { name: 'coverImage', maxCount: 10 },
  { name: 'zipfile', maxCount: 1 },
  { name: 'excelFile', maxCount: 1 }
]), async (req, res) => {
  try {
    // Find the existing dashboard by ID
    const dashboard = await Dashboard.findById(req.params.id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Function to remove old files from the server
    const removeOldFile = (filePath) => {
      const fullPath = path.join(__dirname, '../public/uploads', path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Remove the file
      }
    };

    // Handle cover images
    if (req.files['coverImage']) {
      // Remove old cover images
      if (dashboard.coverImage) {
        dashboard.coverImage.forEach(filePath => removeOldFile(filePath));
      }
      // Set the new cover image paths
      dashboard.coverImage = req.files['coverImage'].map(file => `${BASE_URL}/uploads/${file.filename}`);
    }

    // Handle zip file
    if (req.files['zipfile']) {
      // Remove the old zip file
      if (dashboard.zipfile) removeOldFile(dashboard.zipfile);
      // Set the new zip file path
      dashboard.zipfile = `${BASE_URL}/uploads/${req.files['zipfile'][0].filename}`;
    }

    // Handle excel file
    if (req.files['excelFile']) {
      // Remove the old excel file
      if (dashboard.excelFile) removeOldFile(dashboard.excelFile);
      // Set the new excel file path
      dashboard.excelFile = `${BASE_URL}/uploads/${req.files['excelFile'][0].filename}`;
    }

    // Update other fields from the request body
    const { title, content, status, links, mail, shortDescription, actualPrice, offerPrice, start } = req.body;

    // Update the dashboard entry
    dashboard.title = title || dashboard.title;
    dashboard.content = content || dashboard.content;
    dashboard.status = status || dashboard.status;
    dashboard.links = links || dashboard.links;
    dashboard.shortDescription = shortDescription || dashboard.shortDescription;
    dashboard.mail = mail || dashboard.mail;
    dashboard.actualPrice = actualPrice || dashboard.actualPrice;
    dashboard.offerPrice = offerPrice || dashboard.offerPrice;
    dashboard.start = start || dashboard.start;
    dashboard.updatedAt = Date.now();

    // Save the updated dashboard to the database
    await dashboard.save();

    // Respond with success message and updated dashboard data
    res.json({ message: 'Dashboard updated successfully', dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.delete('/delete/:id', async (req, res) => {
  try {
    const dashboardId = req.params.id;

    // Find the dashboard by ID
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Function to delete a file
    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, '../public/uploads/', path.basename(filePath));
        fs.unlink(fullPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting file:', err);
          }
        });
      }
    };

    // Delete associated files if they exist
    if (dashboard.coverImage) {
      // Check if coverImage is an array
      if (Array.isArray(dashboard.coverImage)) {
        dashboard.coverImage.forEach(filePath => deleteFile(filePath));
      } else {
        deleteFile(dashboard.coverImage); // Delete single cover image
      }
    }
    if (dashboard.zipfile) {
      deleteFile(dashboard.zipfile); // Delete zipfile
    }
    if (dashboard.excelFile) {
      deleteFile(dashboard.excelFile); // Delete excelFile
    }

    // Delete the dashboard entry from the database
    await Dashboard.findByIdAndDelete(dashboardId);

    res.json({ message: 'Dashboard entry and associated files deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/get', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    
    const skip = (page - 1) * limit;

    // Build the query with case-insensitive title search using a regular expression
    const query = title ? { title: { $regex: title, $options: 'i' } } : {};

    // Find blog posts based on title and apply pagination
    const [dashboards, count] = await Promise.all([
      Dashboard.find(query).skip(skip).limit(limit),
      Dashboard.countDocuments(query) // Count documents matching the query
    ]);

    res.json({
      count,
      data: dashboards,
    });
  } catch (error) {
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
