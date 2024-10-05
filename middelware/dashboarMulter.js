const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    // You can customize the filename if needed, e.g., using a unique ID or timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const Dashboardupload = multer({ storage: storage });
module.exports = Dashboardupload;
