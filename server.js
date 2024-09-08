const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db');

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_LINK, // First Angular app's URL
  process.env.FRONTEND_LINK_LOCAL  // Second Angular app's URL (local dev)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  }
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

// Define routes
app.use('/user', userRouter);
app.use('/subscribe', subscribeRouter);
app.use('/blog', blogRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Server connected');
});

// Start server on specified port (from .env or default 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
