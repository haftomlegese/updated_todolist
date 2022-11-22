const Task = require('../models/task');
const Subtask = require('../models/subtask');
const Notify = require('../models/notification');
const async = require('async');
const { body, validationResult } = require('express-validator');


module.exports.task_list = async (req, res) => {
    //console.log(req.user.userId)
    console.log('getall ')
    console.log(' ')
    await Task.find({ user: req.user.userId }).sort({dateTime:-1})
        .then(async (results) => {
            let tasks = [];
            // let subtasks = [];
            //check if there is subTask and adding them to their tasks as subTask
            for (let result in results) {
                let task = {};
                //console.log(results[result])
                await Subtask.find({ task: results[result]._id }).sort({dateTime:-1}).then((values) => {
                    //task=results[result]
                    //results[result].subTasks.push(values)
                    //results[result].subTasks=values
                    //results[result].push({"subTasks":values})

                    task._id = results[result]._id
                    task.user = results[result].user
                    task.title = results[result].title
                    task.note = results[result].note
                    task.dateTime = results[result].dateTime
                    task.duration = results[result].duration
                    task.category = results[result].category
                    task.priority = results[result].priority
                    task.reminder = results[result].reminder
                    task.status = results[result].status
                    task.subTask = values

                    // subtasks.push(values)
                }).catch((errors) => {
                    return res.status(400).json({ message: errors })
                })
                tasks.push(task)

            }
            res.status(200).json({ tasks })
        })
        .catch((err) => {
            res.status(400).json({ message: err })
        })

}

module.exports.task_detail = (req, res, next) => {
    async.parallel(
        {
            task(callback) {
                Task.findById(req.body._id).exec(callback);
            },
            tasks_subtasks(callback) {
                Subtask.find({ task: req.body._id }).exec(callback);
            }
        },
        (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message })
            }

            res.status(200).json({ task: result.task, subtask: result.tasks_subtasks })
        }
    )
}

module.exports.create_task = [
    // body("title", "Title must not be empty.")
    //     .trim()
    //     .isLength({ min: 1 })
    //     .escape(),
    // body("note").escape(),
    // body("dateTime", "Invalid date")
    //     .optional({ checkFalsy: true })
    //     .isISO8601()
    //     .toDate(),
    // body("duration").escape(),
    // body("category").escape(),
    // body("priority").escape(),
    // body("reminder").escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        console.log('create')
        console.log(req.body)
        // const errors = validationResult(req);

        // if (!errors.isEmpty()) {
        //     return res.status(400).json({message : errors.array()});
        // }

        const bodyTask = req.body.task;
        const bodySubtask = req.body.subtask;

        const task = new Task({
            user: req.user.userId,
            title: bodyTask.title,
            note: bodyTask.note,
            dateTime: bodyTask.dateTime,
            duration: bodyTask.duration,
            category: bodyTask.category,
            priority: bodyTask.priority,
            reminder: bodyTask.reminder
        });

        task.save()
            .then((result) => {
                const taskId = result._id;
                if (bodySubtask.length == 0) {
                    return res.status(201).json({ message: "successfully added" });
                } else {
                    const allSubtask = []
                    bodySubtask.forEach(subtask => {
                        const container = {};
                        container.task = taskId;
                        container.title = subtask.title;
                        container.note = subtask.note;
                        container.dateTime = subtask.dateTime;
                        container.duration = subtask.duration;
                        container.priority = subtask.priority;
                        container.reminder = subtask.reminder;

                        allSubtask.push(container);
                    })
                    Subtask.insertMany(allSubtask, { ordered: true })
                        .then(() => {
                            return res.status(201).json({ message: "successfully added with" });
                        })
                        .catch((err) => {
                            Task.findByIdAndDelete(taskId)
                                .catch((error) => {
                                    return res.status(201).json({ message: error.message });
                                })
                            return res.status(201).json({ message: err.message });
                        })

                }
            })
            .catch((err) => {
                return res.status(400).json({ message: err.message })
            })

    }
];

module.exports.task_update_get = (req, res, next) => {
    Task.findById(req.body._id).exec((err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json(result);
    })
}

module.exports.task_update_post = [
    body("title", "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("note").escape(),
    body("dateTime", "Invalid date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    body("duration").escape(),
    body("category").escape(),
    body("priority").escape(),
    body("reminder").escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        console.log(req.body)
        Task.findByIdAndUpdate(req.body._id, {
            title: req.body.title, note: req.body.note, dateTime: req.body.dateTime,
            duration: req.body.duration, category: req.body.category, priority: req.body.priority, reminder: req.body.reminder,
            _id: req.body._id
        }, {}, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: "Task Updated successfully" })
        })
    }
];

module.exports.update_status = (req, res, next) => {
    const taskId = req.body._id;
    if (req.body.status == 'Canceled') {
        Subtask.find({ task: taskId }).then((results) => {
            if (results.isEmpty) {
                return;
            }
            results.forEach(result => {
                if (result.status == 'Done' || result.status == 'Overdue') {
                    return;
                } else {
                    Subtask.updateOne({ task: result.task }, { status: 'Canceled' }).catch((err) => res.status(400).json(err.message))
                }
            })
        }).catch((err) => res.status.json({ message: err.message }));
    }
    // if(req.body.status == 'Overdue'){

    // }
    Task.findByIdAndUpdate(taskId, { status: req.body.status, _id: req.body._id }, {}, (err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (result.status == 'Overdue') {
            const notify = new Notify({ user: result._id, title: result.title, status: result.status })
            notify.save()
                .catch((err) => console.log({ err: err.message }))
        }
        res.status(200).json({ message: "status updated successfully" })
    })
}

module.exports.task_delete = (req, res, next) => {
    async.parallel(
        {
            task(callback) {
                Task.findById(req.body._id).exec(callback);
            },
            tasks_subtasks(callback) {
                Subtask.find({ task: req.body._id }).exec(callback);
            }
        },
        (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message })
            }
            // console.log(req.body._id)
            Subtask.deleteMany({ task: req.body._id }).then(() => {
                // console.log('delete task')
                Task.findByIdAndRemove(req.body._id).then(() => res.status(200).json({ message: "Task Deleted successfully" }))
            }).catch((err) => {
                res.status(400).json({ message: err.message })
            })

        }
    )
}


