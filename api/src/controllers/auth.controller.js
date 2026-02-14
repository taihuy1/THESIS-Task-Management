// Auth controller — login, register, logout
const authService = require('../services/auth.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password);

        return successResponse(res, result, 'Login successful');
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { email, password, role, name } = req.body;

        const user = await authService.register(email, password, role, name);

        return createdResponse(res, user, 'User registered successfully');
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        logger.info('User logged out', { userId: req.user?.id });

        return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    register,
    logout
};
