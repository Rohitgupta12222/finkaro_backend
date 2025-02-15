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
            to: process.env.EMAIL_USER,// List of recipients
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

async function sendBulkEmails(subject, blog, url) {
    try {
        // Fetch email addresses from the Subscribe model
        const subscribers = await Subscribe.find({}, 'email'); // Fetch only email field
        const subscriberEmails = subscribers.map((subscriber) => subscriber.email);

        // Fetch email addresses from the User model where role is 'user'
        const users = await User.find({ role: 'user' }, 'email'); // Fetch only email field
        const userEmails = users.map((user) => user.email);

        // Combine all email recipients and ensure they are unique
        // const recipients = [...new Set([...subscriberEmails, ...userEmails])];
         const recipients = ["rohitgupta.dec13@gmail.com","anilmg8898@gmail.com"];
        // 

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Replace with your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        // Loop through all recipients and send individual emails
        for (const recipient of recipients) {
            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender address
                to: recipient, // Individual recipient
                subject, // Subject line
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex justify-center p-6">
    <div class="max-w-lg w-full bg-white shadow-md border border-gray-200 rounded-md">
        <!-- Header -->
        <div class="bg-gray-50  text-center ">
            <div class="w-full flex justify-center">
                 <img src="${blog?.coverImages}" alt="Blog Image" class="w-full">
            </div>
        </div>

        <!-- Blog Content -->
        <div class="p-6">
            <div class="w-full">
                <img src="blog-image.jpg" alt="Blog Image" class="w-full rounded-md">
            </div>

            <p class="mt-4 text-gray-700 text-center">
                We just published a new blog post that we think you’ll love!
            </p>

            <!-- Blog Details -->
            <div class="mt-4">
                <p class="flex items-center text-gray-800 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l-4-4m0 0l4-4m-4 4h16"></path>
                    </svg>
                    Blog Title: 
                    <span class="font-normal text-gray-600 ml-1">${blog?.title}</span>
                </p>
                <p class="flex items-center text-gray-800 font-semibold mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Author: 
                    <span class="font-normal text-gray-600 ml-1">[Author Name]</span>
                </p>
                <p class="flex items-center text-gray-800 font-semibold mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h4m4 0h.01M8 11h8m-8 4h8"></path>
                    </svg>
                    Published on: 
                    <span class="font-normal text-gray-600 ml-1">${new Date(blog?.createdAt).getDate()}</span>
                </p>
            </div>

            <!-- Quick Preview -->
            <div class="mt-4">
                <p class="text-gray-900 font-bold">Quick Preview:</p>
                <p class="text-gray-700 mt-1">
                   ${blog?.shortDescription}
                </p>
            </div>

            <p class="text-gray-700 mt-4">Read More….</p>

            <!-- Button -->
            <div class="mt-6 flex justify-center">
                <a href="${url}" class="bg-black text-white font-semibold px-6 py-2 rounded-md hover:bg-gray-900">
                    View Blog
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-100 text-center p-6 border-t">
            <p class="text-gray-700">Happy creating!</p>
            <p class="text-gray-900 font-bold">The Finkaro Team</p>
            <p class="text-gray-500 text-sm mt-2">Copyright © 2024 Finkaro AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
            };


            // Send the email
            transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error('Error sending bulk emails:', error);
    }
}
async function sendBulkEmailsCourse(subject, url) {
    try {
        // Fetch email addresses from the Subscribe model
        const subscribers = await Subscribe.find({}, 'email'); // Fetch only email field
        const subscriberEmails = subscribers.map((subscriber) => subscriber.email);

        // Fetch email addresses from the User model where role is 'user'
        const users = await User.find({ role: 'user' }, 'email'); // Fetch only email field
        const userEmails = users.map((user) => user.email);

        // Combine all email recipients and ensure they are unique
        const recipients = [...new Set([...subscriberEmails, ...userEmails])];
        // const recipients = ["rohitgupta.dec13@gmail.com","anilmg8898@gmail.com"];
        // 

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Replace with your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        // Loop through all recipients and send individual emails
        for (const recipient of recipients) {
            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender address
                to: recipient, // Individual recipient
                subject, // Subject line
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email - Finkaro</title>
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
                        <td align="center" style="background-color: #f9fafb; padding: 20px;">
                            <img src="https://ci3.googleusercontent.com/meips/ADKq_NbdwhXy8Q_DwbDJ5PskRQuUwPXrzanb_52edOxqOLTQ7tpsia4_Jx5TBtLsS41VleNyLAlIuuIds5BHSaUKlahCkRl_68DJXWixjJgH987JQaN6_omM6Q=s0-d-e1-ft#https://email-assets.Finkaro.ai/automations/welcome/header.png?v=2"
                                 alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <!-- Centered Welcome Message -->
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <h1 style="font-size: 22px; font-weight: bold; color: #111827; margin: 0;">Welcome to <span style="color: #000;">Finkaro</span>!</h1>
                        </td>
                    </tr>

                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;">Hello Anil,</p>
                            <p style="font-size: 15px; line-height: 1.5;">
                                Welcome to Finkaro, where your content gets a visual upgrade. Whether it's slides for your next big talk, 
                                a technical blog post, or your next LinkedIn update, we're here to unlock the visual potential of your text content.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">Here are 4 ways you can use Finkaro today:</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p>📊 <strong>Presentations:</strong> Generate simple diagrams from your slide text.</p>
                                        <p>📰 <strong>Blogs + Newsletters:</strong> Create shareable visuals from key paragraphs.</p>
                                        <p>📱 <strong>Social Media:</strong> Convert your post into an engaging graphic.</p>
                                        <p>📄 <strong>Documentation:</strong> Make easy-to-read docs with visuals.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://finkaro.com" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Go to Finkaro
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                            <p style="font-size: 14px; margin: 0;">Happy creating! <br> <strong>The Finkaro Team</strong></p>
                            <p style="font-size: 12px; margin: 10px 0 0; color: #9ca3af;">Copyright © 2024 Finkaro AI. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
         `,
            };


            // Send the email
            transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error('Error sending bulk emails:', error);
    }
}
async function sendBulkEmailsDashboard(subject, url) {
    try {
        // Fetch email addresses from the Subscribe model
        const subscribers = await Subscribe.find({}, 'email'); // Fetch only email field
        const subscriberEmails = subscribers.map((subscriber) => subscriber.email);

        // Fetch email addresses from the User model where role is 'user'
        const users = await User.find({ role: 'user' }, 'email'); // Fetch only email field
        const userEmails = users.map((user) => user.email);

        // Combine all email recipients and ensure they are unique
        const recipients = [...new Set([...subscriberEmails, ...userEmails])];
        // const recipients = ["rohitgupta.dec13@gmail.com","anilmg8898@gmail.com"];
        // 

        // Set up the email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Replace with your email service
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        // Loop through all recipients and send individual emails
        for (const recipient of recipients) {
            const mailOptions = {
                from: process.env.EMAIL_USER, // Sender address
                to: recipient, // Individual recipient
                subject, // Subject line
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email - Finkaro</title>
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
                        <td align="center" style="background-color: #f9fafb; padding: 20px;">
                            <img src="https://ci3.googleusercontent.com/meips/ADKq_NbdwhXy8Q_DwbDJ5PskRQuUwPXrzanb_52edOxqOLTQ7tpsia4_Jx5TBtLsS41VleNyLAlIuuIds5BHSaUKlahCkRl_68DJXWixjJgH987JQaN6_omM6Q=s0-d-e1-ft#https://email-assets.Finkaro.ai/automations/welcome/header.png?v=2"
                                 alt="Finkaro Header Image" width="100%" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <!-- Centered Welcome Message -->
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <h1 style="font-size: 22px; font-weight: bold; color: #111827; margin: 0;">Welcome to <span style="color: #000;">Finkaro</span>!</h1>
                        </td>
                    </tr>

                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;">Hello Anil,</p>
                            <p style="font-size: 15px; line-height: 1.5;">
                                Welcome to Finkaro, where your content gets a visual upgrade. Whether it's slides for your next big talk, 
                                a technical blog post, or your next LinkedIn update, we're here to unlock the visual potential of your text content.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">Here are 4 ways you can use Finkaro today:</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p>📊 <strong>Presentations:</strong> Generate simple diagrams from your slide text.</p>
                                        <p>📰 <strong>Blogs + Newsletters:</strong> Create shareable visuals from key paragraphs.</p>
                                        <p>📱 <strong>Social Media:</strong> Convert your post into an engaging graphic.</p>
                                        <p>📄 <strong>Documentation:</strong> Make easy-to-read docs with visuals.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://finkaro.com" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Go to Finkaro
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td align="center" style="background-color: #111827; color: #ffffff; padding: 20px;">
                            <p style="font-size: 14px; margin: 0;">Happy creating! <br> <strong>The Finkaro Team</strong></p>
                            <p style="font-size: 12px; margin: 10px 0 0; color: #9ca3af;">Copyright © 2024 Finkaro AI. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
         `,
            };


            // Send the email
            transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error('Error sending bulk emails:', error);
    }
}


module.exports = { sendsubscribemail, sendBulkEmails, sendBulkEmailsCourse, sendBulkEmailsDashboard };
