const { fail } = require('../utils/response');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, _next) => {
    logger.error(`${req.method} ${req.originalUrl} => ${err.message}`);

    if (err instanceof AppError && err.isOperational)
        return fail(res, err.message, err.statusCode, err.errors);

    // some places throw plain Errors with a statusCode attached
    if (err.isOperational && err.statusCode)
        return fail(res, err.message, err.statusCode);

    if (err.code === 'P2002') return fail(res, 'duplicate record', 409);
    if (err.code === 'P2025') return fail(res, 'not found', 404);

    if (err.name === 'JsonWebTokenError') return fail(res, 'bad token', 401);
    if (err.name === 'TokenExpiredError') return fail(res, 'token expired', 401);

    const msg = process.env.NODE_ENV === 'development' ? err.message : 'server error';
    return fail(res, msg, 500);
};

const notFound = (req, res) =>
    fail(res, `${req.method} ${req.path} not found`, 404);

module.exports = { errorHandler, notFound };
