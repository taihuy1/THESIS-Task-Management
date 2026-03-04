const { prisma } = require('../config/database.config');
const { fail } = require('../utils/response');
const logger = require('../utils/logger');

const dbCheck = async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (e) {
        logger.error('db down', e);
        return fail(res, 'db unavailable', 503);
    }
};

module.exports = { dbCheck };
