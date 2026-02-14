// Notification DB queries
const { prisma } = require('../config/database.config');

const create = async (notifData) => {
    return prisma.notification.create({
        data: notifData
    });
};

const findByUserId = async (userId, unreadOnly = false) => {
    const whereClause = unreadOnly
        ? { userId, isRead: false }
        : { userId };

    return prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
    });
};

const findByIdAndUser = async (notifId, userId) => {
    return prisma.notification.findFirst({
        where: { id: notifId, userId }
    });
};

const markAsRead = async (notifId) => {
    return prisma.notification.update({
        where: { id: notifId },
        data: { isRead: true }
    });
};

const markAllAsRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

const deleteByTaskId = async (taskId) => {
    return prisma.notification.deleteMany({
        where: { taskId }
    });
};

const countUnread = async (userId) => {
    return prisma.notification.count({
        where: { userId, isRead: false }
    });
};

module.exports = {
    create,
    findByUserId,
    findByIdAndUser,
    markAsRead,
    markAllAsRead,
    deleteByTaskId,
    countUnread
};
