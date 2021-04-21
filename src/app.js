// Basic CRUD Task App
const express = require('express')
require('./db/mongoose') //This will ensure mongoose connects to the DB
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()


// Maintenance middle ware
//app.use((req,res,next)=>{
//    // 503 means site unavailable
//    res.status(503).send('Site is under maintenance!')
//})
app.use(express.json()) // Express will now auto parse the body as JSON

app.use(userRouter)
app.use(taskRouter)

module.exports = app
