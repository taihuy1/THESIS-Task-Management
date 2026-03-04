const Joi = require('joi');
const { TASK_STATUS } = require('../utils/constants');

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  desc: Joi.string().max(500).optional().allow('', null),
  solvers: Joi.array().items(Joi.string().uuid()).length(1).required()
    .messages({ 'array.length': 'pick exactly one solver' }),
  dueDate: Joi.date().iso().optional().min('now'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional().default('MEDIUM'),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  desc: Joi.string().max(500).optional().allow('', null),
  status: Joi.string().valid(...Object.values(TASK_STATUS)).optional(),
  solverId: Joi.string().uuid().optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
}).min(1);

// completeTaskSchema and rejectTaskSchema moved inline to controller —
// not worth a whole schema for checking one string field

module.exports = { createTaskSchema, updateTaskSchema };
