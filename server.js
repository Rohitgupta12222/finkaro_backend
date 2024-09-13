const express = require('express');
const app = express();
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Start server on specified port (from .env or default 3000)
const PORT = process.env.PORT || 3000;
const db = require('./db');

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


console.log('Allowed Origins:', process.env.FRONTEND_LINK, process.env.FRONTEND_LINK_LOCAL);

app.use(cors({
  origin: '*', // Allow all origins (for testing purposes)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] Request made to: ${req.originalUrl}`);
  next();
});

// Security headers for Cross-Origin-Opener-Policy
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Routers
const userRouter = require('./routers/userRouter');
const subscribeRouter = require('./routers/subscribeRouter');
const blogRouter = require('./routers/blogRouter');
const youtubeRouter = require('./routers/youtubelinkRouter');
const courseRouter = require('./routers/courseRouter');
// const razorpayRouter = require('./routers/razorpayRouter');
const dashboardRouter = require('./routers/dashboardRouter')


// Define routes
app.use('/user', userRouter);
app.use('/subscribe', subscribeRouter);
app.use('/blog', blogRouter);
app.use('/youtubelink', youtubeRouter);
app.use('/course', courseRouter);
// app.use('/payment', razorpayRouter);
app.use('/dashboard', dashboardRouter);




// Root route
app.get('', (req, res) => {
  res.send('Server connected');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
