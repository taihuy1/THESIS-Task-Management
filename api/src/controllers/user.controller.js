// User controller
const userService = require('../services/user.service');
const { successResponse } = require('../utils/response');

const getSolvers = async (req, res, next) => {
    try {
        const solvers = await userService.getAllSolvers();

        return successResponse(res, solvers, 'Solvers retrieved successfully');
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await userService.getUserById(userId);

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSolvers,
    getUserById
};
