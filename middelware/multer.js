const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename); // Define the file name
  },
});

const upload = multer({
  storage: storage,
  fieldSize: 20 * 1024 * 1024,  // Limit the field size (e.g., 2 MB)
  fileSize: 50 * 1024 * 1024, });

module.exports = upload;
