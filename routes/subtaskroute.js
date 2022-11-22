const express = require('express')
const {create_subtask, subtask_update_get, subtask_update_post, update_status , subtask_delete} = require('../controller/subtaskController');

const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *      Subtask:
 *          type: object
 *          require:
 *              - task
 *              - title
 *              - note
 *              - dateTime
 *              - duration
 *              - priority
 *              - reminder
 *              - status
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto-generated id for the subtask
 *              task:
 *                  type: string
 *                  description: The task id
 *              title:
 *                  type: string
 *                  description: The subtask title
 *              note:
 *                  type: string
 *                  description: The subtask note 
 *              dateTime:
 *                  type: Date
 *                  description: The subtask intial time to begin
 *              duration:
 *                  type: string
 *                  description: The subtask duration/time to finish
 *              priority:
 *                  type: number
 *                  description: The subtask's priority
 *              reminder:
 *                  type: string
 *                  description: reminder for the subtask 
 *              status:
 *                  type: string
 *                  description: The subtask's status
 */


/**
 * @swagger
 * tags:
 *      name: Subtask
 *      description: the subtask managing API
 */


/**
 * @swagger
 * /api/todolist/subtask/create:
 *   post:
 *     summary: Create a new subtask
 *     description: To create a subtask
 *     tags: [Subtask]
 *     security:
 *          -   BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subtask'
 *     responses:
 *       201:
 *         description: The subtask was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtask'
 *       400:
 *         description: network error
 */
router.post('/create', create_subtask);

/**
 * @swagger
 * /api/todolist/subtask/update:
 *   get:
 *     summary: get the data to be updated
 *     description: To get info of the subtask to be editted
 *     tags: [Subtask]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: sub task id 
 *     responses:
 *       200:
 *         description: successfully get data to be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subtask'
 *       400:
 *         description: network error
 */
router.get('/update', subtask_update_get);


/**
 * @swagger
 * /api/todolist/subtask/update:
 *   patch:
 *     summary: update the subtask
 *     description: To edit the subtask
 *     tags: [Subtask]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subtask'
 *     responses:
 *       200:
 *         description: The subtask was successfully updated
 *         content:
 *           
 *       400:
 *         description: network error
 */
router.patch('/update', subtask_update_post);

/**
 * @swagger
 * /api/todolist/subtask/statusUpdate:
 *   patch:
 *     summary: update the subtask's status
 *     description: Update the subtask's status
 *     tags: [Subtask]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: task id 
 *        - in: body
 *          name: status
 *          schema:
 *              type: string
 *          required: true
 *          description: task status
 *    
 *     responses:
 *       200:
 *         description: The subtask's status was successfully updated
 *         
 *           
 *       400:
 *         description: network error
 */
 router.patch('/statusUpdate', update_status);

/**
 * @swagger
 * /api/todolist/subtask/delete:
 *   delete:
 *     summary: delete the subtask
 *     description: To delete the subtask
 *     tags: [Subtask]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: sub task id 
 *     responses:
 *       200:
 *         description: Subtask Deleted successfully
 *         
 *       400:
 *         description: network error
 */
router.delete('/delete', subtask_delete);

module.exports = router;