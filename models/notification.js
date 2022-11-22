const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users", 
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum:["Upcoming","Overdue"], 
        default: "Upcoming"
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema); 