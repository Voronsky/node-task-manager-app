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
const port = process.env.PORT || 3000

// We introduce the next 
// This acts the in between, the request and the rest of the routers
//app.use((req,res,next)=>{
//    if(req.method === 'GET'){
//        res.send('GET requests are disabled')
//    } else{
//        // This will allow it to now 'do something', aka run the handlers now
//        next()
//    }
//
//})


// Maintenance middle war
//app.use((req,res,next)=>{
//    // 503 means site unavailable
//    res.status(503).send('Site is under maintenance!')
//})

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

jwt 

const myFunction = async ()=>{

    // Creates a JWT with a secret key
    const token = jwt.sign({ _id: 'abc123'}, 'thisismynewcourse', { expiresIn: '7 days'})
    console.log(token)

    const data = jwt.verify(token, 'thisismynewcourse')
    console.log(data)
}

myFunction()