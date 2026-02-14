// Database availability check
const { prisma } = require('../config/database.config');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const requireDatabase = async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (error) {
        logger.error('Database connection failed:', error);
        return errorResponse(res, 'Database connection unavailable', 503);
    }
};

module.exports = {
    requireDatabase
};
