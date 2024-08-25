
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
        const smsContent = `Hi ${existingUser?.name}, your account is activated!.Please keep it safe. Login here:${process.env.FRONTEND_LINK}/activate/${existingUser.id}`;
        res.status(404).json({ message: "Please visit your email to activate your account." })

        return sendRegistrationEmail(email, 'Account activated', smsContent);

      }



    }
    const userData = new User(req.body)
    const response = await userData.save()

    const activationLink = `${process.env.FRONTEND_LINK}/activate/${response.id}`
    if (!isActive) {

      const smsContent = `
  Subject: Activate Your Account

  Dear ${name},

  Welcome to Our Service!

  Your account has been successfully created. To start using your account, please activate it by clicking the link below:

  ${activationLink}

  Here are your account details:
  - **Email**: ${response?.email}
  - **Password**: ${password}

  Please keep this information safe and secure. You can use these credentials to log in after activating your account.

  If you didn't create this account, please ignore this email.

  Thank you,
  FINKARO
`;

      res.status(404).json({ message: "Please visit your email to activate your account." })
      return sendRegistrationEmail(email, 'Account activated', smsContent);

    } else {
      const payloadJwt = {
        id: response.id,
        email: response.email,
        role: response.role,
      }
      console.log(payloadJwt, 'register payloadJwt');

      const token = genrateToken(payloadJwt)
      console.log(' this is token ', token);
      const emailContent = `
      Subject: Welcome to Our Service
    
      Dear ${response?.name},
    
      Welcome to Our Service!
    
      Here are your account details:
      - **Email**: ${response.email}
      - **Password**: ${password}
    
      Please keep this information safe and secure. You can use these credentials to log in and start using our services.
    
      Thank you,
      FINKARO 
    `;


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


    const activationLink = `${process.env.FRONTEND_LINK}/activate/${response.id}`
 

      const smsContent = `
  Subject: Activate Your Account

  Dear ${user?.name},

  Welcome to Our Service!

  Your account has been successfully created. To start using your account, please activate it by clicking the link below:

  ${activationLink}

  Here are your account details:
  - **Email**: ${user?.email}
  - **Password**: ${password}

  Please keep this information safe and secure. You can use these credentials to log in after activating your account.

  If you didn't create this account, please ignore this email.

  Thank you,
  FINKARO
`;


    await sendRegistrationEmail(email, 'Account activated', smsContent);

    return res.status(404).json({ message: 'Please visit your email to activate your account. ' })
  }

  const check = await user.comparePassword(password)
  if (!check) return res.status(404).json({ message: 'invaild password' })
  const payload = {
    id: user.id,
    name: user.email,
    role: user.role,
  }
  res.status(200).json({ response: user, token: genrateToken(payload) })


})

router.put('/activateProfile', async (req, res) => {
  try {
    const { id } = req.body; // Access the userId from the decoded token

    const user = await User.findById(id)
    console.log(user, 'usr data');
    user.isActive = true
    await user.save()
    console.log('activated successfullly');
    const payload = {
      id: user.id,
      name: user.email,
      role: user.role,
    }
    return res.status(200).json({ response: user, token: genrateToken(payload) })

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
