const multer = require('multer');
const path = require('path');

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Define the fileFilter function to allow only image, zip, and Excel files
const fileFilter = (req, file, cb) => {
  // Allowed extensions and MIME types
  const allowedExtensions = /jpeg|jpg|png|zip|xlsx|xls/;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  // Extract the file extension and MIME type
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  // Log file details for debugging
  console.log('File extension:', path.extname(file.originalname).toLowerCase());
  console.log('File MIME type:', file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    // Reject the file and send an error message
    cb(new Error('Only image, zip, and Excel files are allowed!'));
  }
};

// File upload limits and filters (optional)
const uploadDashboard = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Optional file size limit
});

module.exports = uploadDashboard;
