const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router()

// Our signup
router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    const token = await user.generateAuthToken()

    try{
        await user.save()
        res.status(201).send({user, token})
    } catch (e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


router.post('/users/logout', auth, async (req,res)=>{
    try{

        // We have to now delete the token prior to logging out
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })

        // Save the modified user
        await req.user.save()
        res.send()

    } catch (e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try{

        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

// Returns just the user profile who is logged in
router.get('/users/me', auth, async (req,res)=>{
    try{
       res.send(req.user) 
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})


router.get('/users/:id', async (req,res)=>{
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }

        res.send(user)

    } catch (e){
       res.status(500).send(e)
    }
    
})


// This will leverage middle ware defined in the Router
router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body) // Returns an array of strings which are keys
    const allowedUpdates = ['name', 'email', 'password', 'age']

    // The various attributes we are updating
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update) )
    
    if(!isValidOperation){
        return res.status(404).send({ error: 'Invalid updates!'})
    }

    try{
        // const  user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const user = req.user


        // Dynamic access
        // The benefit is update w/e properties the lhs has with rhs
        // This does not require one to know ahead of time what those properties
        // actually are
        updates.forEach((update)=> user[update] = req.body[update])
        await user.save()

        if(!user){
            return res.status(404).send()
        }


        res.send(user)
    } catch (e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch (e){
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router