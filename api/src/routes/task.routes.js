const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const { dbCheck } = require('../middleware/db.middleware');
const { validate, validateParams } = require('../middleware/validation.middleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');
const { idSchema } = require('../validators/common.validator');
const { ROLES } = require('../utils/constants');

router.use(authenticate, dbCheck);

router.get('/', taskController.getTasks);
router.get('/:id', validateParams(idSchema), taskController.getTaskById);

router.post('/', authorizeRole(ROLES.AUTHOR), validate(createTaskSchema), taskController.createTask);
router.put('/:id', validateParams(idSchema), validate(updateTaskSchema), taskController.updateTask);

router.patch('/:id/start', authorizeRole(ROLES.SOLVER), validateParams(idSchema), taskController.startTask);
router.patch('/:id/complete', authorizeRole(ROLES.SOLVER), validateParams(idSchema), taskController.completeTask);
router.patch('/:id/approve', authorizeRole(ROLES.AUTHOR), validateParams(idSchema), taskController.approveTask);
router.patch('/:id/reject', authorizeRole(ROLES.AUTHOR), validateParams(idSchema), taskController.rejectTask);
router.delete('/:id', authorizeRole(ROLES.AUTHOR), validateParams(idSchema), taskController.deleteTask);

module.exports = router;
