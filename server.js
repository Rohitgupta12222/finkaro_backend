const express = require('express')
const app = express();
const cors = require('cors')
const db = require('./db')
const bodyParser = require('body-parser')
require('dotenv').config();
const PORT = process.env.PORT || 4000
app.use(cors());
app.use(bodyParser.json());
const userRouter = require('./routers/userRouter')


const logRequest = ((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] request made to :`, req.originalUrl);
    next()
})

app.use(logRequest)

app.get('/', (req, res) => {
    res.send('Server connected')
})
 app.use('/user', userRouter)
// app.use('/item', menuItem)







app.listen(PORT, () => {
    console.log('server runing ', PORT);
})