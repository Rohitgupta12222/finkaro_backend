
const express = require('express');
const Dashboard = require('../models/dashboard');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')
const Dashboardupload =require('../middelware/dashboarMulter')
const upload =  require('../middelware/multer')
const fs = require('fs');
const path = require('path');
const { unlink } = require('fs/promises'); // Use fs/promises for async/await unlink  
const  multipalprocessImage = require('../middelware/multipalImagesProcess');



router.post('/add',jwtAuthMiddleWare, upload.array('coverImage', 10), multipalprocessImage, async (req, res) => {
  const userId = req.user.id; // Get user ID from the token
  const { title, content, links, actualPrice, offerPrice, status, mail, zipFileLink ,tags } = req.body;

  const coverImagePaths = req.files ? req.files.map(file => {
    const coverImage = file.path; // Path without 'public/' because of earlier replacement
    const imagePath = coverImage ? `${process.env.BASE_URL}/${coverImage.replace(/\\/g, '/')}` : '';
    return imagePath; // Return full image URL
  }) : [];
  console.log(coverImagePaths , 'coverImagePaths');
  

  try {
    const newDashboard = new Dashboard({
      title,
      content,
      userId,
      coverImage: coverImagePaths,
      links,
      actualPrice,
      offerPrice,
      status,
      mail,
      tags,
      zipFileLink
    });

    const savedDashboard = await newDashboard.save();
    res.status(201).json(savedDashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
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
    actualPrice,
    offerPrice,
    tags,
    mail,
    zipFileLink
  } = req.body;

  // Extract new uploaded file paths
  const newCoverImagePaths = req.files ? req.files.map(file => {
    const coverImage = file.path; // Path without 'public/' because of earlier replacement
    const imagePath = coverImage ? `${process.env.BASE_URL}/${coverImage.replace(/\\/g, '/')}` : '';
    return imagePath; // Return full image URL
  }) : [];

  try {
    // Find the existing dashboard entry by ID
    const existingDashboard = await Dashboard.findById(dashboardId);

    if (!existingDashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // **Optional Logic**: Merge old and new images if desired
    const updatedCoverImages = newCoverImagePaths.length > 0
      ? newCoverImagePaths // Use new images if provided
      : existingDashboard.coverImage; // Otherwise, retain old images

    // Delete old images only if new images are uploaded
    if (newCoverImagePaths.length > 0 && existingDashboard.coverImage && existingDashboard.coverImage.length > 0) {
      await Promise.all(existingDashboard.coverImage.map(async (imagePath) => {
        const filePath = `public/${imagePath.split(`${process.env.BASE_URL}/`)[1]}`;
        try {
          await unlink(filePath); // Delete old file
          console.log(`Deleted old file: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting old file ${filePath}:`, err);
        }
      }));
    }

    // Update fields only if provided
    existingDashboard.title = title || existingDashboard.title;
    existingDashboard.content = content || existingDashboard.content;
    existingDashboard.status = status || existingDashboard.status;
    existingDashboard.links = links || existingDashboard.links;
    existingDashboard.actualPrice = actualPrice || existingDashboard.actualPrice;
    existingDashboard.offerPrice = offerPrice || existingDashboard.offerPrice;
    existingDashboard.mail = mail || existingDashboard.mail;
    existingDashboard.tags = tags ? [...new Set(tags)] : existingDashboard.tags; // Deduplicate tags
    existingDashboard.zipFileLink = zipFileLink || existingDashboard.zipFileLink;
    existingDashboard.coverImage = updatedCoverImages; // Update with new/merged image paths

    // Save the updated dashboard entry
    const updatedDashboard = await existingDashboard.save();
    res.status(200).json(updatedDashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);

    // If any error occurs, attempt to delete new files to prevent orphaned files
    if (req.files) {
      await Promise.all(req.files.map(async (file) => {
        const filePath = file.path;
        try {
          await unlink(filePath); // Delete new file
          console.log(`Deleted new file: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting new file ${filePath}:`, err);
        }
      }));
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
        const filePath = path.join(__dirname, '../public', imagePath.replace(`${process.env.BASE_URL}/`, ''));
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

router.get('/get', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    const status = req.query.status; // Get the status query, optional
    const sortField = req.query.sortField || 'updatedAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Ascending or descending order, default is descending

    const skip = (page - 1) * limit;

    // Build the query with case-insensitive title search
    const query = {
      title: { $regex: title, $options: 'i' }, // Case-insensitive title search
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




router.get('/userdashboards', jwtAuthMiddleWare, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    const title = req.query.title || ''; // Get the title query (default is an empty string)
    const status = req.query.status; // Get the status query, optional
    const sortField = req.query.sortField || 'updatedAt'; // Default sort field
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Ascending or descending order, default is descending
    const userId = req.user?.id;
    console.log(userId);

    const skip = (page - 1) * limit;

    // Build the query with case-insensitive title search and filtering by enrolled array
    const query = {
      title: { $regex: title, $options: 'i' },
      enrolled: { $in: [userId] }, // Check if userId exists in the enrolled array
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

module.exports = router;
