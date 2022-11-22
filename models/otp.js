const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const OtpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    expireIn: Number
}, { timestamps: true });

module.exports = mongoose.model('Otp', OtpSchema); 