const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const multipalprocessImage = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        const processedImage = await sharp(file.buffer)
          .toFormat('webp')
          .webp({ quality: 80 })
          .toBuffer();

        const filename = `${Date.now()}-${path.parse(file.originalname).name}.webp`;
        const relativeFilePath = path.join('uploads', filename);
        const absoluteFilePath = path.join(__dirname, '../public', relativeFilePath);

        if (!fs.existsSync(path.dirname(absoluteFilePath))) {
          fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
        }

        fs.writeFileSync(absoluteFilePath, processedImage);

        return { ...file, path: relativeFilePath };
      })
    );

    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image: ' + error.message);
  }
};

module.exports = multipalprocessImage;
