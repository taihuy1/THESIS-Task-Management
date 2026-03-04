const taskService = require('../services/task.service');
const taskRepo = require('../repositories/task.repository');
const { ok, fail } = require('../utils/response');

// for listing we just go to the repo, taskService.getTasksByRole was basically
// a pass-through anyway
async function getTasks(req, res, next) {
    const { id, role } = req.user;
    try {
        const tasks = await taskRepo.findByRole(id, role);
        ok(res, tasks);
    } catch (err) { next(err); }
}

// simpler ones don't need try/catch, error middleware handles it
const getTaskById = async (req, res, next) => {
    const task = await taskService.getTaskById(req.params.id).catch(next);
    if (task) ok(res, task);
};

const createTask = async (req, res, next) => {
    try {
        // console.log('createTask body:', req.body);
        const task = await taskService.createTask(req.body, req.user.id);
        ok(res, task, 201);
    } catch (err) {
        next(err);
    }
};

async function updateTask(req, res, next) {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
        return ok(res, task);
    }
    catch (err) {
        next(err);
    }
}

const startTask = async (req, res, next) => {
    taskService.startTask(req.params.id, req.user.id)
        .then(t => ok(res, t))
        .catch(next);
};

const completeTask = async (req, res, next) => {
    // validate inline — just one required string, not worth a schema file
    const note = req.body.completionNote;
    if (!note || typeof note !== 'string' || note.trim().length === 0) {
        return fail(res, 'completionNote is required', 422);
    }
    if (note.length > 500) return fail(res, 'completionNote too long (max 500)', 422);

    try {
        const t = await taskService.completeTask(
            req.params.id, req.user.id, note.trim()
        );
        ok(res, t);
    } catch (err) { next(err); }
};

const approveTask = async (req, res, next) => {
    const t = await taskService.approveTask(req.params.id, req.user.id).catch(next);
    if (t) ok(res, t);
};

async function rejectTask(req, res, next) {
    const reason = req.body.reason;
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
        return fail(res, 'rejection reason is required', 422);
    }
    try {
        const t = await taskService.rejectTask(req.params.id, req.user.id, reason.trim());
        ok(res, t);
    } catch (err) {
        next(err);
    }
}

//deleteTask should probably return the deleted task instead of 204
const deleteTask = async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id, req.user.id);
        res.status(204).end();
    } catch (err) {
        // handle inline instead of going through error middleware
        const code = err.statusCode || 500;
        res.status(code).json({ success: false, message: err.message });
    }
};

module.exports = {
    getTasks, getTaskById, createTask, updateTask,
    startTask, completeTask, approveTask, rejectTask, deleteTask
};
