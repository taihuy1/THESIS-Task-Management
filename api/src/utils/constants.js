// Application-wide constants: roles, statuses, transitions

const ROLES = {
    AUTHOR: 'AUTHOR',
    SOLVER: 'SOLVER'
};

const TASK_STATUS = {
    PENDING: 'PENDING',
    STARTED: 'STARTED',
    COMPLETED: 'COMPLETED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

// Allowed state transitions
const STATUS_TRANSITIONS = {
    [TASK_STATUS.PENDING]: [TASK_STATUS.STARTED],
    [TASK_STATUS.STARTED]: [TASK_STATUS.COMPLETED],
    [TASK_STATUS.COMPLETED]: [TASK_STATUS.APPROVED, TASK_STATUS.REJECTED],
    [TASK_STATUS.APPROVED]: [],
    [TASK_STATUS.REJECTED]: [TASK_STATUS.STARTED]
};

const isValidTransition = (currentStatus, newStatus) => {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
};

const NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'TASK_ASSIGNED',
    TASK_APPROVED: 'TASK_APPROVED',
    TASK_REJECTED: 'TASK_REJECTED',
    TASK_STARTED: 'TASK_STARTED',
    TASK_COMPLETED: 'TASK_COMPLETED'
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_ERROR: 500
};

module.exports = {
    ROLES,
    TASK_STATUS,
    STATUS_TRANSITIONS,
    isValidTransition,
    NOTIFICATION_TYPES,
    HTTP_STATUS
};
