
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file

const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/register', async (req, res) => {
  const { email ,pass } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      const payloadJwt = {
        id: existingUser.id,
        username: existingUser.username,
        role: existingUser.role,
      }
        const token = genrateToken(payloadJwt)
        
      return   res.status(200).json({ response: existingUser, token: token })

    }
    const userData = new User(req.body)
    const response = await userData.save()
    const payloadJwt = {
      id: response.id,
      username: response.username,
      role: response.role,
    }

    const token = genrateToken(payloadJwt)
    console.log(' this is token ', token);
    console.log('data save successfully ...');
    const emailContent = `Hello ${response.username},\n\nYou have successfully registered with the following password:\n\n${pass}\n\nPlease keep it safe.`;
    await sendRegistrationEmail(email, 'Registration Successful', emailContent);

    res.status(201).json({ response: response, token: token })
} catch (error) {

    console.log('error ', error);
    res.status(500).json({
        message: "internal Server Error",
        error: error
    })
}
}
)
module.exports = router;
