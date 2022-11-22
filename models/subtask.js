const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const SubtaskSchema = new Schema({
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    title: { type: String, required: true },
    note: { type: String },
    dateTime: { type: Date, required: true },
    duration: { type: String,required: true, enum: ['15 mins','30 mins', '1 hr', '2 hrs', '6 hrs','12 hrs', '18 hrs'], default: '30 mins' },
    priority: { type: Number, required: true, enum: [5, 4, 3, 2, 1], default: 1 },
    reminder: { type: String, required: true, enum: ['15 mins', '30 mins', '1 hr', '2 hrs'], default: '30 mins' },
    status: { type: String, required: true, enum: ['Upcoming', 'In progress', 'Canceled', 'Done', 'Overdue'], default: 'Upcoming' },
    reminderStatus: {type: Boolean, default: false}
}, { timestamps: true })

module.exports = mongoose.model('Subtask', SubtaskSchema);