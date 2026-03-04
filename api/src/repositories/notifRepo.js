const { prisma } = require('../config/database.config');

const create = (data) =>
    prisma.notification.create({ data });

function findByUserId(userId, unreadOnly = false) {
    const where = unreadOnly ? { userId, isRead: false } : { userId };
    return prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' } });
}

const findByIdAndUser = (id, userId) =>
    prisma.notification.findFirst({ where: { id, userId } });

const markAsRead = (id) =>
    prisma.notification.update({ where: { id }, data: { isRead: true } });

const markAllAsRead = (userId) =>
    prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });

function deleteByTaskId(taskId) {
    return prisma.notification.deleteMany({ where: { taskId } });
}

const countUnread = (userId) =>
    prisma.notification.count({ where: { userId, isRead: false } });

module.exports = {
    create, findByUserId, findByIdAndUser,
    markAsRead, markAllAsRead, deleteByTaskId, countUnread
};
