const User = require('../models/users');
const OTP = require('../models/otp');
const { send_password } = require('./emailController');
const jwt = require('jsonwebtoken');

module.exports.sendEmail = async (req, res, next) => {
    try {
        const { email } = req.body
        const otpCode = Math.floor((Math.random() * 10000) + 1)

        const user = await User.findOne({ email:email, userStatus: true })
        if (!user) {
            return res.status(400).json({ message: 'User not found!' })
        }

        const filter = { email: email };
        const update = { code: otpCode, expireIn: new Date().getTime() + 45 * 1000 };

        const otp = new OTP({
            email: email,
            code: otpCode,
            expireIn: new Date().getTime() + 1000 * 1000
        });

        var present = await OTP.findOne({ email })
        if (!present) {
            await otp.save()
        } else {
            await OTP.findOneAndUpdate(filter, update, {
                new: true
            });
        }

        await send_password(email, otpCode);

        return res.status(201).json({
            message:
                'Password reset email has been sent. Please check your email within the next hour.'
        })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

module.exports.confirm = async (req, res, next) => {
    try {
        const { email, code } = req.body
        console.log(req.body)
        const otp = await OTP.findOne({ email: email })
        if (!otp) {
            return res.status(400).json({ message: 'Invalid OTP!' })
        }
        console.log(otp.code, code)
        if (otp.code !== code) {
            return res.status(400).json({ message: 'Invalid ' })
        }
        let currentTime = new Date().getTime()
        let diff = otp.expireIn - currentTime
        if (diff < 0) {
            return res.status(400).json({ message: 'Expired OTP ' })
        }
        //
        await OTP.deleteOne({ email })
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User not found!' })
        }
        const resetToken = jwt.sign({ email }, process.env.RESET_PASSWORD, {
            expiresIn: '600s'
        })
        return res.status(200).json({ resetToken, message: 'OTP verified' })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports.newPassword = async (req, res, next) => {
    try {
        const { resetToken, password } = req.body
        console.log(resetToken, password, "Here")
        const decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD);
        const email = decoded.email || ''
        if (email == '') {
            return res.status(400).json({
                message: 'Invalid token given'
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User not found!' })
        }
        user.password = password;
        await user.save();

        return res.status(200).json({ massage: 'Password reset successfully' })
    } catch (error) {
        return res.status(401).json({ message: error.message })
    }
}
