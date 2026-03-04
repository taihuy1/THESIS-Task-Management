const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { dbCheck } = require('../middleware/db.middleware');
const { validateParams } = require('../middleware/validation.middleware');
const { idSchema } = require('../validators/common.validator');

router.use(authenticate, dbCheck);

router.get('/', userController.getSolvers);
router.get('/:id', validateParams(idSchema), userController.getUserById);

module.exports = router;
