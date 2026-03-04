const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { dbCheck } = require('../middleware/db.middleware');
const { validateParams } = require('../middleware/validation.middleware');
const { idSchema } = require('../validators/common.validator');

router.use(authenticate, dbCheck);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', validateParams(idSchema), notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
