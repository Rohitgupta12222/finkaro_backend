const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const sendRegistrationEmail = async (to, subject, text, attachmentPath,html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to, // List of recipients
      subject, // Subject line
      text,
      html, // Plain text body

      // html: '<b>Hello world?</b>', // If you want to send HTML content
    };

    // Add attachments if attachmentPath is provided
    if (attachmentPath) {
      mailOptions.attachments = [
        {
          path: attachmentPath, // File path for the attachment
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendRegistrationEmail;
