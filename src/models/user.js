const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')


// Mongoose store 'schemas' 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        default: 0, // default 0 , if not validate it
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        minLength: 7,
        trim: true,
        validate(value){
            if(validator.contains(value, 'password')){
                throw new Error('password cannot contain the string password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer // A binary buffer of the image data
    }

}, {
    timestamps: true,
})


// Instance method
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    // The property in a User model
    // concat the token to the list of tokens a user may already have
    // Then update that model instance with the new token appended
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}


// virtual properties, they are not actual properties in a model
// Therefore they are not stored in the DB when a user is created
// This tells Mongoose what a User is related to
// This looks awfully similar to Foreign Keys in SQL
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', // Where local data is stored to be associated with
    foreignField: 'owner', // Where it is being referenced in Task
})

// We are building an toJSON property which is default looked for
// Whenever express does JSON.stringify(), it will call a toJSON() on the object
// By building this as a method , it will automatically call this 'override'
// This will automatically filter out some private data about the user
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Custom defined static functions, accessible on the model
// This returns an instance of the model
userSchema.statics.findByCredentials = async (email, password) => {

    // Shorthand syntax
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to login')
    }

    // Compare their password with the hashed one
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user

}

// Hash the plain text password  before a user is saved
// the 2nd argument is a function , due to the this context it needs
userSchema.pre('save', async function(next){

    // We are referring to the schema being created upon the router
    // which calls this
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


// Delete user tasks when user is removed
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({ owner: user._id }) // Queries documentation in mongoose
    
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User