const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const t0 = Date.now();
    logger.info(`>> ${req.method} ${req.originalUrl}`, {
        ip: req.ip, userId: req.user?.id || 'anon'
    });

    res.on('finish', () => {
        const ms = Date.now() - t0;
        const lvl = res.statusCode >= 400 ? 'warn' : 'info';
        logger[lvl](`<< ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
};

module.exports = { requestLogger };
