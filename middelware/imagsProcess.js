
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');


const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const processedImage = await sharp(req.file.buffer)
      .toFormat('webp') // Convert to WebP format
      .webp({ quality: 80 }) // Set WebP quality (80% in this case)
      .toBuffer();

    // Define the filename and relative path where you want to save the WebP image
    const filename = `${Date.now()}-${path.parse(req.file.originalname).name}.webp`;
    const relativeFilePath = path.join('uploads', filename);
    const absoluteFilePath = path.join(__dirname, '../public', relativeFilePath);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(path.dirname(absoluteFilePath))) {
      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
    }

    fs.writeFileSync(absoluteFilePath, processedImage);

    req.file.path = relativeFilePath;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image: ' + error.message);
  }
};

module.exports = processImage;
