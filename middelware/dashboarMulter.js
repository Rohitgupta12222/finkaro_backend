const multer = require('multer');
const path = require('path');

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/'); // Directory for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
  }
});

// Define file filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|zip|xlsx|xls/;
  const mimetype = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype) && mimetype) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only image, zip, and Excel files are allowed!'), false); // Reject the file
  }
};

// Initialize multer with storage and file filter
const Dashboardupload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Limit file size to 10MB
});

module.exports = Dashboardupload;