const { prisma } = require('../config/database.config');

// TODO: only include solver fields the frontend actually uses
const _inc = {
    solver: { select: { id: true, name: true, email: true } },
    author: { select: { id: true, name: true, email: true } },
};

function create(data) {
    return prisma.task.create({ data, include: _inc });
}

const findById = (id) =>
    prisma.task.findUnique({ where: { id } });

const findByRole = (userId, role) => {
    const where = role.toUpperCase() === 'AUTHOR'
        ? { authorId: userId } : { solverId: userId };

    return prisma.task.findMany({
        where,
        include: _inc,
        orderBy: { createdAt: 'desc' },
    });
};

const update = (id, data) =>
    prisma.task.update({ where: { id }, data, include: _inc });

const deleteById = (id) =>
    prisma.task.delete({ where: { id } });

async function isAuthor(taskId, userId) {
    const t = await prisma.task.findUnique({ where: { id: taskId }, select: { authorId: true } });
    return t?.authorId === userId;
}
const isSolver = async (taskId, userId) => {
    const row = await prisma.task.findUnique({ where: { id: taskId }, select: { solverId: true } });
    return row?.solverId === userId;
};

const findByIdAndAuthor = (taskId, authorId) =>
    prisma.task.findFirst({ where: { id: taskId, authorId } });

module.exports = {
    create, findById, findByRole, update,
    deleteById, isAuthor, isSolver, findByIdAndAuthor
};
