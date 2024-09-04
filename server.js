const express = require('express')
const app = express();
const cors = require('cors')

const db = require('./db')
const bodyParser = require('body-parser')
require('dotenv').config();
const PORT = process.env.PORT || 4000
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_LINK, // First Angular app's URL
      process.env.FRONTEND_LINK_LOCAL  // Second Angular app's URL
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }  }));
app.use(bodyParser.json());
const userRouter = require('./routers/userRouter')
const subscribeRouter = require('./routers/subscribeRouter')
const blogRouter = require('./routers/blogRouter')
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });

const logRequest = ((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] request made to :`, req.originalUrl);
    next()
})

app.use(logRequest)

app.get('/', (req, res) => {
    res.send('Server connected')
})
 app.use('/user', userRouter)
 app.use('/subscribe', subscribeRouter)
 app.use('/blog', blogRouter)




app.listen(PORT , () => {
    console.log('server runing ', PORT);
})