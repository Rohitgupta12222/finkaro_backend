const multer = require('multer');
const path = require('path');


// Set up multer storage to save files locally
const storage =  multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  } ,filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 20 * 1024 * 1024,  // Limit the field size (e.g., 2 MB)
    fileSize: 50 * 1024 * 1024, 
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