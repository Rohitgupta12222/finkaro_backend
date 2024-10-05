const express = require('express');
const app = express();
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const db = require('./db');

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


console.log('Allowed Origins:',);

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
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
const razorpayRouter = require('./routers/razorpayRouter');
const dashboardRouter = require('./routers/dashboardRouter')
const subscriptionRouter = require('./routers/transactionsRouter')
const servicesRouter = require('./routers/servicesRouter')
const bookRouter = require('./routers/bookRouter')
const cardRouter = require('./routers/cardRouter')




// Define routes
app.use('/user', userRouter);
app.use('/subscribe', subscribeRouter);
app.use('/blog', blogRouter);
app.use('/youtubelink', youtubeRouter);
app.use('/course', courseRouter);
app.use('/services', servicesRouter);
app.use('/payment', razorpayRouter);
app.use('/dashboard', dashboardRouter);
app.use('/subscription', subscriptionRouter);
app.use('/book', bookRouter);
app.use('/cards', cardRouter);








// Root route
app.get('/', (req, res) => {
  res.send('Server connected');
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(err.status).end(); // End the response in case of error
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});