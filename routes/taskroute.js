const express = require('express');
const cors = require('cors');
const { task_list, create_task, task_detail, task_update_get, task_update_post, update_status, task_delete } = require('../controller/taskController');
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
 *      Task:
 *          type: object
 *          require:
 *              - user
 *              - title
 *              - note
 *              - dateTime
 *              - duration
 *              - category
 *              - priority
 *              - reminder
 *              - status
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto-generated id for the task
 *              user:
 *                  type: string
 *                  description: The user id
 *              title:
 *                  type: string
 *                  description: The task title
 *              note:
 *                  type: string
 *                  description: The task note 
 *              dateTime:
 *                  type: Date
 *                  description: The task intial time to begin
 *              duration:
 *                  type: string
 *                  description: The task duration/time to finish
 *              category:
 *                  type: string
 *                  description: The task's category
 *              priority:
 *                  type: number
 *                  description: The task's priority
 *              reminder:
 *                  type: string
 *                  description: reminder for the task 
 *              status:
 *                  type: string
 *                  description: The task's status
 */

/**
 * @swagger
 * tags:
 *      name: Task
 *      description: the task managing API
 */


/**
 * @swagger
 * /api/todolist/task/getAll:
 *  get:
 *      summary: Returns the list of all the tasks and subTasks
 *      description: Returns the list of all the tasks and subTasks
 *      security:
 *          -   BearerAuth: []
 *      tags: [Task]
 *      responses:
 *          200:
 *              description: The list of all the tasks and subtasks
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              tasks:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          _id:
 *                                              type: string
 *                                          user:
 *                                              type: string
 *                                          title:
 *                                              type: string
 *                                          note:
 *                                              type: string
 *                                          dateTime:
 *                                              type: string
 *                                          duration:
 *                                              type: string
 *                                          category:
 *                                              type: string
 *                                          priority:
 *                                              type: integer
 *                                          reminder:
 *                                              type: string
 *                                          status:
 *                                              type: string
 *                                          subTask:
 *                                              type: array
 *                                              items:
 *                                                  $ref: '#/components/schemas/Subtask'
 *          401:
 *              description: Authentication failed
 *          400:
 *              description: Something went wrong
 */
router.get('/getAll', task_list);

/**
 * @swagger
 * /api/todolist/task/create:
 *   post:
 *     summary: Create a new task
 *     description: To create a task
 *     security:
 *          -   BearerAuth: []
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                  task:
 *                      type: object
 *                      properties:
 *                          title:
 *                              type: string
 *                          note:
 *                              type: string
 *                          dateTime:
 *                              type: string
 *                          duration:
 *                              type: string
 *                          category:
 *                              type: string
 *                          priority:
 *                              type: integer
 *                          reminder:
 *                              type: string
 *                  subTask:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              title:
 *                                  type: string
 *                              note:
 *                                  type: string
 *                              dateTime:
 *                                  type: string
 *                              duration:
 *                                  type: string
 *                              priority:
 *                                  type: integer
 *                              reminder:
 *                                  type: string
 *                              
 *     responses:
 *       201:
 *         description: The task was successfully created
 *         
 *       400:
 *         description: network error
 */
router.post('/create', create_task);

/**
 * @swagger
 * /api/todolist/task/getOne:
 *  get:
 *      summary: get the task detail
 *      description: Returns specific task detail
 *      security:
 *          -   BearerAuth: []
 *      tags: [Task]
 *      responses:
 *          200:
 *              description: Returns specific task detail
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              subtask:
 *                                  
 *                                  items:
 *                                      $ref: '#/components/schemas/Subtask'
 *                              task:                                  
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          _id:
 *                                              type: string
 *                                          user:
 *                                              type: string
 *                                          title:
 *                                              type: string
 *                                          note:
 *                                              type: string
 *                                          dateTime:
 *                                              type: string
 *                                          duration:
 *                                              type: string
 *                                          category:
 *                                              type: string
 *                                          priority:
 *                                              type: integer
 *                                          reminder:
 *                                              type: string
 *                                          status:
 *                                              type: string
 *                                     
 *                                
 *          401:
 *              description: Authentication failed
 *          400:
 *              description: Something went wrong
 */
router.get('/getOne', task_detail);

/**
 * @swagger
 * /api/todolist/task/update:
 *   get:
 *     summary: get the data to be updated
 *     description: To get the info of the task to be editted
 *     security:
 *          -   BearerAuth: []
 *     tags: [Task]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: task id 
 *     responses:
 *       200:
 *         description: successfully get data to be updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: network error
 */
router.get('/update', task_update_get);

/**
 * @swagger
 * /api/todolist/task/update:
 *   patch:
 *     summary: update the task
 *     description: To edit the task 
 *     security:
 *          -   BearerAuth: []
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: The task was successfully updated
 *         
 *           
 *       400:
 *         description: network error
 */
router.patch('/update', task_update_post);

/**
 * @swagger
 * /api/todolist/task/statusUpdate:
 *   patch:
 *     summary: update the task's status
 *     description: Updates the task's status
 *     security:
 *          -   BearerAuth: []
 *     tags: [Task]
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
 *         description: The task's status was successfully updated
 *         
 *           
 *       400:
 *         description: network error
 */
router.patch('/statusUpdate', update_status);

/**
 * @swagger
 * /api/todolist/task/delete:
 *   delete:
 *     summary: delete the task
 *     description: To delete the task
 *     security:
 *          -   BearerAuth: []
 *     tags: [Task]
 *     parameters:
 *        - in: body
 *          name: _id
 *          schema:
 *              type: string
 *          required: true
 *          description: task id 
 *     responses:
 *       200:
 *         description: task Deleted successfully
 *         
 *       400:
 *         description: network error
 */
router.delete('/delete', task_delete)

module.exports = router;