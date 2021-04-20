// Basic CRUD Task App
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('./db/mongoose') //This will ensure mongoose connects to the DB
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()
const port = process.env.PORT


// Maintenance middle ware
//app.use((req,res,next)=>{
//    // 503 means site unavailable
//    res.status(503).send('Site is under maintenance!')
//})

const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 10000000, // Max file size
    },
    fileFilter(req, file, cb){   // ES6 method definitions
        if (!file.originalname.match(/\.(doc|docx|txt|md)$/)){
            return cb(new Error('Please upload a Word document, text file or markdown'))
        }

        cb(undefined, true)
    }
})


// Express error handling
app.post('/upload', upload.single('upload'), (req,res)=>{
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({ error: error.message})
})

app.use(express.json()) // Express will now auto parse the body as JSON

app.use(userRouter)
app.use(taskRouter)


//
// Without middleware: new request -> run route hanlder
//
// with middleware: new request -> do something -> run route handler


app.listen(port, ()=>{
    console.log('Server is listening on ' + port)
})

