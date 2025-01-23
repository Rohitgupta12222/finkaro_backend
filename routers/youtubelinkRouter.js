
const express = require('express');
const YouTubeLink = require('../models/youtubeLinks');
const router = express.Router();
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file
const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/add', jwtAuthMiddleWare, async (req, res) => {
  const { title, alt, video, status } = req.body;
  const tokenUser = req.user
  if (tokenUser?.role !== 'admin' ) return res.status(401).json({ message: 'User is not a admin ' });
  try {
    const count = await YouTubeLink.countDocuments();


    if (count >= 20) {
      return res.status(403).json({ message: 'You can only upload up to 20 links.' });
    }
    const newLink = new YouTubeLink({
      title,
      video,
      alt,
      status
    });

    // Save the new YouTube link to the database
    const savedLink = await newLink.save();
    res.status(201).json({ message: 'YouTube link added successfully', link: savedLink });
  } catch (error) {
    res.status(400).json({ message: 'Error adding YouTube link', error: error.message });
  }
})
router.get('/get', async (req, res) => {
  try {

    const count = await YouTubeLink.countDocuments();
    const linksData = await YouTubeLink.find();
    res.status(201).json(
      { count: count, data: linksData }
    );
  } catch (error) {
    res.status(400).json({ message: 'Error adding YouTube link', error: error.message });
  }


}
)
router.delete('/delete/:id', jwtAuthMiddleWare, async (req, res) => {
  try {

    const tokenUser = req.user
    if (tokenUser?.role !== 'admin' ) return res.status(40).json({ message: 'User is not a admin ' });


    const id = req.params.id;

    const deletedLink = await YouTubeLink.findByIdAndDelete(id);

    if (!deletedLink) {
      return res.status(404).json({ message: 'YouTube link not found' });
    }

    res.status(200).json({ message: 'YouTube link deleted successfully', deletedLink });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting YouTube link', error: error.message });
  }

}
)



module.exports = router;
