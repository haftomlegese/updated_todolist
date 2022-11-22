const Task = require('../models/task');
const Subtask = require('../models/subtask');
const Notify = require('../models/notification');
const dayjs = require('dayjs')

module.exports.notify = async () => {
    let subtasks = [];
    let tasks = []
    await Task.find()
        .then(async (results) => {
            // console.log(results)
            for (let result in results) {
                tasks.push(results[result]);
                await Subtask.find({ task: results[result]._id })
                    .then((values) => {
                        const container = {};
                        for (let value in values) {
                            container.user = results[result].user;
                            container.data = values[value];
                            subtasks.push(container);
                        }
                    }).catch((err) => {
                        console.log({ err: err.message })
                    })
            }
        })
        .catch((err) => console.log({ message: err.message }))
    // console.log(tasks)
    tasks.forEach(async task => {
        if (task.status == 'Upcoming') {
            let remindingTime;//datetime minus reminder
            task.reminder.split(' ')[1] == 'mins' ?
                remindingTime = dayjs(task.dateTime).subtract(task.reminder.split(' ')[0], 'm').toDate() :
                task.reminder.split(' ')[1] == 'hr' ?
                    remindingTime = dayjs(task.dateTime).subtract(task.reminder.split(' ')[0], 'h').toDate() :
                    task.reminder.split(' ')[1] == 'hrs' ?
                        remindingTime = dayjs(task.dateTime).subtract(task.reminder.split(' ')[0], 'h').toDate() : 0;
            // console.log(remindingTime)
            if (dayjs(Date.now()).toDate() >= remindingTime) {
                if (!task.reminderStatus) {
                    console.log('notify task');
                    const notify = new Notify({ user: task.user, title: task.title })
                    notify.save()
                        .catch((err) => console.log({ err: err.message }))
                    task.updateOne({ reminderStatus: true })
                        .catch((err) => console.log(err.message))
                }
            }
        }
    })

    // console.log(subtasks);
    subtasks.forEach(subtask => {
        if (subtask.data.status == 'Upcoming') {
            let remindingTime;//datetime minus reminder
            subtask.data.reminder.split(' ')[1] == 'mins' ?
                remindingTime = dayjs(subtask.data.dateTime).subtract(subtask.data.reminder.split(' ')[0], 'm').toDate() :
                subtask.data.reminder.split(' ')[1] == 'hr' ?
                    remindingTime = dayjs(subtask.data.dateTime).subtract(subtask.data.reminder.split(' ')[0], 'h').toDate() :
                    subtask.data.reminder.split(' ')[1] == 'hrs' ?
                        remindingTime = dayjs(subtask.data.dateTime).subtract(subtask.data.reminder.split(' ')[0], 'h').toDate() : 0;

            if (dayjs(Date.now()).toDate() >= remindingTime) {
                if (!subtask.data.reminderStatus) {
                    console.log('notify subtask');
                    const notify = new Notify({ user: subtask.user, title: subtask.data.title })
                    notify.save()
                        .catch((err) => console.log({ errs: err.message }))
                    subtask.data.updateOne({ reminderStatus: true })
                        .catch((err) => console.log(err.message))
                }
            }
        }
    })
}

module.exports.get_notification = (req, res, next) => {
    const userId = req.user.userId;
    Notify.find({ user: userId })
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        })
}

module.exports.delete_notification = (req, res, next) => {
    console.log(req.body._id);
    if (!req.body._id) {
        res.status(400).json({ message: "undifined id" });
    } else {
        Notify.findByIdAndRemove(req.body._id).exec((err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(200).json({ massage: "Notification deleted successfully" })
        })
    }

}