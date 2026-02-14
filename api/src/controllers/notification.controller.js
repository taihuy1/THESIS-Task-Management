// Notification controller
const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/response');

const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const notifications = await notificationService.getNotifications(userId);

        return successResponse(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const notifId = req.params.id;
        const userId = req.user.id;

        await notificationService.markAsRead(notifId, userId);

        return successResponse(res, null, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id;

        await notificationService.markAllAsRead(userId);

        return successResponse(res, null, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};

const getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const count = await notificationService.getUnreadCount(userId);

        return successResponse(res, { count }, 'Unread count retrieved');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
