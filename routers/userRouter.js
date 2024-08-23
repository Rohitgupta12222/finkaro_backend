
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file

const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/register', async (req, res) => {
  const { email ,password,name } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      const payloadJwt = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      }
      console.log( payloadJwt , 'alreasy payloadJwt');

        const token = genrateToken(payloadJwt)
        
      return   res.status(200).json({ response: existingUser, token: token })

    }
    const userData = new User(req.body)
    const response = await userData.save()
    const payloadJwt = {
      id: response.id,
      name: response.email,
      role: response.role,
    }
    console.log( payloadJwt , 'register payloadJwt');

    const token = genrateToken(payloadJwt)
    console.log(' this is token ', token);
    console.log('data save successfully ...');
    const emailContent = `Hello ${name},\n\nYou have successfully registered with the following password:\n\n${password}\n\nPlease keep it safe.`;
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


router.post('/login', async (req, res) => {
  const  {username,password} = req.body
  const user = await User.findOne({ username: username })

  if (!user) return res.status(404).json({ error: 'user not found' })
  const check = await user.comparePassword(password)
  if (!check) return res.status(404).json({ error: 'invaild password' })
  const payload = {
      id: user.id,
      username: user.username
  }
  res.status(200).json({ response: user, token: genrateToken(payload) })


})
module.exports = router;
