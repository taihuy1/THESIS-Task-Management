const taskRepo = require('../repositories/task.repository');
const notifRepo = require('../repositories/notifRepo');
const userRepo = require('../repositories/user.repository');
const { NotFoundError, BadRequestError, AccessError } = require('../utils/errors');
const { isValidTransition, TASK_STATUS, NOTIFICATION_TYPES, ROLES } = require('../utils/constants');
const logger = require('../utils/logger');
const { sendEvent } = require('../lib/sseClients');

const getTasksByRole = (userId, role) => taskRepo.findByRole(userId, role);

async function getTaskById(id) {
  const task = await taskRepo.findById(id);
  if (!task) throw new NotFoundError('task');
  return task;
}

// validates solver exists & has correct role before creating
async function createTask(body, authorId) {
  const { title, desc, solvers, dueDate, priority } = body;
  const [sid] = solvers;

  logger.debug('createTask called', { title, authorId, sid });

  const solver = await userRepo.findById(sid);
  if (!solver || solver.role !== ROLES.SOLVER)
    throw new BadRequestError('invalid solver');

  logger.debug('solver validated, creating task record...');

  const task = await taskRepo.create({
    title, description: desc, authorId, solverId: sid,
    status: TASK_STATUS.PENDING,
    priority: priority || 'MEDIUM',
    ...(dueDate && { dueDate: new Date(dueDate) }),
  });

  await notifRepo.create({
    userId: sid, taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    message: `New task assigned: ${title}`,
  });
  logger.info('task:create', { id: task.id, authorId, sid });

  sendEvent(sid, 'task-update', { taskId: task.id, action: 'created' });
  sendEvent(sid, 'notification', { taskId: task.id });
  return task;
}

async function updateTask(taskId, patch, userId) {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new NotFoundError('task');

  if (patch.status && patch.status !== task.status &&
    !isValidTransition(task.status, patch.status)) {
    throw new BadRequestError(`bad transition ${task.status} -> ${patch.status}`);
  }

  if (patch.desc !== undefined) {
    patch.description = patch.desc;
    delete patch.desc;
  }
  if (patch.dueDate) patch.dueDate = new Date(patch.dueDate);

  const prevSolver = task.solverId;
  const updated = await taskRepo.update(taskId, patch);
  logger.info('task:update', { taskId, fields: Object.keys(patch) });

  if (updated.solverId) sendEvent(updated.solverId, 'task-update', { taskId, action: 'updated' });
  if (prevSolver && prevSolver !== updated.solverId)
    sendEvent(prevSolver, 'task-update', { taskId, action: 'reassigned' });
  sendEvent(task.authorId, 'task-update', { taskId, action: 'updated' });

  return updated;
}

async function startTask(taskId, solverId) {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new NotFoundError('task');
  if (task.solverId !== solverId) throw new AccessError('not assigned', 403);
  if (task.status !== TASK_STATUS.PENDING)
    throw new BadRequestError(`cant start, status is ${task.status}`);

  const updated = await taskRepo.update(taskId, { status: TASK_STATUS.STARTED });
  logger.info('task:start', { taskId, solverId });
  sendEvent(task.authorId, 'task-update', { taskId, action: 'started' });
  return updated;
}

async function completeTask(taskId, solverId, completionNote) {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new NotFoundError('task');
  if (task.solverId !== solverId) throw new AccessError('not assigned to you', 403);
  if (task.status !== TASK_STATUS.STARTED)
    throw new BadRequestError(`cant complete, status is ${task.status}`);

  const res = await taskRepo.update(taskId, {
    status: TASK_STATUS.COMPLETED, completionNote,
  });

  await notifRepo.create({
    userId: task.authorId, taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_COMPLETED,
    message: `"${task.title}" completed, needs review`,
  });
  logger.info('task:complete', { taskId, solverId });
  sendEvent(task.authorId, 'task-update', { taskId, action: 'completed' });
  sendEvent(task.authorId, 'notification', { taskId });
  return res;
}

const approveTask = async (taskId, authorId) => {
  const task = await taskRepo.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('task');
  if (task.status !== TASK_STATUS.COMPLETED)
    throw new BadRequestError(`cant approve, status is ${task.status}`);

  const out = await taskRepo.update(taskId, { status: TASK_STATUS.APPROVED });
  await notifRepo.create({
    userId: task.solverId, taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_APPROVED,
    message: `"${task.title}" approved`,
  });
  logger.info('task:approve', { taskId, authorId });
  sendEvent(task.solverId, 'task-update', { taskId, action: 'approved' });
  sendEvent(task.solverId, 'notification', { taskId });
  return out;
};

async function rejectTask(taskId, authorId, reason) {
  const task = await taskRepo.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('task');
  if (task.status !== TASK_STATUS.COMPLETED)
    throw new BadRequestError('task not in completed state');

  const res = await taskRepo.update(taskId, {
    status: TASK_STATUS.STARTED,
    rejectionReason: reason, completionNote: null,
  });
  await notifRepo.create({
    userId: task.solverId, taskId: task.id,
    type: NOTIFICATION_TYPES.TASK_REJECTED,
    message: `"${task.title}" rejected — ${reason}`,
  });
  logger.info('task:reject', { taskId, authorId, reason });

  sendEvent(task.solverId, 'task-update', { taskId, action: 'rejected' });
  sendEvent(task.solverId, 'notification', { taskId });
  return res;
}

async function deleteTask(taskId, authorId) {
  const task = await taskRepo.findByIdAndAuthor(taskId, authorId);
  if (!task) throw new NotFoundError('Task');

  // cleanup notifications first, then the task itself
  const deletedNotifs = await notifRepo.deleteByTaskId(taskId);
  logger.debug('deleted notifs for task', { taskId, count: deletedNotifs?.count });
  await taskRepo.deleteById(taskId);
  logger.info('task:delete', { taskId, authorId });

  if (task.solverId)
    sendEvent(task.solverId, 'task-update', { taskId, action: 'deleted' });
}

module.exports = {
  getTasksByRole, getTaskById, createTask, updateTask,
  startTask, completeTask, approveTask, rejectTask, deleteTask,
};
