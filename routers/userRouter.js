
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file

const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/register', async (req, res) => {
  const { email, password, name, isActive } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      if (existingUser.isActive) {
        const payloadJwt = {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        }
        console.log(payloadJwt, 'alreasy payloadJwt');


        const token = genrateToken(payloadJwt)
        return res.status(200).json({ response: existingUser, token: token })

      } else {
        const smsContent = `Hi ${existingUser?.name}, your account is activated!.Please keep it safe. Login here:${process.env.FRONTEND_LINK}/user/activate/${existingUser.id}`;
        res.status(404).json({ message: "Please visit your email to activate your account." })

        return sendRegistrationEmail(email, 'Account activated', smsContent);

      }



    }
    const userData = new User(req.body)
    const response = await userData.save()
    if (!isActive) {

      const smsContent = `Hi ${name}, your account is activated! Your password is: ${password}.Please keep it safe. Login here:${process.env.FRONTEND_LINK}/user/activate/${response.id}`;
      res.status(404).json({ message: "Please visit your email to activate your account." })
      return sendRegistrationEmail(email, 'Account activated', smsContent);

    } else {
      const payloadJwt = {
        id: response.id,
        name: response.email,
        role: response.role,
      }
      console.log(payloadJwt, 'register payloadJwt');

      const token = genrateToken(payloadJwt)
      console.log(' this is token ', token);
      console.log('data save successfully ...');
      const emailContent = `Hello ${name},\n\nYou have successfully registered with the following password:\n\n${password}\n\nPlease keep it safe.`;
      sendRegistrationEmail(email, 'Registration Successful', emailContent);
      res.status(201).json({ response: response, token: token })

    }

  } catch (message) {

    console.log('message ', message);
    res.status(500).json({
      message: "internal Server message",
      message: message
    })
  }
}
)


router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email })

  if (!user) return res.status(404).json({ message: 'user not found' })
  if (!user?.isActive) {
    const smsContent = `Hi ${user?.name}, your account is activated!.Please keep it safe. Login here:${process.env.FRONTEND_LINK}/user/activate/${user.id}`;
   await  sendRegistrationEmail(email, 'Account activated', smsContent);

    return res.status(404).json({ message: 'Please visit your email to activate your account. ' })
  }
    
  const check = await user.comparePassword(password)
  if (!check) return res.status(404).json({ message: 'invaild password' })
  const payload = {
    id: user.id,
    username: user.username
  }
  res.status(200).json({ response: user, token: genrateToken(payload) })


})

router.put('/activateProfile/:id', async (req, res) => {
  try {
    console.log(req.params.id, 'req.params.id;');
    const userId = req.params.id; // Access the userId from the decoded token
    console.log(userId, 'userId');
    const user = await User.findById(userId)
    console.log(user, 'usr data');
    user.isActive = true
    await user.save()
    console.log('activated successfullly');
    return res.status(200).json({ message: 'Account Activated ' })



  } catch (message) {
    console.log(message);
    res.status(500).json({ message: 'Internal Server message' })

  }

})

router.get('/profile', jwtAuthMiddleWare, async (req, res) => {

  try {
    const userId = req.user.id; // Access the userId from the decoded token
    console.log(userId, 'userId');
    const user = await User.findById(userId)

    res.status(200).json({ response: user })

  } catch (message) {
    console.log(message);
    res.status(500).json({ message: 'Internal Server message' })

  }

})

router.put('/profile/password', jwtAuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body
    console.log(userId, 'user id ');
    console.log(req.body, 'user req.body ');


    const user = await User.findById(userId)
    console.log(user, 'data user');
    console.log(await user.comparePassword(currentPassword, 'await user.comparePassword(currentPassword user'));


    if (!(await user.comparePassword(currentPassword))) {
      console.log('Current password is not match');

      return res.status(404).json({ message: 'Current password is not match' })
    }
    user.password = newPassword
    await user.save()
    console.log('password updated successfullly');
    return res.status(200).json({ message: ' password updated successfullly' })


  } catch (message) {
    console.log(message);

    res.status(500).json({ 'message': 'Internal Server message' })
  }
})


router.put('/profile/:id', jwtAuthMiddleWare, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body

    const response = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })
    if (!response) {
      res.status(404).json('No person found');
    }
    res.status(200).json(response);

  } catch (message) {
    res.status(500).json(message);

  }
})
module.exports = router;
