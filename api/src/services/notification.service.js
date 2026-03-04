const notifRepo = require('../repositories/notifRepo');
const logger = require('../utils/logger');

const getNotifications = (userId, unreadOnly = false) =>
    notifRepo.findByUserId(userId, unreadOnly);
const getUnreadCount = (userId) => notifRepo.countUnread(userId);

const markAsRead = async (notifId, userId) => {
    const n = await notifRepo.findByIdAndUser(notifId, userId);
    if (!n) throw new Error('notification not found');
    await notifRepo.markAsRead(notifId);
    logger.info('notif:read', { notifId, userId });
};

const markAllAsRead = async (userId) => {
    await notifRepo.markAllAsRead(userId);
    logger.info('notif:readAll', { userId });
};

const createNotification = async (userId, taskId, message) => {
    const n = await notifRepo.create({ userId, taskId, message });
    logger.info('notif:create', { id: n.id, taskId });
    return n;
};

module.exports = {
    getNotifications, getUnreadCount,
    markAsRead, markAllAsRead, createNotification
};
