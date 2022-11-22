const express = require('express');
const { sendReminder } = require('../controller/scheduleController');
const { delete_notification, get_notification } = require('../controller/notificationController')
const router = express.Router();


/**
 * @swagger
 * components:
 *  schemas:
 *      Notificaion:
 *          type: object
 *          require:
 *              - user
 *              - title
 *              - status
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto-generated id for the notification
 *              user:
 *                  type: string
 *                  description: The user Id
 *              title:
 *                  type: string
 *                  description: The task's or subtask's title
 *              status:
 *                  type: string
 *                  description: The task's or subtask's status
 */


/**
 * @swagger
 * tags:
 *      name: Notification
 *      description: handle the notifications
 */

/**
 * @swagger
 * /api/todolist/subscribe:
 *   post:
 *     summary: send reminder
 *     description: Send reminder notification for the tasks and subtasks
 *     tags: [Notify]
 *     parameters:
 *        - in: body
 *          name: userId
 *          schema:
 *              type: string
 *          required: true
 *          description: userId from the token
 *     responses:
 *       200:
 *         description: Send reminder notification 
 *                     
 *           
 *       400:
 *         description: network error
 */
router.post('/subscribe', sendReminder);

/**
 * @swagger
 * /api/todolist/notification/get:
 *   get:
 *     summary: get notification
 *     description: To get notification about upcoming and overdue task and subtask
 *     tags: [Notification]
 *     security:
 *          -   BearerAuth: []
 *     responses:
 *       200:
 *         description: get notification successfully
 *         
 *       400:
 *         description: network error
 */

router.get('/get',get_notification);
/**
 * @swagger
 * /api/todolist/notification/delete:
 *   delete:
 *     summary: delete the notification
 *     description: To delete the seen spacific notification
 *     tags: [Notification]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: notification id 
 *     responses:
 *       200:
 *         description: notification Deleted successfully
 *         
 *       400:
 *         description: network error
 */
router.delete('/delete', delete_notification);

module.exports = router;