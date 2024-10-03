const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Define the folder where files will be saved
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
})

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 20 * 1024 * 1024,  // Limit the field size (e.g., 2 MB)
    fileSize: 50 * 1024 * 1024, 
  },
})







module.exports = upload