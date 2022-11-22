const nodemailer = require('nodemailer')
require('dotenv').config()

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // service: 'Gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

const send_password = async (email, otp) => {
    try {
        var subj, body;
        subj = "Password Reset"
        body = '<p>This is your password reset Otp :' + otp + '.' + '</p>'
    
        const mailOptions = {
            to: email,
            from: process.env.NODEMAILER_EMAIL,
            subject: subj,
            html: body
        }
        const response = await transport.sendMail(mailOptions)
        // console.log('Link sent 📬')
        return ({ ok: true, message: 'email sent' })
    }
    catch (err) {
        console.log("Something didn't work out 😭", err)
        return ({ ok: false, message: err })
    }
}

const send_deleteMessage = async (email,link) => {
    try {
        var subj, body;
        subj = "Account deletion"
        body = `<p>This is to inform you that your account is temporary deleted.<br>
                Click the link below to reactivate your account.<br>
                This link will expire in 30 minutes and then your account will be permanently deleted 
                <a href="${link}">Recover your account</a> </p>`
    
        const mailOptions = {
            to: email,
            from: process.env.NODEMAILER_EMAIL,
            subject: subj,
            html: body
        }
        const response = await transport.sendMail(mailOptions)
        // console.log('Link sent 📬')
        return ({ ok: true, message: 'email sent' })
    }
    catch (err) {
        console.log("Something didn't work out 😭", err)
        return ({ ok: false, message: err })
    }
}
module.exports = {send_password, send_deleteMessage};