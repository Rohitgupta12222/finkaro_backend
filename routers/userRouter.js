
const express = require('express');
const User = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file

const { jwtAuthMiddleWare, genrateToken } = require('../jwt/jwt')


router.post('/register', async (req, res) => {
  const { email, password, name, isActive, address, phoneNumber } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      if (existingUser.isActive) {

        const updatedUser = await User.findOneAndUpdate(
          { email: email }, // Find the user by email
          { phoneNumber: phoneNumber, address: address }, // Fields to update
          { new: true, runValidators: true } // Options: return the updated document and run validators
        );



        const payloadJwt = {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        }
        console.log(payloadJwt, 'already payloadJwt');


        const token = genrateToken(payloadJwt)
        return res.status(200).json({ response: existingUser, token: token })

      } else {
        const smsContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome To FINKARO</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #E9EAEC;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color:rgb(249, 251, 253);
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              padding-left: 20px;
              padding-right: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
            }
            .header img {
              max-width: 100px;
            }
            .content {
              padding: 20px;
              text-align: left;
            }
            .content h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
              color: #333333;
            }
            .content h1 span {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
              color: #333333;
            }
            .content p {
              font-size: 16px;
              line-height: 1.5;
              margin: 10px 0;
            }
            /* Remove style for all links */
            .content a {
              color: inherit;
              text-decoration: none;
            }
            .content a:hover {
              text-decoration: none;
            }
          .button {
  display: block;
  width: 100%;
  text-align: center;
  background-color: #FFC307;
  color: #fff !important;
  padding: 12px 24px;
  text-decoration: none;
  font-size: 16px;
  border-radius: 5px;
  margin: 20px 0;
  box-sizing: border-box; /* Ensures padding doesn't affect the width */
}
            /* Center the button */
            .button-container {
              text-align: center;
            }
            .button:hover {
              background-color: #FFC307;
              color: #fff;
            }
            .footer {
              font-size: 14px;
              color: #666;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
            }
            .footer a {
              color: black;
           
            }
            .footer a:hover {
              text-decoration: underline;
            }
            .divider {
              height: 1px;
              background-color: #000;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <table class="container" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div class="header">
                  <img src="https://yt3.googleusercontent.com/8j_6ZffEecoiSDm1XjvivBruW3td8dOjCnCMwufXg_4XuV00StCL9gjSQMvuROT7aq07oRhewj4=s900-c-k-c0x00ffffff-no-rj" alt="Finkaro Logo" />
                </div>
                <div class="content">
                  <h1>Welcome <span>${existingUser.email}</span>!</h1>
                  <br/>
                  <p>Thank you for joining FINKARO</p>
              
                  <p>Please click the confirmation button below and start using FINKARO.</p>
                  <div class="button-container">
                    <a href="${process.env.FRONTEND_LINK}/activate/${existingUser.id}" class="button" target="_blank">Confirm</a>
                  </div>
                  <p>
                    If the button is not working, please open this link in any browser: 
                    <a style = "color: blue !important" href="${process.env.FRONTEND_LINK}/activate/${existingUser.id}" target="_blank">${process.env.FRONTEND_LINK}/activate/${existingUser.id}</a>
                  </p>
                  <div class="divider"></div>
                  <p>Feel free to reach out if you need any assistance. Just respond to this email, and we’ll be sure to respond as soon as possible.</p>
                </div>
                <div class="footer">
                  <p>&copy; 2025 Finkaro. All rights reserved.</p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;




        res.status(404).json({ message: "Please visit your email to activate your account." })

        return sendRegistrationEmail(email, 'Welcome To FINKARO', '', '', smsContent);

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
    const { name, address, phoneNumber, pincode } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'No person found' });
    }

    // Validate and update only the provided fields
    let updated = false;

    if (name) {
      user.name = name;
      updated = true;
    } else {
      res.status(400).json({ message: 'Name is required to update' });
      return;
    }

    if (address) {
      user.address = address;
      updated = true;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
      updated = true;
    }

    if (pincode) {
      user.pincode = pincode;
      updated = true;
    }

    // If no fields were updated, return a message
    if (!updated) {
      return res.status(400).json({ message: 'At least one field (name, address, phone, or pincode) must be provided to update' });
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user response
    res.status(200).json(updatedUser);

  } catch (message) {
    res.status(500).json({ message: 'Server error', error: message });
  }
});


router.get('/getAlluser', jwtAuthMiddleWare, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query; // Extract query parameters

    // Pagination settings
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // If search is provided, create a filter. Otherwise, return all users.
    const searchFilter = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Search by name (case-insensitive)
          { email: { $regex: search, $options: 'i' } } // Search by email (case-insensitive)
        ]
      }
      : {};

    // Fetch users with optional search, pagination, and sorted by createdAt (descending)
    const users = await User.find(searchFilter)
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .skip(skip)
      .limit(limitNumber);

    // Get total count of matching users for pagination
    const count = await User.countDocuments(searchFilter);

    // Return the users and pagination info
    res.status(200).json({
      users,
      count
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.put('/updateRole/:id', jwtAuthMiddleWare, async (req, res) => {
  try {
    // Assuming `req.user` contains the authenticated user

    const tokenUser = req.user;
  
    if (tokenUser?.role !== 'superadmin') {
      return res.status(403).json({message: 'Forbidden: Only superadmin can perform this action' });
    }

    const userId = req.params.id;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body, // Fields to update
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});


module.exports = router;
