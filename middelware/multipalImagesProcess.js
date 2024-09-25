const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const multipalprocessImage = async (req, res, next) => {

    console.log(req.files , '================ > req.files');


  try {
    // Iterate over all uploaded files and process them
    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        // Convert each uploaded image to WebP format
        const processedImage = await sharp(file.buffer)
          .toFormat('webp')
          .webp({ quality: 80 }) // Set WebP quality (80% in this case)
          .toBuffer();

        // Define the filename and relative path where you want to save the WebP image
        const filename = `${Date.now()}-${path.parse(file.originalname).name}.webp`;
        const relativeFilePath = path.join('uploads', filename);
        const absoluteFilePath = path.join(__dirname, '../public', relativeFilePath);

        // Create the directory if it doesn't exist
        if (!fs.existsSync(path.dirname(absoluteFilePath))) {
          fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
        }

        // Save the processed WebP image to the filesystem
        fs.writeFileSync(absoluteFilePath, processedImage);

        // Return the relative file path for further use
        return {
          ...file,
          path: relativeFilePath,
        };
      })
    );

    // Update req.files with the processed files (including their paths)
    req.files = processedFiles;

    next(); // Continue to the next middleware or route handler
} catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image: ' + error.message);
  }
};



module.exports = multipalprocessImage;