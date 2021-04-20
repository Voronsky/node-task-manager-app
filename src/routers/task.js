const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/tasks', auth, async (req,res)=>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,                // ES6 operator
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(error)
    }
})

// Retrieve all the tasks corresponding to the authenticated user
// We will allow filters as well
// GET /tasks?completed=true , returns only those tasks which are done
// GET /tasks?limit=10?skip=10 , limit number of results we get back and lets iterate over pages
// If limit 10 and skip = 0, you only get first 10 results.
// If limit is 10 and skip 10, you get first 10 and then you get another page of another 10
// GET /tasks?sortBy=createdAt:desc

router.get('/tasks', auth, async (req,res)=>{
    // Get the user instance
    const user = req.user
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    // allowed sort for asc and desc
    if (req.query.sortBy) {
       const parts = req.query.sortBy.split(':')
       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 // ternary operator
    }

    try {

        // Populate this user instance with all the tasks associated with it's owner id
        // We need to add the sort option now when populating
        await user.populate({
           'path': 'tasks',
           match,
           options: {
               limit: parseInt(req.query.limit),
               skip: parseInt(req.query.skip),
               sort,
           }
        }).execPopulate()

        // Send back the array/list of tasks for that User
        res.send(user.tasks)
    } catch (e){
        res.status(500).send(e)
    }
   
})

// Now we will only retrieve tasks corresponding to owners
router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id

    try{
        // This will now find a task based on the id of the task and the owner of it
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
   
})


// Only tasks associated to the owner can be modified
router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(404).send({ error: 'Invalid updates!'})
    }

    try{
        // Get the task by the id and by whom owns it, it will need to match
        const task = await Task.findOne({_id: req.params.id, owner: req.user.id})
        

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e){
        res.status(400).send(e)
    }
})


// Delete tasks associated to the authenticated user only
router.delete('/tasks/:id', auth, async(req, res)=>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user.id})    

        if(!task){
           return res.status(404).send()
        }

        res.send(task)
    }catch (e){
        res.status(500).send(e)
    }
})

module.exports = router