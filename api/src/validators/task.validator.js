/*
  task.validator.js
  Joi schemas for task CRUD validation.
  The validation middleware runs these before the request hits any controller.
*/

const Joi = require('joi');
const { TASK_STATUS } = require('../utils/constants');

// Schema for creating a new task
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  desc: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  solvers: Joi.array().items(Joi.string().uuid()).length(1).required().messages({
    'array.length': 'Task must be assigned to exactly one solver',
    'string.guid': 'Solver ID must be a valid UUID',
    'any.required': 'Solvers array is required',
  }),
  dueDate: Joi.date().iso().optional().min('now').messages({
    'date.base': 'Due date must be a valid date',
    'date.iso': 'Due date must be in ISO 8601 format',
    'date.min': 'Due date cannot be in the past',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional().default('MEDIUM'),
});

// Schema for updating an existing task (at least one field required)
const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  desc: Joi.string().max(500).optional().allow('', null),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUS))
    .optional()
    .messages({ 'any.only': `Status must be one of: ${Object.values(TASK_STATUS).join(', ')}` }),
  solverId: Joi.string().uuid().optional(),
  dueDate: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'Due date must be a valid date',
    'date.iso': 'Due date must be in ISO 8601 format',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Validates the :id route parameter
const taskIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Task ID must be a valid UUID',
    'any.required': 'Task ID is required',
  }),
});

// Optional reason when rejecting a task
const rejectTaskSchema = Joi.object({
  reason: Joi.string().max(300).optional().messages({
    'string.max': 'Rejection reason cannot exceed 300 characters',
  }),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  rejectTaskSchema,
};
