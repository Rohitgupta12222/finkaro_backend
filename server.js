const express = require('express')
const app = express();
const cors = require('cors')

const db = require('./db')
const bodyParser = require('body-parser')
require('dotenv').config();
const PORT = process.env.PORT || 4000
app.use(cors({
    origin: process.env.FRONTEND_LINK, // Replace with your Angular app's URL
  }));
app.use(bodyParser.json());
const userRouter = require('./routers/userRouter')
const subscribeRouter = require('./routers/subscribeRouter')
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



app.listen(3000 , () => {
    console.log('server runing ', PORT);
})