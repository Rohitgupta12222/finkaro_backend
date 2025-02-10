function blogTemplate(data) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Update</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(90deg, #007bff, #0056b3);
            color: white;
            padding: 25px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
        }
        .blog-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 12px;
            margin: 20px 0;
        }
        .content {
            padding: 25px;
            color: #333;
            line-height: 1.8;
            font-size: 16px;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            background: #007bff;
            color: white;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            border-radius: 6px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #0056b3;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666;
            background: #f4f4f4;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .header h1 {
                font-size: 22px;
            }
            .content {
                font-size: 14px;
            }
            .button {
                padding: 10px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 New Blog Post Alert!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${data?.name}</strong>,</p>
            <p>We just published a fresh blog post that you might find insightful. Dive in and let us know what you think!</p>
            <img src="[Blog Image URL]" alt="Blog Image" class="blog-image">
            <h3>"[Blog Post Title]"</h3>
            <p>[A captivating short description of the blog post...]</p>
            <a href="[Blog URL]" class="button">Read the Full Article</a>
        </div>
        <div class="footer">
            <p>You are receiving this email because you subscribed to our blog updates.</p>
            <p><a href="[Unsubscribe Link]">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;
    
}

export default blogTemplate;