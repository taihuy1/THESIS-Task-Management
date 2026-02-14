// User service — solver listing and lookup
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

const getAllSolvers = async () => {
    return userRepository.findAllSolvers();
};

const getUserById = async (userId) => {
    return userRepository.findById(userId);
};

module.exports = {
    getAllSolvers,
    getUserById
};
