const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { dbCheck } = require('../middleware/db.middleware');
const { loginSchema, registerSchema } = require('../validators/auth.validator');

router.post('/login', dbCheck, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);

module.exports = router;