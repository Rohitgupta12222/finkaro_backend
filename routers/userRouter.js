const express = require("express");
const User = require("../models/users");
const router = express.Router();
const bcrypt = require("bcrypt");
const sendRegistrationEmail = require("../mail/registerMail"); // Adjust path to your mailer file
const { jwtAuthMiddleWare, generateToken } = require("../jwt/jwt");
const { activedAccount } = require("../mail/templateMail");

router.post("/register", async (req, res) => {
  const { email, password, name, isActive, address, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isActive) {
        const updatedUser = await User.findOneAndUpdate(
          { email },
          { phoneNumber, address },
          { new: true, runValidators: true }
        );
        if (!existingUser?.isActive) {
          const payloadJwt = {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
          };

          const token = generateToken(payloadJwt);

          return res.status(200).json({
            response: updatedUser,
            token,
          });
        } else {
          return res.status(403).json({
            status: "Failed",
            message: "Please check your email to activate your account.",
          
          });
        }
      } else {
        const smsContent = `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For Dashboard Purchase</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif; text-align: center;">

    <!-- Email Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6">
        <tr>
            <td align="center" style="padding: 20px;">
                <!-- Main Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header Section -->
                    <tr>
                          <td align="center" style="background-color: #f9fafb;">
                            <img src="https://www.finkaro.com/uploads/mailbanner.jpg"
                                 alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Welcome <strong>${existingUser.email}</strong>.</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                         Thank you for joining FINKARO
                            </p>
                                <p style="font-size: 15px; line-height: 1.5;">
                        Please click the confirmation button below:
                            </p>
    
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.FRONTEND_LINK}/user/activate/${existingUser.id}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                   Confirm
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                            <div class="footer">
            <p>Happy creating!</p>
            <p><strong>The Finkaro Team</strong></p>
            <p>&copy; 2024 Finkaro AI. All rights reserved.</p>
        </div>
                          
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>

        `;

        await sendRegistrationEmail(email, "Welcome To FINKARO",'','', smsContent);

        return res.status(201).json({
          data: existingUser,
          token: generateToken({
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
          }),
          message: "Please visit your email to activate your account.",
        });
      }
    }

    // If the user doesn't exist, register a new user
    const newUser = new User(req.body);
    const response = await newUser.save();

    const activationLink = `${process.env.FRONTEND_LINK}/user/activate/${response.id}`;

    if (!isActive) {
      const smsContent = `
 
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For Dashboard Purchase</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif; text-align: center;">

    <!-- Email Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6">
        <tr>
            <td align="center" style="padding: 20px;">
                <!-- Main Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header Section -->
                    <tr>
                          <td align="center" style="background-color: #f9fafb;">
                            <img src="https://www.finkaro.com/uploads/mailbanner.jpg"
                                 alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>  Dear ${name},</strong></b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                           Welcome to Our Service!
                            </p>
                                <p style="font-size: 15px; line-height: 1.5;">
                          Your account has been successfully created. To start using your account, please activate it by clicking the link below:
                            </p>
                                <a style="font-size: 15px; line-height: 1.5;" href=" ${activationLink}"> ${activationLink}
                          
                            </a>
                             <p style="font-size: 15px; line-height: 1.5;">
                        Here are your account details:
     

                            </p>
                               <p style="font-size: 15px; line-height: 1.5;">
                                         
      - **Email**: ${response?.email} <br/>
      - **Password**: ${password}
                            </p>
    
        <p style="font-size: 15px; line-height: 1.5;">
                                         
     Please keep this information safe and secure. You can use these credentials to log in after activating your account.

                            </p>
                           
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                            <div class="footer">
            <p>Happy creating!</p>
            <p><strong>The Finkaro Team</strong></p>
            <p>&copy; 2024 Finkaro AI. All rights reserved.</p>
        </div>
                          
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>

      `;

      await sendRegistrationEmail(email, "Activate Your Account",'','', smsContent);

      return res.status(201).json({
        data: response,
        token: generateToken({
          id: response.id,
          email: response.email,
          role: response.role,
        }),
        message: "Please visit your email to activate your account.",
      });
    } else {
      const payloadJwt = {
        id: response.id,
        email: response.email,
        role: response.role,
      };

      const token = generateToken(payloadJwt);

      const emailContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>For Dashboard Purchase</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif; text-align: center;">

    <!-- Email Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6">
        <tr>
            <td align="center" style="padding: 20px;">
                <!-- Main Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header Section -->
                    <tr>
                          <td align="center" style="background-color: #f9fafb;">
                            <img src="https://www.finkaro.com/uploads/mailbanner.jpg"
                                 alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>  Dear ${name},</strong></b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                           Welcome to Our Service!
                            </p>
                                <p style="font-size: 15px; line-height: 1.5;">
                          Your account has been successfully created. To start using your account, please activate it by clicking the link below:
                            </p>
                                <a style="font-size: 15px; line-height: 1.5;" href=" ${activationLink}"> ${activationLink}
                          
                            </a>
                             <p style="font-size: 15px; line-height: 1.5;">
                        Here are your account details:
     

                            </p>
                               <p style="font-size: 15px; line-height: 1.5;">
                                         
      - **Email**: ${response?.email} <br/>
      - **Password**: ${password}
                            </p>
    
        <p style="font-size: 15px; line-height: 1.5;">
                                         
     Please keep this information safe and secure. You can use these credentials to log in after activating your account.

                            </p>
                           
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                            <div class="footer">
            <p>Happy creating!</p>
            <p><strong>The Finkaro Team</strong></p>
            <p>&copy; 2024 Finkaro AI. All rights reserved.</p>
        </div>
                          
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>

      `;

      await sendRegistrationEmail(
        email,
        "Registration Successful",'','',
        emailContent
      );

      return res.status(201).json({
        response,
        token,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.boby);

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isActive) {
      const activationLink = `${process.env.FRONTEND_LINK}/user/activate/${user.id}`;

      const smsContent = `

      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>For Dashboard Purchase</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif; text-align: center;">
      
          <!-- Email Wrapper -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6">
              <tr>
                  <td align="center" style="padding: 20px;">
                      <!-- Main Container -->
                      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                          
                          <!-- Header Section -->
                          <tr>
                                <td align="center" style="background-color: #f9fafb;">
                                  <img src="https://www.finkaro.com/uploads/mailbanner.jpg"
                                       alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                              </td>
                          </tr>
      
                          <tr>
                              <td align="left" style="padding: 30px; color: #4b5563;">
                                  <p style="font-size: 16px; margin: 15px 0 20px;"><b>  Dear ${user?.name},</strong></b></p>
                                  <p style="font-size: 15px; line-height: 1.5;">
                                 Welcome to Our Service!
                                  </p>
                                      <p style="font-size: 15px; line-height: 1.5;">
                                Your account has been successfully created. To start using your account, please activate it by clicking the link below:
                                  </p>
                                      <a style="font-size: 15px; line-height: 1.5;" href=" ${activationLink}"> ${activationLink}
                                
                                  </a>
                                  
          
              <p style="font-size: 15px; line-height: 1.5;">
                                               
           Please keep this information safe and secure. You can use these credentials to log in after activating your account.
      
                                  </p>
                                 
                              </td>
                          </tr>
      
                          <!-- Footer Section -->
                          <tr>
                              <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                                  <div class="footer">
                  <p>Happy creating!</p>
                  <p><strong>The Finkaro Team</strong></p>
                  <p>&copy; 2024 Finkaro AI. All rights reserved.</p>
              </div>
                                
                              </td>
                          </tr>
      
                      </table>
                  </td>
              </tr>
          </table>
      
      </body>
      </html>
      `;

      await sendRegistrationEmail(
        email,
        "Account Activation Required"
        ,'','',
        smsContent
      );

      return res
        .status(403)
        .json({ message: "Please check your email to activate your account." });
    }

    const check = await user.comparePassword(password);
    if (!check) return res.status(401).json({ message: "Invalid password" });

    const payload = {
      id: user.id,
      name: user.email,
      role: user.role,
    };

    res.status(200).json({ response: user, token: generateToken(payload) });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/activateProfile", async (req, res) => {
  try {
    const { id } = req.body; // Access the userId from the decoded token

    const user = await User.findById(id);
    console.log(user, "usr data");
    user.isActive = true;
    await user.save();
    console.log("activated successfullly");
    const payload = {
      id: user.id,
      name: user.email,
      role: user.role,
    };
    activedAccount(user.email, user.name);
    return res
      .status(200)
      .json({ response: user, token: generateToken(payload) });
  } catch (message) {
    console.log(message);
    res.status(500).json({ message: "Internal Server message" });
  }
});

router.get("/profile", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id; // Access the userId from the decoded token
    console.log(userId, "userId");
    const user = await User.findById(userId);

    res.status(200).json({ response: user });
  } catch (message) {
    console.log(message);
    res.status(500).json({ message: "Internal Server message" });
  }
});

router.put("/profile/password", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    console.log(userId, "user id ");
    console.log(req.body, "user req.body ");

    const user = await User.findById(userId);
    console.log(user, "data user");
    console.log(
      await user.comparePassword(
        currentPassword,
        "await user.comparePassword(currentPassword user"
      )
    );

    if (!(await user.comparePassword(currentPassword))) {
      console.log("Current password is not match");

      return res.status(404).json({ message: "Current password is not match" });
    }
    user.password = newPassword;
    await user.save();
    console.log("password updated successfullly");
    return res.status(200).json({ message: " password updated successfullly" });
  } catch (message) {
    console.log(message);

    res.status(500).json({ message: "Internal Server message" });
  }
});

router.put("/profile/:id", jwtAuthMiddleWare, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, address, phoneNumber, pincode } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "No person found" });
    }

    // Validate and update only the provided fields
    let updated = false;

    if (name) {
      user.name = name;
      updated = true;
    } else {
      res.status(400).json({ message: "Name is required to update" });
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
      return res
        .status(400)
        .json({
          message:
            "At least one field (name, address, phone, or pincode) must be provided to update",
        });
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user response
    res.status(200).json(updatedUser);
  } catch (message) {
    res.status(500).json({ message: "Server error", error: message });
  }
});

router.get("/getAlluser", jwtAuthMiddleWare, async (req, res) => {
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
            { name: { $regex: search, $options: "i" } }, // Search by name (case-insensitive)
            { email: { $regex: search, $options: "i" } }, // Search by email (case-insensitive)
          ],
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
      count,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.put("/updateRole/:id", jwtAuthMiddleWare, async (req, res) => {
  try {
    // Assuming `req.user` contains the authenticated user

    const tokenUser = req.user;

    if (tokenUser?.role !== "superadmin") {
      return res
        .status(403)
        .json({
          message: "Forbidden: Only superadmin can perform this action",
        });
    }

    const userId = req.params.id;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body, // Fields to update
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
