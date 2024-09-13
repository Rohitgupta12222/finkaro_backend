const multer = require('multer');
const path = require('path');
const fs = require('fs');
const webp = require('webp-converter');

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);

    // Convert the uploaded image to WebP format
    const inputPath = path.join('./public/uploads/', fileName);
    const outputPath = path.join('./public/uploads/', file.fieldname + '-' + Date.now() + '.webp');

    // Convert image to WebP
    webp.cwebp(inputPath, outputPath, '-q 80', (status, error) => {
      if (status === 'error') {
        console.log('Error converting image to WebP:', error);
      } else {
        // Remove the original image after conversion
        fs.unlink(inputPath, (err) => {
          if (err) console.error('Error deleting original image:', err);
        });
      }
    });
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
