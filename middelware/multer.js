// uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./Cloudinary'); // Adjust the path as needed


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder where images will be stored
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 1MB file size limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});
module.exports = upload;