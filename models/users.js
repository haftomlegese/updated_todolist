const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    email: { type: String, required: true, unique:false},
    password: { type: String, required: true, minlength: 6 },
    fullname: { type: String },
    birthDate: { type: Date },
    gender: { type: String },
    phoneNumber: { type: String },
    userStatus: { type: Boolean, default: true },
    deletionReason: { type: String },
    imgName: { type: String },
    image: { data: Buffer, contentType: String }
})

UsersSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UsersSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, },
        "djhfgbvsk/2467kafn",
        { expiresIn: process.env.JWT_LIFETIME, }
    )
}

UsersSchema.methods.comparePassword = async function (newPassword) {
    const isMatch = await bcrypt.compare(newPassword, this.password)
    return isMatch;
}

module.exports = mongoose.model("Users", UsersSchema);