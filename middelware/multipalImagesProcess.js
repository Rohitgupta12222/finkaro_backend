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
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${Date.now()}-${path.parse(file.originalname).name}${ext}`;
        const relativeFilePath = path.join('uploads', filename);
        const absoluteFilePath = path.join(__dirname, '../public', relativeFilePath);

        if (!fs.existsSync(path.dirname(absoluteFilePath))) {
          fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
        }

        if (ext === '.gif') {
          // Save GIF as it is without compression
          fs.writeFileSync(absoluteFilePath, file.buffer);
        } else {
          // Convert other images to WebP format
          const processedImage = await sharp(file.buffer)
            .toFormat('webp')
            .webp({ quality: 80 })
            .toBuffer();

          fs.writeFileSync(absoluteFilePath, processedImage);
        }

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
