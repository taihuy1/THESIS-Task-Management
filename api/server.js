const express = require('express');
const cors = require('cors');
const { PORT, CORS_ORIGIN, NODE_ENV } = require('./src/config/app.config');
const { prisma } = require('./src/config/database.config');
const { authRoutes, userRoutes, taskRoutes, notificationRoutes, sseRoutes } = require('./src/routes');
const { requestLogger } = require('./src/middleware/logger.middleware');
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const logger = require('./src/utils/logger');

const app = express();
app.use(express.json());
app.use(cors({
    origin: CORS_ORIGIN, credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(requestLogger);

app.get('/health', async (_req, res) => {
    // quick db ping for uptime checks
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'up', env: NODE_ENV });
    } catch (e) {
        logger.error('health check fail', e);
        res.status(503).json({ status: 'error', db: 'down' });
    }
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/task', taskRoutes);
app.use('/notifications', notificationRoutes);
app.use('/events', sseRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await prisma.$connect();
        logger.info('db connected');

        const srv = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`listening on :${PORT} [${NODE_ENV}]`);
        });

        srv.on('error', (err) => {
            logger.error(err.code === 'EADDRINUSE' ? `port ${PORT} busy` : 'srv error', err);
            process.exit(1);
        });

        const shutdown = async (sig) => {
            logger.info(`${sig} — shutting down`);
            srv.close(async () => {
                await prisma.$disconnect();
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (err) {
        logger.error('startup failed', err);
        process.exit(1);
    }
};

startServer();
