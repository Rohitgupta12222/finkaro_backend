const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const sendsubscribemail = async (email, name, subject, contant) => {

  const data = {
    email: email,
    name: name,
    subject: subject,
    contant: contant
  }
  let emailto = "finkaro2025@gmail.com"

  console.log('3rd step ',data , ' ================= ',process.env.EMAIL_USER);
  
  try {
    await transporter.sendMail({
      from: email,// Sender address,
      to:process.env.EMAIL_USER,// List of recipients
      subject,
      html: mailContant(data) 


    });
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const mailContant = (data) => {
return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header img {
            max-width: 150px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #007bff;
            font-size: 24px;
        }
        .content {
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .content p {
            margin: 0 0 10px;
        }
        .footer {
            text-align: center;
            font-size: 0.8em;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .footer p {
            margin: 0;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://media.licdn.com/dms/image/C4D0BAQFEiCNE7h-geg/company-logo_200_200/0/1669457873461?e=2147483647&v=beta&t=KlBILCEzV7ZL7daWHMC0C3lb0fXFikcNOCQaDyYdd58" alt="Company Logo">
            <h1>${data.subject}</h1>
        </div>
        <div class="content">
            <p>Hello Team,</p>
            <p><strong>Name:</strong> ${data?.name}</p>
            <p><strong>Email:</strong> ${data?.email}</p>
              <p> <strong>Contant :</strong>  ${data?.contant}
              </p>

            <p>Thank you for your attention.</p>
        </div>
        <div class="footer">
            <p>FINKARO &copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`

}


module.exports = sendsubscribemail;
