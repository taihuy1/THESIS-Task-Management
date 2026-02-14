// Auth service — login, registration, token verification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } = require('../config/auth.config');
const userRepository = require('../repositories/user.repository');
const { AuthenticationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        logger.warn(`Login attempt failed: user "${email}" not found`);
        throw new AuthenticationError('Invalid credentials');
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        logger.warn(`Login attempt failed: invalid password for user "${email}"`);
        throw new AuthenticationError('Invalid credentials');
    }

    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`User "${email}" logged in successfully`, { userId: user.id, role: user.role });

    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    };
};

const register = async (email, password, role, name) => {
    const exists = await userRepository.existsByEmail(email);
    if (exists) {
        logger.warn(`Registration failed: email "${email}" already exists`);
        throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
        email,
        password: hashedPassword,
        role,
        name
    });

    logger.info(`New user registered: "${email}"`, { userId: user.id, role });

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationError('Token expired. Please login again');
        }
        throw new AuthenticationError('Invalid token');
    }
};

module.exports = {
    login,
    register,
    verifyToken
};
