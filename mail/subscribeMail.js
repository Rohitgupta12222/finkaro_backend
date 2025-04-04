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

async function sendsubscribemail(email, name) {

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "Welcome to Finkaro",
            html: `
            <!DOCTYPE html>
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
                            <img src="https://www.finkaro.com/uploads/mailbanner.jpg"
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
                            <p style="font-size: 16px; margin: 15px 0 20px;">Hello ${name},</p>
                            <p style="font-size: 15px; line-height: 1.5;">
                               Welcome to Finkaro, where we empower you with financial knowledge, smart investment strategies, and powerful data insights.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">Here are 4 ways you can benefit from Finkaro today:</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p>📖 <strong>Insightful Blogs:</strong> Stay updated with expert-written articles on finance, investing, and wealth management</p>
                                        <p>📊  <strong> Portfolio Management Services:</strong> Optimize your investments with our data-driven strategies and expert guidance.</p>
                                        <p>📈 <strong> Power BI Dashboards:</strong> Get interactive and real-time financial insights with our custom-built Power BI dashboards.</p>
                                        <p>📚 <strong> Finance Book:</strong> Elevate your financial knowledge with our exclusive book, designed to help you make smarter investment decisions.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://finkaro.com" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Visit Finkaro
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



`


        });
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};



async function sendBulkEmails( blogs, url) {
   
    const blog = blogs;
    try {
        // Fetch email addresses from the Subscribe model
        const subscribers = await Subscribe.find({}, 'email'); // Fetch only email field
        const subscriberEmails = subscribers.map((subscriber) => subscriber.email);

        // Fetch email addresses from the User model where role is 'user'
        const users = await User.find({ role: 'user' }, 'email'); // Fetch only email field
        const userEmails = users.map((user) => user.email);

        // Combine all email recipients and ensure they are unique
        const recipients = [...new Set([...subscriberEmails, ...userEmails])];
        // const recipients = ["rohitgupta.dec13@gmail.com"];
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
                subject:blogs?.title, // Subject line
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>

    <style>
        /* Reset styles for email compatibility */
        body, p, h1, h2, h3, h4, h5, h6 {
            margin: 0;
            padding: 0; 
        }
        body {
            background-color: #f3f4f6;
            font-family: Arial, sans-serif;
            padding: 0;
            width: 100%;
            text-align: center;
        }
        table {
            width: 100%;
            background-color: #f3f4f6;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: 40px auto;
        }
        .header img {
            width: 100%;
            height: auto;
            display: block;
            border-bottom: 1px solid #e5e7eb;
        }
        .content {
            padding: 24px;
            text-align: left;
        }
        .blog-image {
            width: 100%;
            border-radius: 8px;
        }
        .text-gray-700 { color: #374151; }
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        .mt-4 { margin-top: 16px; }
        .mt-2 { margin-top: 8px; }
        .button-container {
            text-align: center;
            margin-top: 20px;
        }
        .btn {
            display: inline-block;
            background-color: black;
            color: white;
            font-weight: bold;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
        }
        .btn:hover {
            background-color: #1f2937;
        }
        .footer {
            background-color: #f3f4f6;
            text-align: center;
            padding: 24px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p { margin: 4px 0; }
        @media screen and (max-width: 600px) {
            .container {
                width: 100%;
            }
            .header img {
                height: auto;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" align="center">
        <tr>
            <td align="center">
                <table role="presentation" class="container">
                    <tr>
                        <td>
                            <div class="header">
                                <img src="https://www.finkaro.com/uploads/mailbanner.jpg" alt="Blog Banner">
                            </div>
                            <div class="content">
                                <img src="${blog?.coverImage}" alt="Blog Image" class="blog-image">
                                <p class="mt-4 text-gray-700">
                                    We just published a new blog post that we think you’ll love! 
                                </p>
                                <div class="mt-4">
                                    <p class="font-semibold text-gray-800">
                                        <strong>Blog Title:</strong> <span class="text-gray-600 font-normal">${blog?.title}</span>
                                    </p>
                                    <p class="font-semibold text-gray-800 mt-2">
                                        <strong>Author:</strong> <span class="text-gray-600 font-normal">Kasfur Dhuniyan</span>
                                    </p>
                                    <p class="font-semibold text-gray-800 mt-2">
                                        <strong>Published on:</strong> <span class="text-gray-600 font-normal">${new Date(blog?.createdAt).toDateString()}</span>
                                    </p>
                                </div>
                                <div class="mt-4">
                                    <p class="text-gray-900 font-bold">Quick Preview:</p>
                                    <p class="text-gray-700 mt-2">${blog?.shortDescription.substring(0, 100)}...</p>
                                </div>
                                <p class="text-gray-700 mt-4">Read More….</p>
                                <div class="button-container">
                                    <a href="${url}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">View Blog</a>
                                </div>
                            </div>
                            <div class="footer">
                                <p class="text-gray-700">Happy creating!</p>
                                <p class="text-gray-900 font-bold">The Finkaro Team</p>
                                <p class="text-gray-500 text-sm mt-2">Copyright © 2024 Finkaro AI. All rights reserved.</p>
                            </div>
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
