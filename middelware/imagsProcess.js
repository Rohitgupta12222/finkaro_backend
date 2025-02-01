
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');


const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${path.parse(req.file.originalname).name}`;
    let processedImage;
    let finalFilename;

    if (ext === '.gif') {
      // Save GIF as is
      processedImage = req.file.buffer;
      finalFilename = `${filename}.gif`;
    } else {
      // Convert to WebP
      processedImage = await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({ quality: 80 })
        .toBuffer();
      finalFilename = `${filename}.webp`;
    }

    // Define the relative and absolute file paths
    const relativeFilePath = path.join('uploads', finalFilename);
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

