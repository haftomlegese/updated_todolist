const Task = require('../models/task');
const Subtask = require('../models/subtask');
const dayjs = require('dayjs');
const webpush = require('web-push');
const cron = require('node-cron');

let vapidKeys = {
        publicKey: 'BAT7TFHK1rY8OTJPvWy2-XExYDszCiFWLfjD3yvWi4aSw-jH_gQ7mM6OFuHb8du9sPFkL0W0yN8RMnrXIs2krA0',
        privateKey: 'EDy3M5Ge08Tr65lHFUCj6RcMb_teSjQTrFj7d849i_M'
};

webpush.setVapidDetails('mailto:haftom.legese1@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey)



module.exports.sendReminder = async (req, res) => {
        console.log('here is reminder')
        const userId = req.user.userId;
        //get push subscription object from the request
        const subscription = req.body;

        // //send status 201 for the request
        // res.status(201).json({message: " subscribtion bigin"})

        cron.schedule('*/1 * * * *', async () => {
                console.log(userId)
                let subtasks = [];
                let tasks = []
                await Task.find({ user: userId })
                        .then(async (results) => {
                                // console.log(results)
                                for (let result in results) {
                                        tasks.push(results[result]);
                                        await Subtask.find({ task: results[result]._id })
                                                .then((values) => {
                                                        for (let value in values) {
                                                                subtasks.push(values[value]);
                                                        }
                                                }).catch((err) => {
                                                        console.log(err.message)
                                                })
                                }
                        })
                        .catch((err) => console.log(err.message))
                // console.log(tasks)
                tasks.forEach(task => {
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
                                                //create paylod: specified the detals of the push notification
                                                const taskPayload = JSON.stringify({ title: 'Task Reminder', body: `${task.title} remaining time is almost ${task.reminder} and it should be proceed at ${task.dateTime}` });

                                                //pass the object into sendNotification fucntion and catch any error
                                                webpush.sendNotification(subscription, taskPayload).catch(err => console.error(err));
                                                task.updateOne({reminderStatus: true})
                                                        .catch((err) => console.log(err.message))
                                        }
                                }
                        }
                })

                // console.log(subtasks);
                subtasks.forEach(subtask => {
                        if (subtask.status == 'Upcoming') {
                                let remindingTime;//datetime minus reminder
                                subtask.reminder.split(' ')[1] == 'mins' ?
                                        remindingTime = dayjs(subtask.dateTime).subtract(subtask.reminder.split(' ')[0], 'm').toDate() :
                                        subtask.reminder.split(' ')[1] == 'hr' ?
                                                remindingTime = dayjs(subtask.dateTime).subtract(subtask.reminder.split(' ')[0], 'h').toDate() :
                                                subtask.reminder.split(' ')[1] == 'hrs' ?
                                                        remindingTime = dayjs(subtask.dateTime).subtract(subtask.reminder.split(' ')[0], 'h').toDate() : 0;

                                if (dayjs(Date.now()).toDate() >= remindingTime) {
                                        if (!subtask.reminderStatus) {
                                                console.log('notify subtask');
                                                //create paylod: specified the detals of the push notification
                                                const subtaskPayload = JSON.stringify({ title: 'Subtask Reminder', body: `${subtask.title} remaining time is almost ${subtask.reminder} and it should be proceed at ${subtask.dateTime}` });

                                                //pass the object into sendNotification fucntion and catch any error
                                                webpush.sendNotification(subscription, subtaskPayload).catch(err => console.error(err));
                                                subtask.updateOne({reminderStatus: true})
                                                        .catch((err) => console.log(err.message))
                                        }
                                }
                        }
                })
        })
        

}

module.exports.statusChange = async () => {
        console.log('here is status change')
        // console.log(Date.now())
        let tasks = await Task.find()
                .catch((err) => {
                        console.log(err)
                })
        let subTasks = await Subtask.find()
                .catch((err2) => {
                        console.log(err2)
                })
        tasks.forEach(async task => {
                let deadline;//date time added duration
                task.duration.split(' ')[1] == 'mins' ?
                        deadline = dayjs(task.dateTime).add(task.duration.split(' ')[0], 'm').toDate() :
                        task.duration.split(' ')[1] == 'hr' ?
                                deadline = dayjs(task.dateTime).add(task.duration.split(' ')[0], 'h').toDate() :
                                task.duration.split(' ')[1] == 'hrs' ?
                                        deadline = dayjs(task.dateTime).add(task.duration.split(' ')[0], 'h').toDate() : 0

                if (task.status == 'Done' || task.status == 'Canceled') {
                        return;
                } else {

                        if (task.dateTime <= dayjs(Date.now()).toDate() && deadline > dayjs(Date.now()).toDate()) {
                                if (task.status != 'In progress') {
                                        await task.updateOne({ status: 'In progress' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        } else if (deadline <= dayjs(Date.now()).toDate()) {
                                if (task.status != 'Overdue') {
                                        await task.updateOne({ status: 'Overdue' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        } else if (task.dateTime > dayjs(Date.now()).toDate()) {
                                if (task.status != 'Upcoming') {
                                        await task.updateOne({ status: 'Upcoming' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        }
                }

        })
        subTasks.forEach(async subTask => {
                let deadline;
                subTask.duration.split(' ')[1] == 'mins' ?
                        deadline = dayjs(subTask.dateTime).add(subTask.duration.split(' ')[0], 'm').toDate() :
                        subTask.duration.split(' ')[1] == 'hr' ?
                                deadline = dayjs(subTask.dateTime).add(subTask.duration.split(' ')[0], 'h').toDate() :
                                subTask.duration.split(' ')[1] == 'hrs' ?
                                        deadline = dayjs(subTask.dateTime).add(subTask.duration.split(' ')[0], 'h').toDate() : 0

                if (subTask.status == 'Done' || subTask.status == 'Canceled') {
                        return;
                } else {
                        if (subTask.dateTime <= dayjs(Date.now()).toDate() && deadline > dayjs(Date.now()).toDate()) {
                                if (subTask.status != 'In progress') {
                                        await subTask.updateOne({ status: 'In progress' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        } else if (deadline <= dayjs(Date.now()).toDate()) {
                                if (subTask.status != 'Overdue') {
                                        await subTask.updateOne({ status: 'Overdue' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        } else if (subTask.dateTime > dayjs(Date.now()).toDate()) {
                                if (subTask.status != 'Upcoming') {
                                        await subTask.updateOne({ status: 'Upcoming' })
                                                .catch((err) => {
                                                        console.log(err);
                                                })
                                }
                        }
                }

        })
}



