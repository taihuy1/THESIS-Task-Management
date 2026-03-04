const { authenticate, authorizeRole } = require('./auth.middleware');
const { dbCheck } = require('./db.middleware');
const { errorHandler, notFound } = require('./error.middleware');
const { requestLogger } = require('./logger.middleware');
const { validate, validateParams } = require('./validation.middleware');

module.exports = {
    authenticate, authorizeRole, dbCheck,
    errorHandler, notFound, requestLogger,
    validate, validateParams
};
