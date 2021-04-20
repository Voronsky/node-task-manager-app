// Model instance
// Note, it takes the model name singular and creates a collection for them in plural
// e.g User will be a collection called 'users'.
const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true, // if omitted, the property is optional and not required
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,  // Each Task corresponds to a user ID
        required: true,
        ref: 'User',                // This attachs the User and forms a relationship
                                    // Between both models. Now access is given to
                                    // the entire User model
    }
}, {
    timestamps: true,
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task