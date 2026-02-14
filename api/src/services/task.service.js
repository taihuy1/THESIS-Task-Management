/*
  task.service.js
  Core business logic for the task lifecycle.
  Workflow: PENDING -> STARTED -> COMPLETED -> APPROVED (or back to STARTED on reject).
  Every state change pushes an SSE event so both dashboards update in real time.
*/

const taskRepository = require('../repositories/task.repository');
const notificationRepository = require('../repositories/notification.repository');
const userRepository = require('../repositories/user.repository');
const { NotFoundError, BadRequestError, AuthorizationError } = require('../utils/errors');
const { isValidTransition, TASK_STATUS, NOTIFICATION_TYPES, ROLES } = require('../utils/constants');
const logger = require('../utils/logger');
const { sendEvent } = require('../lib/sseClients');

// Fetch tasks visible to a given user (authors see created, solvers see assigned).
const getTasksByRole = async (userId, role) => {
  return taskRepository.findByRole(userId, role);
};

// Fetch a single task by its ID.
const getTaskById = async (taskId) => {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new NotFoundError('Task');
  return task;
};

// Create a new task assigned to exactly one solver.
const createTask = async (taskData, authorId) => {
  const { title, desc, solvers, dueDate, priority } = taskData;
  const [solverId] = solvers;

  const solver = await userRepository.findById(solverId);
  if (!solver || solver.role !== ROLES.SOLVER) {
    throw new BadRequestError('Invalid solver ID');
  }

  const task = await taskRepository.create({
    title,
    description: desc,
    authorId,
    solverId,
    status: TASK_STATUS.PENDING,
    priority: priority || 'MEDIUM',
    ...(dueDate && { dueDate: new Date(dueDate) }),
  });

  await notificationRepository.create({
    userId: solverId,
    taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    message: `You have been assigned a new task: ${title}`,
  });

  logger.info(`Task created: "${title}"`, { taskId: task.id, authorId, solverId, dueDate });

  sendEvent(solverId, 'task-update', { taskId: task.id, action: 'created' });
  sendEvent(solverId, 'notification', { taskId: task.id });

  return task;
};

// Generic update — validates status transitions and persists changes.
const updateTask = async (taskId, updateData, userId) => {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new NotFoundError('Task');

  if (updateData.status && updateData.status !== task.status) {
    if (!isValidTransition(task.status, updateData.status)) {
      throw new BadRequestError(`Invalid status transition from "${task.status}" to "${updateData.status}"`);
    }
  }

  // The frontend sends "desc" but Prisma expects "description"
  if (updateData.desc !== undefined) {
    updateData.description = updateData.desc;
    delete updateData.desc;
  }

  // Convert ISO string to Date object for Prisma
  if (updateData.dueDate) {
    updateData.dueDate = new Date(updateData.dueDate);
  }

  const updatedTask = await taskRepository.update(taskId, updateData);
  logger.info(`Task updated: ${taskId}`, { updatedFields: Object.keys(updateData), userId });
  return updatedTask;
};

// Solver begins work on a task (PENDING -> STARTED).
const startTask = async (taskId, solverId) => {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new NotFoundError('Task');
  if (task.solverId !== solverId) throw new AuthorizationError('You are not assigned to this task');
  if (task.status !== TASK_STATUS.PENDING) throw new BadRequestError(`Cannot start task with status "${task.status}"`);

  const updatedTask = await taskRepository.update(taskId, { status: TASK_STATUS.STARTED });
  logger.info(`Task started: ${taskId}`, { solverId });
  sendEvent(task.authorId, 'task-update', { taskId, action: 'started' });
  return updatedTask;
};

// Solver marks work as done (STARTED -> COMPLETED).
const completeTask = async (taskId, solverId) => {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new NotFoundError('Task');
  if (task.solverId !== solverId) throw new AuthorizationError('You are not assigned to this task');
  if (task.status !== TASK_STATUS.STARTED) throw new BadRequestError(`Cannot complete task with status "${task.status}"`);

  const updatedTask = await taskRepository.update(taskId, { status: TASK_STATUS.COMPLETED });

  await notificationRepository.create({
    userId: task.authorId,
    taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_COMPLETED,
    message: `Task "${task.title}" has been completed and awaits your approval`,
  });

  logger.info(`Task completed: ${taskId}`, { solverId });
  sendEvent(task.authorId, 'task-update', { taskId, action: 'completed' });
  sendEvent(task.authorId, 'notification', { taskId });
  return updatedTask;
};

// Author approves finished work (COMPLETED -> APPROVED).
const approveTask = async (taskId, authorId) => {
  const task = await taskRepository.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('Task not found or access denied');
  if (task.status !== TASK_STATUS.COMPLETED) throw new BadRequestError(`Cannot approve task with status "${task.status}"`);

  const updatedTask = await taskRepository.update(taskId, { status: TASK_STATUS.APPROVED });

  await notificationRepository.create({
    userId: task.solverId,
    taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_APPROVED,
    message: `Your task "${task.title}" has been approved!`,
  });

  logger.info(`Task approved: ${taskId}`, { authorId });
  sendEvent(task.solverId, 'task-update', { taskId, action: 'approved' });
  sendEvent(task.solverId, 'notification', { taskId });
  return updatedTask;
};

// Author sends work back for revision (COMPLETED -> STARTED).
const rejectTask = async (taskId, authorId, reason = null) => {
  const task = await taskRepository.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('Task not found or access denied');
  if (task.status !== TASK_STATUS.COMPLETED) throw new BadRequestError(`Cannot reject task with status "${task.status}"`);

  const updatedTask = await taskRepository.update(taskId, { status: TASK_STATUS.STARTED });

  const message = reason
    ? `Your task "${task.title}" was rejected. Reason: ${reason}. Please revise and resubmit.`
    : `Your task "${task.title}" was rejected. Please revise and resubmit.`;

  await notificationRepository.create({
    userId: task.solverId,
    taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_REJECTED,
    message,
  });

  logger.info(`Task rejected: ${taskId}`, { authorId, reason });
  sendEvent(task.solverId, 'task-update', { taskId, action: 'rejected' });
  sendEvent(task.solverId, 'notification', { taskId });
  return updatedTask;
};

// Author permanently removes a task and its related notifications.
const deleteTask = async (taskId, authorId) => {
  const task = await taskRepository.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('Task not found or access denied');

  await notificationRepository.deleteByTaskId(taskId);
  await taskRepository.deleteById(taskId);

  logger.info(`Task deleted: ${taskId}`, { authorId });

  if (task.solverId) {
    sendEvent(task.solverId, 'task-update', { taskId, action: 'deleted' });
  }
};

module.exports = {
  getTasksByRole,
  getTaskById,
  createTask,
  updateTask,
  startTask,
  completeTask,
  approveTask,
  rejectTask,
  deleteTask,
};
