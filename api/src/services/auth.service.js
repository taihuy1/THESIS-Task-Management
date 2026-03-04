const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } = require('../config/auth.config');
const userRepo = require('../repositories/user.repository');
const { AccessError } = require('../utils/errors');
const logger = require('../utils/logger');

const login = async (email, password) => {
    const user = await userRepo.findByEmail(email);
    if (!user) {
        logger.warn('login failed', { email });
        throw new AccessError('invalid credentials');
    }

    // bcrypt compare
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        logger.warn('bad password', { email });
        throw new AccessError('invalid credentials');
    }

    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
    );
    logger.info('login', { userId: user.id });

    return {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
};

const register = async (email, password, role, name) => {
    if (await userRepo.existsByEmail(email)) {
        // don't bother with a custom error class for this one case
        const err = new Error('email already registered');
        err.statusCode = 409;
        err.isOperational = true;
        throw err;
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepo.create({ email, password: hash, role, name });
    logger.info('register', { userId: user.id, role });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new AccessError(
            err.name === 'TokenExpiredError' ? 'token expired' : 'bad token'
        );
    }
};

module.exports = { login, register, verifyToken };
