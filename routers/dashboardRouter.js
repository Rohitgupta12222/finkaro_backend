
const express = require('express');
const Dashboard = require('../models/dashboard');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const uploadDashboard =require('../middelware/dashboarMulter')
const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
const fs = require('fs');
const path = require('path');


router.post('/add', uploadDashboard.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'zipfile', maxCount: 1 },
  { name: 'excelFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, content, userId, status, links, mail } = req.body;

    const newDashboard = new Dashboard({
      title,
      content,
      userId,
      status,
      links,
      mail,
      coverImage: req.files['coverImage'] ? req.files['coverImage'][0].filename : null,
      zipfile: req.files['zipfile'] ? req.files['zipfile'][0].filename : null,
      excelFile: req.files['excelFile'] ? req.files['excelFile'][0].filename : null
    });

    await newDashboard.save();
    res.json({ message: 'Dashboard created successfully', dashboard: newDashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to update dashboard entry and delete old files
router.put('/update/:id', uploadDashboard.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'zipfile', maxCount: 1 },
  { name: 'excelFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const dashboardId = req.params.id;
    const existingDashboard = await Dashboard.findById(dashboardId);

    if (!existingDashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const updatedData = {
      title: req.body.title,
      content: req.body.content,
      status: req.body.status,
      links: req.body.links,
      mail: req.body.mail,
      userId: req.body.userId,
    };

    // Helper function to delete a file if it exists
    const deleteFile = (filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
    };

    // Process coverImage
    if (req.files['coverImage']) {
      if (existingDashboard.coverImage) {
        const oldCoverImagePath = path.join(__dirname, '../public/uploads/', existingDashboard.coverImage);
        deleteFile(oldCoverImagePath);
      }
      updatedData.coverImage = req.files['coverImage'][0].filename;
    }

    // Process zipfile
    if (req.files['zipfile']) {
      if (existingDashboard.zipfile) {
        const oldZipfilePath = path.join(__dirname, '../public/uploads/', existingDashboard.zipfile);
        deleteFile(oldZipfilePath);
      }
      updatedData.zipfile = req.files['zipfile'][0].filename;
    }

    // Process excelFile
    if (req.files['excelFile']) {
      if (existingDashboard.excelFile) {
        const oldExcelFilePath = path.join(__dirname, '../public/uploads/', existingDashboard.excelFile);
        deleteFile(oldExcelFilePath);
      }
      updatedData.excelFile = req.files['excelFile'][0].filename;
    }

    // Update the dashboard with new data and files
    const updatedDashboard = await Dashboard.findByIdAndUpdate(dashboardId, updatedData, { new: true });

    res.json({ message: 'Dashboard updated successfully', dashboard: updatedDashboard });
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


    const deleteFile = (filePath) => {
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Error deleting file:', err);
          }
        });
      }
    };

    // Delete associated files if they exist
    if (dashboard.coverImage) {
      deleteFile(path.join(__dirname, './public/uploads/', dashboard.coverImage));
    }
    if (dashboard.zipfile) {
      deleteFile(path.join(__dirname, './public/uploads/', dashboard.zipfile));
    }
    if (dashboard.excelFile) {
      deleteFile(path.join(__dirname, './public/uploads/', dashboard.excelFile));
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
    // Extract query parameters
    const { search = '', page = 1, limit = 10, status } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build the query object
    const query = {
      title: { $regex: search, $options: 'i' }, // Case-insensitive search
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Find total count of documents matching the query
    const count = await Dashboard.countDocuments(query);

    // Retrieve the paginated documents
    const dashboards = await Dashboard.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 }); // Sort by creation date (descending)

    // Respond with the paginated data
    res.json({
      count,
      "data":dashboards
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    // Extract the ID from the request parameters
    const dashboardId = req.params.id;

    // Find the dashboard by ID
    const dashboard = await Dashboard.findById(dashboardId);

    // Check if the dashboard exists
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Respond with the found dashboard
    res.json({"data":dashboard});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
