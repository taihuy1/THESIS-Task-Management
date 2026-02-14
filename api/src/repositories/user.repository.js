// User DB queries
const { prisma } = require('../config/database.config');
const { ROLES } = require('../utils/constants');

const findByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email }
    });
};

const findById = async (id) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    });
};

const create = async (userData) => {
    return prisma.user.create({
        data: userData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    });
};

const findAllSolvers = async () => {
    return prisma.user.findMany({
        where: { role: ROLES.SOLVER },
        select: {
            id: true,
            email: true,
            name: true
        },
        orderBy: { name: 'asc' }
    });
};

const existsByEmail = async (email) => {
    const count = await prisma.user.count({
        where: { email }
    });
    return count > 0;
};

const updateRefreshToken = async (userId, refreshToken) => {
    return prisma.user.update({
        where: { id: userId },
        data: { refreshToken }
    });
};

module.exports = {
    findByEmail,
    findById,
    create,
    findAllSolvers,
    existsByEmail,
    updateRefreshToken
};
