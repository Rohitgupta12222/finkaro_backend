const multer = require('multer');
const path = require('path');

// Configure memory storage
const storage = multer.memoryStorage();  // Files are stored in memory, not on disk



// File filter to accept images only
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File type not supported!'));
};

const upload = multer({
  storage: storage,  
  limits: {
    fieldSize: 50 * 1024 * 1024,    
    fileSize: 50 * 1024 * 1024,  
   },
  fileFilter: fileFilter
});
console.log(upload , '================ upload');

module.exports = upload;
