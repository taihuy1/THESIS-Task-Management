const { prisma } = require('../config/database.config');
const { ROLES } = require('../utils/constants');

const userFields = { id: true, email: true, name: true, role: true, createdAt: true };

const findByEmail = (email) =>
    prisma.user.findUnique({ where: { email } });

const findById = (id) =>
    prisma.user.findUnique({ where: { id }, select: userFields });

function create(data) {
    return prisma.user.create({ data, select: userFields });
}

const findAllSolvers = () =>
    prisma.user.findMany({
        where: { role: ROLES.SOLVER },
        select: { id: true, email: true, name: true },
        orderBy: { name: 'asc' }
    });

async function existsByEmail(email) {
    const n = await prisma.user.count({ where: { email } });
    return n > 0;
}

module.exports = { findByEmail, findById, create, findAllSolvers, existsByEmail };
