// cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dabv3eznr',
  api_key: '588914789783632',
  api_secret: 'S6Cn4VUgYDt8J2WxxkpjHeXvmUI'
});

module.exports = cloudinary;
