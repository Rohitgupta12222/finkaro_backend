const multer = require('multer');
const path = require('path');


// Set up multer storage to save files locally
const storage = multer.memoryStorage(); // Store files in memory for processing

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File type not supported!'));
  },
});




module.exports = upload