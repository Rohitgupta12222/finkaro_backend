const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const sendsubscribemail = async (from, subject, text) => {
  try {
    await transporter.sendMail({
      from: from ,// Sender address,
      to :  process.env.EMAIL_USER,// List of recipients
      subject, // Subject line
      text, // Plain text body
      // html: '<b>Hello world?</b>' // If you want to send HTML content
    });
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendsubscribemail;
