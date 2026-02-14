// Notification service — read/unread, create, mark-as-read
const notificationRepository = require('../repositories/notification.repository');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const getNotifications = async (userId, unreadOnly = false) => {
    return notificationRepository.findByUserId(userId, unreadOnly);
};

const getUnreadCount = async (userId) => {
    return notificationRepository.countUnread(userId);
};

const markAsRead = async (notifId, userId) => {
    const notification = await notificationRepository.findByIdAndUser(notifId, userId);
    if (!notification) {
        throw new NotFoundError('Notification not found or access denied');
    }

    await notificationRepository.markAsRead(notifId);

    logger.info(`Notification marked as read: ${notifId}`, { userId });
};

const markAllAsRead = async (userId) => {
    await notificationRepository.markAllAsRead(userId);

    logger.info('All notifications marked as read', { userId });
};

const createNotification = async (userId, taskId, message) => {
    const notification = await notificationRepository.create({
        userId,
        taskId,
        message
    });

    logger.info(`Notification created for user ${userId}`, { notificationId: notification.id, taskId });

    return notification;
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification
};
