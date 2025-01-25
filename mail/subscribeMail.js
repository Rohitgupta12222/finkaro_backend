const nodemailer = require('nodemailer');
require('dotenv').config();
const Subscribe = require('../models/subscribeList'); // Adjust the path to your Subscribe model
const User = require('../models/users'); // Adjust the path to your User model


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

  
  try {
    await transporter.sendMail({
      from: email,// Sender address,
      to:process.env.EMAIL_USER,// List of dummyEmails
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

async function sendBulkEmails(subject, blogDescription, url) {
    try {
      // Fetch email addresses from the Subscribe model
      const subscribers = await Subscribe.find({}, 'email'); // Fetch only email field
      const subscriberEmails = subscribers.map((subscriber) => subscriber.email);
  
      // Fetch email addresses from the User model where role is 'user'
      const users = await User.find({ role: 'user' }, 'email'); // Fetch only email field
      const userEmails = users.map((user) => user.email);
  
      // Combine all email dummyEmails and ensure they are unique
      const dummyEmails = [...new Set([...subscriberEmails, ...userEmails])];
      const batchSize = dummyEmails.length
  
      // Set up the email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Replace with your email service
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS, // Your email password or app password
        },
      });
  
      // Function to send emails in batches
      const sendBatchEmails = async (batch) => {
        for (const recipient of batch) {
          const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: recipient, // Individual recipient
            subject, // Subject line
            html: `
              <h1>${subject}</h1>
              <p>${blogDescription}</p>
              <br />
              <p>Read more on our website:</p>
              <a href="${url}">${url}</a>
            `,
          };
  
          // Send the email
          await transporter.sendMail(mailOptions);
        }
      };
  
      // Process emails in batches
      for (let i = 0; i < dummyEmails.length; i += batchSize) {
        const batch = dummyEmails.slice(i, i + batchSize);
        console.log(`Sending batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(dummyEmails.length / batchSize)}`);
        await sendBatchEmails(batch); // Send the batch
        console.log( 'email ' + i + ' sent');
        
      }
  
      console.log('All emails sent successfully');
    } catch (error) {
      console.error('Error sending bulk emails:', error);
    }
  }
  

  const dummyEmails = [
      "dummyuser1@example.com", "dummyuser2@example.com", "dummyuser3@example.com", "dummyuser4@example.com", "dummyuser5@example.com",
      "dummyuser6@example.com", "dummyuser7@example.com", "dummyuser8@example.com", "dummyuser9@example.com", "dummyuser10@example.com",
      "dummyuser11@example.com", "dummyuser12@example.com", "dummyuser13@example.com", "dummyuser14@example.com", "dummyuser15@example.com",
      "dummyuser16@example.com", "dummyuser17@example.com", "dummyuser18@example.com", "dummyuser19@example.com", "dummyuser20@example.com",
      "dummyuser21@example.com", "dummyuser22@example.com", "dummyuser23@example.com", "dummyuser24@example.com", "dummyuser25@example.com",
      "dummyuser26@example.com", "dummyuser27@example.com", "dummyuser28@example.com", "dummyuser29@example.com", "dummyuser30@example.com",
      "dummyuser31@example.com", "dummyuser32@example.com", "dummyuser33@example.com", "dummyuser34@example.com", "dummyuser35@example.com",
      "dummyuser36@example.com", "dummyuser37@example.com", "dummyuser38@example.com", "dummyuser39@example.com", "dummyuser40@example.com",
      "dummyuser41@example.com", "dummyuser42@example.com", "dummyuser43@example.com", "dummyuser44@example.com", "dummyuser45@example.com",
      "dummyuser46@example.com", "dummyuser47@example.com", "dummyuser48@example.com", "dummyuser49@example.com", "dummyuser50@example.com",
      "dummyuser51@example.com", "dummyuser52@example.com", "dummyuser53@example.com", "dummyuser54@example.com", "dummyuser55@example.com",
      "dummyuser56@example.com", "dummyuser57@example.com", "dummyuser58@example.com", "dummyuser59@example.com", "dummyuser60@example.com",
      "dummyuser61@example.com", "dummyuser62@example.com", "dummyuser63@example.com", "dummyuser64@example.com", "dummyuser65@example.com",
      "dummyuser66@example.com", "dummyuser67@example.com", "dummyuser68@example.com", "dummyuser69@example.com", "dummyuser70@example.com",
      "dummyuser71@example.com", "dummyuser72@example.com", "dummyuser73@example.com", "dummyuser74@example.com", "dummyuser75@example.com",
      "dummyuser76@example.com", "dummyuser77@example.com", "dummyuser78@example.com", "dummyuser79@example.com", "dummyuser80@example.com",
      "dummyuser81@example.com", "dummyuser82@example.com", "dummyuser83@example.com", "dummyuser84@example.com", "dummyuser85@example.com",
      "dummyuser86@example.com", "dummyuser87@example.com", "dummyuser88@example.com", "dummyuser89@example.com", "dummyuser90@example.com",
      "dummyuser91@example.com", "dummyuser92@example.com", "dummyuser93@example.com", "dummyuser94@example.com", "dummyuser95@example.com",
      "dummyuser96@example.com", "dummyuser97@example.com", "dummyuser98@example.com", "dummyuser99@example.com", "dummyuser100@example.com",
      "dummyuser101@example.com", "dummyuser102@example.com", "dummyuser103@example.com", "dummyuser104@example.com", "dummyuser105@example.com",
      "dummyuser106@example.com", "dummyuser107@example.com", "dummyuser108@example.com", "dummyuser109@example.com", "dummyuser110@example.com",
      "dummyuser111@example.com", "dummyuser112@example.com", "dummyuser113@example.com", "dummyuser114@example.com", "dummyuser115@example.com",
      "dummyuser116@example.com", "dummyuser117@example.com", "dummyuser118@example.com", "dummyuser119@example.com", "dummyuser120@example.com",
      "dummyuser121@example.com", "dummyuser122@example.com", "dummyuser123@example.com", "dummyuser124@example.com", "dummyuser125@example.com",
      "dummyuser126@example.com", "dummyuser127@example.com", "dummyuser128@example.com", "dummyuser129@example.com", "dummyuser130@example.com",
      "dummyuser131@example.com", "dummyuser132@example.com", "dummyuser133@example.com", "dummyuser134@example.com", "dummyuser135@example.com",
      "dummyuser136@example.com", "dummyuser137@example.com", "dummyuser138@example.com", "dummyuser139@example.com", "dummyuser140@example.com",
      "dummyuser141@example.com", "dummyuser142@example.com", "dummyuser143@example.com", "dummyuser144@example.com", "dummyuser145@example.com",
      "dummyuser146@example.com", "dummyuser147@example.com", "dummyuser148@example.com", "dummyuser149@example.com", "dummyuser150@example.com",
      "dummyuser151@example.com", "dummyuser152@example.com", "dummyuser153@example.com", "dummyuser154@example.com", "dummyuser155@example.com",
      "dummyuser156@example.com", "dummyuser157@example.com", "dummyuser158@example.com", "dummyuser159@example.com", "dummyuser160@example.com",
      "dummyuser161@example.com", "dummyuser162@example.com", "dummyuser163@example.com", "dummyuser164@example.com", "dummyuser165@example.com",
      "dummyuser166@example.com", "dummyuser167@example.com", "dummyuser168@example.com", "dummyuser169@example.com", "dummyuser170@example.com",
      "dummyuser171@example.com", "dummyuser172@example.com", "dummyuser173@example.com", "dummyuser174@example.com", "dummyuser175@example.com",
      "dummyuser176@example.com", "dummyuser177@example.com", "dummyuser178@example.com", "dummyuser179@example.com", "dummyuser180@example.com",
      "dummyuser181@example.com", "dummyuser182@example.com", "dummyuser183@example.com", "dummyuser184@example.com", "dummyuser185@example.com",
      "dummyuser186@example.com", "dummyuser187@example.com", "dummyuser188@example.com", "dummyuser189@example.com", "dummyuser190@example.com",
      "dummyuser191@example.com", "dummyuser192@example.com", "dummyuser193@example.com", "dummyuser194@example.com", "dummyuser195@example.com",
      "dummyuser196@example.com", "dummyuser197@example.com", "dummyuser198@example.com", "dummyuser199@example.com", "dummyuser200@example.com",
      "dummyuser201@example.com", "dummyuser202@example.com", "dummyuser203@example.com", "dummyuser204@example.com", "dummyuser205@example.com",
      "dummyuser206@example.com", "dummyuser207@example.com", "dummyuser208@example.com", "dummyuser209@example.com", "dummyuser210@example.com",
      "dummyuser211@example.com", "dummyuser212@example.com", "dummyuser213@example.com", "dummyuser214@example.com", "dummyuser215@example.com",
      "dummyuser216@example.com", "dummyuser217@example.com", "dummyuser218@example.com", "dummyuser219@example.com", "dummyuser220@example.com",
      "dummyuser221@example.com", "dummyuser222@example.com", "dummyuser223@example.com", "dummyuser224@example.com", "dummyuser225@example.com",
      "dummyuser226@example.com", "dummyuser227@example.com", "dummyuser228@example.com", "dummyuser229@example.com", "dummyuser230@example.com",
      "dummyuser231@example.com", "dummyuser232@example.com", "dummyuser233@example.com", "dummyuser234@example.com", "dummyuser235@example.com",
      "dummyuser236@example.com", "dummyuser237@example.com", "dummyuser238@example.com", "dummyuser239@example.com", "dummyuser240@example.com",
      "dummyuser241@example.com", "dummyuser242@example.com", "dummyuser243@example.com", "dummyuser244@example.com", "dummyuser245@example.com",
      "dummyuser246@example.com", "dummyuser247@example.com", "dummyuser248@example.com", "dummyuser249@example.com", "dummyuser250@example.com",
      "dummyuser251@example.com", "dummyuser252@example.com", "dummyuser253@example.com", "dummyuser254@example.com", "dummyuser255@example.com",
      "dummyuser256@example.com", "dummyuser257@example.com", "dummyuser258@example.com", "dummyuser259@example.com", "dummyuser260@example.com",
      "dummyuser261@example.com", "dummyuser262@example.com", "dummyuser263@example.com", "dummyuser264@example.com", "dummyuser265@example.com",
      "dummyuser266@example.com", "dummyuser267@example.com", "dummyuser268@example.com", "dummyuser269@example.com", "dummyuser270@example.com",
      "dummyuser271@example.com", "dummyuser272@example.com", "dummyuser273@example.com", "dummyuser274@example.com", "dummyuser275@example.com",
      "dummyuser276@example.com", "dummyuser277@example.com", "dummyuser278@example.com", "dummyuser279@example.com", "dummyuser280@example.com",
      "dummyuser281@example.com", "dummyuser282@example.com", "dummyuser283@example.com", "dummyuser284@example.com", "dummyuser285@example.com",
      "dummyuser286@example.com", "dummyuser287@example.com", "dummyuser288@example.com", "dummyuser289@example.com", "dummyuser290@example.com",
      "dummyuser291@example.com", "dummyuser292@example.com", "dummyuser293@example.com", "dummyuser294@example.com", "dummyuser295@example.com",
      "dummyuser296@example.com", "dummyuser297@example.com", "dummyuser298@example.com", "dummyuser299@example.com", "dummyuser300@example.com"
  ];
  ```
  
module.exports = {sendsubscribemail,sendBulkEmails};
