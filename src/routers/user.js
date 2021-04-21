const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, goodByeEmail } = require('../emails/account')
const router = express.Router()
const storage = multer.memoryStorage() // Required by Multer
const upload = multer({
    dest: 'avatars',
    limits: {
        fileSize: 1000000, //size in bytes, this is 1 MB
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload a .jpg, .jpeg, or a .png image'))
        }

        cb(undefined, true)
    },
    storage

})

// Our signup
router.post('/users', async (req,res)=>{
    try{
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch (e){
        res.status(400).send(e)
    }
})


// This will require authentication
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

// Log out only logged in users
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


// Upload avatars for our users
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req,res)=>{

    // Uniform size to depend on and format, which will be PNG
    // Resize an image and convert it to PNG
    const buffer = await sharp(req.file.buffer).resize().png({ 
        width: 250, height: 250
    }).toBuffer() 

    req.user.avatar = buffer
    await req.user.save()

    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
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


// Retireve the user's avatar
router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error({ error: 'User not found or did not have an avatar'})
        }


        // We need to set a response header for this image
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e){
        res.status(400).send(e)
    }

})

// This will leverage middle ware defined in the Router
router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body) // Returns an array of strings which are keys
    const allowedUpdates = ['name', 'email', 'password', 'age']

    // The various attributes we are updating
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update) )
    
    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates!'})
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

// Delete a user's avatar
router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()

    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({ error: error.message })
})

// Delete the user
router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.user.remove()
        goodByeEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch (e){
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router