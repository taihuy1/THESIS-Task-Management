const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');
const { fail } = require('../utils/response');
const logger = require('../utils/logger');
const userRepo = require('../repositories/user.repository');

const authenticate = async (req, res, next) => {
    try {
        const hdr = req.headers.authorization;
        if (!hdr || !hdr.startsWith('Bearer '))
            return fail(res, 'token required', 401);

        const decoded = jwt.verify(hdr.substring(7), JWT_SECRET);
        const user = await userRepo.findById(decoded.id);
        if (!user) return fail(res, 'user not found', 401);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return fail(res, 'token expired', 401);
        if (err.name === 'JsonWebTokenError')
            return fail(res, 'bad token', 401);
        logger.error('auth err', err);
        return fail(res, 'auth failed', 401);
    }
};

const authorizeRole = (...roles) => (req, res, next) => {
    const r = req.user?.role;
    if (!r || !roles.includes(r)) {
        logger.warn('access denied', { uid: req.user?.id, role: r, need: roles });
        return fail(res, `need role: ${roles.join('/')}`, 403);
    }
    next();
};

module.exports = { authenticate, authorizeRole };
