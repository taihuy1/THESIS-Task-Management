const authService = require('../services/auth.service');
const { ok } = require('../utils/response');
const logger = require('../utils/logger');

async function login(req, res, next) {
    const { email, password } = req.body;
    const data = await authService.login(email, password).catch(next);
    if (data) return ok(res, data);
}

const register = async (req, res, next) => {
    try {
        const { email, password, role, name } = req.body;
        const user = await authService.register(email, password, role, name);
        return res.status(201).json({ ok: true, data: user });
    } catch (err) { next(err); }
};

const logout = (req, res) => {
    logger.info('logout', { userId: req.user?.id });
    res.json({ success: true, data: null });
};

module.exports = { login, register, logout };
