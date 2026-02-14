//
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');
const sseRoutes = require('./sse.routes');

module.exports = {
    authRoutes,
    taskRoutes,
    notificationRoutes,
    userRoutes,
    sseRoutes
};
