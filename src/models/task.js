// Model instance
// Note, it takes the model name singular and creates a collection for them in plural
// e.g User will be a collection called 'users'.
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{useNewUrlParser: true, useUnifiedTopology: true})

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

})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task