const { prisma } = require('../config/database.config');
const { ok } = require('../utils/response');

// just grab solvers straight from db, no need for a service layer here
async function getSolvers(_req, res, next) {
    try {
        const list = await prisma.user.findMany({
            where: { role: 'SOLVER' },
            select: { id: true, email: true, name: true },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: list });
    } catch (err) { next(err); }
}

const getUserById = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ success: false, message: 'user not found' });
        ok(res, user);
    } catch (err) {
        next(err);
    }
};

module.exports = { getSolvers, getUserById };
