const notifService = require('../services/notification.service');
const { prisma } = require('../config/database.config');
const { ok } = require('../utils/response');

async function getNotifications(req, res, next) {
    try {
        const items = await notifService.getNotifications(req.user.id);
        ok(res, items);
    } catch (err) { next(err); }
}

// these two are simple enough to just do inline
const markAsRead = async (req, res, next) => {
    try {
        const n = await prisma.notification.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!n) return res.status(404).json({ success: false, message: 'not found' });
        await prisma.notification.update({ where: { id: n.id }, data: { isRead: true } });
        res.json({ success: true, data: null });
    } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        ok(res, null);
    } catch (err) {
        next(err);
    }
};

// skip service for count
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user.id, isRead: false }
        });
        ok(res, { count });
    } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
