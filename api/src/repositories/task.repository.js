// Task DB queries
const { prisma } = require('../config/database.config');

const create = async (taskData) => {
    return prisma.task.create({
        data: taskData,
        include: {
            solver: { select: { id: true, name: true, email: true } },
            author: { select: { id: true, name: true, email: true } },
        },
    });
};

const findById = async (taskId) => {
    return prisma.task.findUnique({
        where: { id: taskId }
    });
};

// Authors see their tasks, Solvers see assigned tasks
const findByRole = async (userId, role) => {
    const normalizedRole = role.toUpperCase();
    const whereClause = normalizedRole === 'AUTHOR'
        ? { authorId: userId }
        : { solverId: userId };

    return prisma.task.findMany({
        where: whereClause,
        include: {
            solver: { select: { id: true, name: true, email: true } },
            author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const update = async (taskId, updateData) => {
    return prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
            solver: { select: { id: true, name: true, email: true } },
            author: { select: { id: true, name: true, email: true } },
        },
    });
};

const deleteById = async (taskId) => {
    return prisma.task.delete({
        where: { id: taskId }
    });
};

const isAuthor = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { authorId: true }
    });
    return task?.authorId === userId;
};

const isSolver = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { solverId: true }
    });
    return task?.solverId === userId;
};

const findByIdAndAuthor = async (taskId, authorId) => {
    return prisma.task.findFirst({
        where: { id: taskId, authorId }
    });
};

module.exports = {
    create,
    findById,
    findByRole,
    update,
    deleteById,
    isAuthor,
    isSolver,
    findByIdAndAuthor
};
