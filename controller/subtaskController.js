const Task = require('../models/task');
const Subtask = require('../models/subtask');
const Notify = require('../models/notification')
const async = require('async');
const { body, validationResult } = require('express-validator');


module.exports.create_subtask = [
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
    body("priority").escape(),
    body("reminder").escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message : errors.array()});
        }

        const subtask = new Subtask({
            task: req.body._id,// task Id
            title: req.body.title,
            note: req.body.note,
            dateTime: req.body.dateTime,
            duration: req.body.duration,
            priority: req.body.priority,
            reminder: req.body.reminder
        });

        subtask.save()
            .then(() => {
                res.status(201).json({ message: "Subtask added successfully" })
            })
            .catch((err) => {
                res.status(400).json({message : err.message})
            })

    }
];

module.exports.subtask_update_get = (req, res, next) => {
    //_id is subtask id
    Subtask.findById(req.body._id).exec((err, result) => {
        if (err) {
            return res.status(400).json({ message : err.message});
        }
        res.status(200).json(result);
    })
}

module.exports.subtask_update_post = [
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
    body("priority").escape(),
    body("reminder").escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({message : errors.array()});
        }

        const subtask = new Subtask({
            title: req.body.title,
            note: req.body.note,
            dateTime: req.body.dateTime,
            duration: req.body.duration,
            priority: req.body.priority,
            reminder: req.body.reminder,
            _id: req.body._id
        });

        Subtask.findByIdAndUpdate(req.body._id, subtask, (err, result) => {
            if (err) {
                return res.status(400).json({ message : err.message})
            }
            res.status(201).json({ message: "Subtask Updated successfully" })
        })
    }
];

module.exports.update_status = [
    body("status").escape(),
    (req, res, next) => {
        const userId = req.user.userId;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ message : errors.array()});
        }

        Subtask.findByIdAndUpdate(req.body._id, { status: req.body.status, _id: req.body._id }, {}, (err,result) => {
            if (err) {
                return res.status(400).json({ message : err.message});
            }
            if (result.status == 'Overdue') {
                const notify = new Notify({ user: userId, title: result.title, status: result.status })
                notify.save()
                    .catch((err) => console.log({ err: err.message }))
            }
            res.status(200).json({ message: "status updated successfully" })
        })
    }]

module.exports.subtask_delete = (req, res, next) => {
    
    console.log(req.body._id)
    Subtask.findByIdAndRemove(req.body._id).exec((err) => {
        console.log('delete subtask')
        if (err) {
            return res.status(400).json({ message : err.message});
        }
        res.status(200).json({ message: "Subtask Deleted successfully" })
    })
}