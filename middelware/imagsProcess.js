const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      // No file uploaded, skip processing
      return next();
    }

    console.log(req.file);
    

    // Convert the uploaded image to WebP format
    const processedImage = await sharp(req.file.path)
      .toFormat('webp')
      .webp({ quality: 80 })
      .toBuffer();

    const newFilename = `${Date.now()}-${path.parse(req.file.originalname).name}.webp`;
    const newFilePath = path.join('public/uploads/', newFilename);
    

    // Save the processed image
    fs.writeFileSync(newFilePath, processedImage);

    // Replace the file path in the request to point to the new image
    req.file.path = newFilePath;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
};

module.exports = processImage;
