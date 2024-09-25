const multer = require('multer');
const path = require('path');



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var Dashboardupload = multer({ storage: storage })
module.exports = Dashboardupload;
