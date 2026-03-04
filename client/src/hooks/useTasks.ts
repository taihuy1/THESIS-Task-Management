import { useState, useEffect, useMemo } from 'react';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types';
import * as taskService from '@/services/api/taskService';
import { normalizeError } from '@/utils/errorHandler';

interface UseTasksOptions {
    statusFilter?: string;
    autoLoad?: boolean;
}

export function useTasks(opts: UseTasksOptions = {}) {
    const { statusFilter, autoLoad = true } = opts;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // swap one task in the list by id
    const patch = (prev: Task[], id: string, next: Task) =>
        prev.map(t => t.id === id ? next : t);

    async function loadTasks() {
        setLoading(true);
        setError(null);
        try {
            const data = await taskService.getTasks();
            setTasks(data);
        } catch (err) {
            setError(normalizeError(err).message);
        }
        setLoading(false);
    }

    const filtered = useMemo(() => {
        return statusFilter ? tasks.filter(t => t.status === statusFilter) : tasks;
    }, [tasks, statusFilter]);

    const createTask = async (payload: CreateTaskPayload) => {
        const task = await taskService.createTask(payload);
        setTasks(prev => [task, ...prev]);
        return task;
    };

    const updateTask = async (id: string, payload: UpdateTaskPayload) => {
        const t = await taskService.updateTask(id, payload);
        setTasks(prev => patch(prev, id, t));
        return t;
    };

    // just remove from local list, server already deleted it
    async function deleteTask(id: string) {
        await taskService.deleteTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    }

    // optimistic — flip status immediately, roll back on failure
    async function startTask(id: string) {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: 'STARTED' as any } : t
        ));
        try {
            const t = await taskService.startTask(id);
            setTasks(prev => patch(prev, id, t));
            return t;
        } catch (err) {
            await loadTasks(); // rollback
            throw err;
        }
    }

    const approveTask = async (id: string) => {
        const t = await taskService.approveTask(id);
        setTasks(prev => patch(prev, id, t));
        return t;
    };

    const rejectTask = async (id: string, reason: string) => {
        const t = await taskService.rejectTask(id, reason);
        setTasks(prev => patch(prev, id, t));
        return t;
    };

    // don't patch local state here, the SSE event will trigger a reload anyway
    async function completeTask(id: string, note: string) {
        const t = await taskService.completeTask(id, note);
        return t;
    }

    useEffect(() => {
        let cancelled = false;
        if (autoLoad) {
            loadTasks().then(() => {
                if (cancelled) setTasks([]); // cleanup if unmounted mid-flight
            });
        }
        return () => { cancelled = true; };
    }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        tasks: filtered, loading, error,
        loadTasks, createTask, updateTask, deleteTask,
        approveTask, rejectTask, startTask, completeTask,
    };
}
