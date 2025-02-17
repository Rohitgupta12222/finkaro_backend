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

async function dashboardBuy(email, title, url) {

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "For Dashboard Purchase",
            html: `
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

                

                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Hi Finkaro Member,</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                             Thank you for purchasing the ${title} from Finkaro! Your dashboard files are ready for download, and you’re just a few clicks away from gaining powerful data insights.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">📂 Your Files:<br/>
✅ Power BI Dashboard (.pbix file)<br/>
✅ Excel Dataset (.xlsx file) used for development</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p><strong>💡 What’s Next?</strong><br/>
✔ Open the .pbix file in Power BI to explore the dashboard.<br/>
✔ Use the Excel dataset to understand and modify the data structure.<br/>
✔ Get insights, analyze trends, and make data-driven decisions!</p>
 
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${url}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Visit Dashboard 
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
async function courseBuy(email, name, courseData, plan, url) {
    let course = courseData;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "Thank You for Your Purchase – Your Finance Course Awaits!",
            html: ` <!DOCTYPE html>
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

   
                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Hi  ${name},</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                           Congratulations! 🎉 You’ve successfully enrolled in our course on <b>Finkaro</b>. Get ready to enhance your <b>${course?.title}</b> with expert-led video lessons.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">📚 Course Details:<br/>
🎥 Course Name: ${course?.title}<br/>
📅 Access Duration: ${plan} <br/>
🔗 Start Learning Now: Login & Access Course</h2><br/>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p><strong>💡What You’ll Learn</strong><br/>
✔Gain in-depth financial knowledge.<br/>
✔ Understand technical concepts with real-world applications.<br/>
✔  Learn at your own pace with high-quality video lessons.</p>


 
                                    </td>
                                </tr>
                                    <tr>
                                    <td>
                                        <p><strong>🚀 Next Steps:</strong><br/>
1️⃣ Click the link above to access your course.<br/>
2️⃣ Start watching the videos and take notes.
<br/>
3️⃣ Apply your new skills with confidence!</p>


 
                                    </td>
                                </tr>
                                 <tr>
                                    <td>
                                        <p><strong>📩 Need Help?</strong>
 If you have any questions, feel free to reply to this email. Our support team is here to assist you!<br/> <br/>
Happy Learning! 📖



 
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${url}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Visit Course 
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
async function serviceBuy(email, name, servicesData,endDate, url) {
    let services = servicesData;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "Thank You for Choosing Finkaro – We’ll Contact You Shortly!",
            html: ` <!DOCTYPE html>
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

               

                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Hi  ${name},</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                          Thank you for subscribing for finkaro service. Your request has been successfully received, and our team will personally reach out to you soon to discuss the next steps.
                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">📌 Service Details:</h2><br/>
🔹 <b>Service Name:</b>${services?.title}<br/>
🔹 <b>Purchase Date:</b>${new Date(endDate).toDateString()} <br/>
🔹 <b>Next Step:</b> Our expert will contact you shortly for further discussion.<br/>






                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p><strong>💡 What to Expect Next?</strong><br/>
✔ Our team will review your request.<br/>
✔ You will receive a call/email from us shortly.<br/>
✔  We’ll guide you through the process to get started.</p>


 
                                    </td>
                               
                                 <tr>
                                    <td>
                                        <p><strong>📩 Need Assistance?</strong>
If you have any questions in the meantime, feel free to reply to this email. We’re here to help!
<br/>



 
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${url}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Visit Service 
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

async function hardCopyBuy(email) {

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "Finkaro – Romancing with Equity is on Its Way!",
            html: `  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finkaro – Romancing with Equity is on Its Way!</title>
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

             
                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Dear Finkaro Member,</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
                   Thank you for purchasing <b>"Romancing with Equity"</b> – your guide to <b>investing with confidence</b> and mastering the fundamentals of equity investing.


                            </p>

                            <h2 style="font-size: 16px; margin: 20px 0 10px;">📦 Order Details:</h2>
 <b>📖 Book Type: </b>Hard Copy<br/><br/>
 <b>🚚 Shipping Status: </b>  Your book will be dispatched shortly to the address you provided.<br/><br/>
 <b>📅 Estimated Delivery:</b>3 - 5 Days<br/><br/>



<p><i>"Invest with Confidence – A Structured Approach to Learning Fundamentals."</i></p>
<p>We will send you a confirmation email once your book is shipped. If you have any questions or need to update your shipping details, please reply to this email.

</p>


                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p><strong>💡 Stay Connected:</strong><br/>
✔ Keep an eye on your inbox for shipping updates.<br/>
✔ Let us know your thoughts once you receive the book!<br/>
✔ Follow us for more financial insights and updates.<br/>


 
                                    </td>
                               
                                 <tr>
                                    <td>
                                        <p><strong>📩 Need Assistance?</strong>
Reply to this email, and we’ll be happy to help.

Happy Investing! 🚀
<br/>
                                    </td>
                                </tr>
                            </table>

                  
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

async function softCopyBuy(email, link) {

    try {
     

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Individual recipient
            subject: "Finkaro – Romancing with Equity Inside!",
            html: `  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finkaro – Romancing with Equity is on Its Way!</title>
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

                    <!-- Content Section -->
                    <tr>
                        <td align="left" style="padding: 30px; color: #4b5563;">
                            <p style="font-size: 16px; margin: 15px 0 20px;"><b>Dear Finkaro Member,</b></p>
                            <p style="font-size: 15px; line-height: 1.5;">
Thank you for purchasing <b>"Romancing with Equity"</b> – your guide to <b>investing with confidence</b> and mastering the <b>fundamentals of equity investing.</b>
                            </p>
                            <p>📥<b> Your Soft Copy is Attached!</b> (Check the attachment for your PDF copy.)</p>

        


<p><i>"Invest with Confidence – A Structured Approach to Learning Fundamentals."</i></p>
<p>We hope this book helps you make <b>smarter investment</b> decisions and build a strong foundation in finance. If you have any questions or feedback, we’d love to hear from you!



</p>


                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p><strong>💡 Stay Connected:</strong><br/>
✔ Start reading and apply key insights to your investments.<br/>
✔ Share your thoughts with us – we appreciate your feedback!<br/>
✔ Follow us for more financial insights and updates.<br/>


 
                                    </td>
                               
                                 <tr>
                                    <td>
                                        <p><strong>📩  Need Support?</strong>
Reply to this email, and we’ll be happy to assist you.<br/>

Happy Investing! 🚀


<br/>



 
                                    </td>
                                </tr>
                            </table>

                   <div style="text-align: center; margin-top: 30px;">
                                <a href="https://www.finkaro.com/" style="background-color: #111827; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
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

          };
        if (link) {
            mailOptions.attachments = [
                {
                    path: link, // File path for the attachment
                },
            ];
        }

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};




module.exports = { dashboardBuy, courseBuy, serviceBuy, hardCopyBuy, softCopyBuy };

