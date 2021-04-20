const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email , name) => {

    sgMail.send({
        to: email,
        from: 'idiaz3@gmu.edu',
        subject: 'Welcome to my Task App!',
        text:`Welcome to the app, ${name}. Let me know how you get along with the app.

        Feel free to send feedback at https://github.com/Voronsky/node-task-manager-app
        `
    }).then(()=>{
        console.log('email sent')
    }).catch((error)=>{
        console.log(error)
    })

}

const goodByeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'idiaz3@gmu.edu',
        subject: 'Sorry to see you go!',
        text:`It seems you recently you deleted your account, ${name}. 
        I am sorry to hear the app has let you down.
        But thank you again for using it!

        If any particular reason made you quit, feel free to say why at
        https://github.com/Voronsky/node-task-manager-app
        `
    }).then(()=>{
        console.log('email sent')
    }).catch((error)=>{
        console.log(error)
    })

   
}

module.exports = {
    sendWelcomeEmail,
    goodByeEmail
}