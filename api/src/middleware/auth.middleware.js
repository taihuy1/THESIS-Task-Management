// JWT authentication and role-based access control
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth.config');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');
const userRepository = require('../repositories/user.repository');

// Verify JWT and attach user to req
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Authentication token required', 401);
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify user still exists in database
        const user = await userRepository.findById(decoded.id);
        if (!user) {
            return errorResponse(res, 'User account not found. Please login again', 401);
        }

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired. Please login again', 401);
        }
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        logger.error('Authentication error:', error);
        return errorResponse(res, 'Authentication failed', 401);
    }
};

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            logger.warn(`Access denied for user ${req.user?.id} (role: ${userRole})`, {
                requiredRoles: allowedRoles,
                path: req.path
            });
            return errorResponse(
                res,
                `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                403
            );
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};
