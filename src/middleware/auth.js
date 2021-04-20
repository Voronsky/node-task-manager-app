const jwt = require('jsonwebtoken')
const User = require('../models/user')

/**
 * 
 * @param {*} req  - header containing an Authorization key/value pair 
 * @param {*} res - not used
 * @param {*} next  - Will continue onto the next Route handler
 * 
 * @returns an instance of the User who successfully authenticated
 */
const auth = async (req,res,next) => {
    try {
        // We want to parse out the 'Authorization' in the header
        // This authorization contains a Bearer suffixed by the JWT token for the user

        // Do not forget the white space after bearer!
        const token = req.header('Authorization').replace('Bearer ', '')
        //console.log(token)
        // We will verify this JWT came from us using the private key
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Find the user with the correct ID with the auth token still stored
        const user = await User.findOne({ _id: decoded._id , 'tokens.token': token})
        if(!user){
            throw new Error()
        }

        // We modify the request because this will be passed onto the next route handler
        req.user = user
        req.token = token
        next()
    }catch(e){
        console.log(e)
        res.status(401).send({ error: 'Please authenticate'})
    }

}

module.exports = auth