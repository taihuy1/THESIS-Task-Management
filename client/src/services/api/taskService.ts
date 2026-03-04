import apiClient from './client';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types';

// all task endpoints go through /task
const BASE = '/task';
const byId = (id: string) => `${BASE}/${id}`;

export async function getTasks(): Promise<Task[]> {
    const { data } = await apiClient.get(BASE);
    return data.data;
}

export const getTask = async (id: string): Promise<Task> =>
    (await apiClient.get(byId(id))).data.data;

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiClient.post(BASE, payload);
    return data.data;
}

export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.put(byId(id), payload);
    return data.data;
};

export async function deleteTask(id: string): Promise<void> {
    await apiClient.delete(byId(id));
}

export const approveTask = async (id: string): Promise<Task> =>
    (await apiClient.patch(`${byId(id)}/approve`)).data.data;

export async function rejectTask(id: string, reason?: string): Promise<Task> {
    const { data } = await apiClient.patch(`${byId(id)}/reject`, { reason });
    return data.data;
}

export const startTask = async (id: string): Promise<Task> =>
    (await apiClient.patch(`${byId(id)}/start`)).data.data;

export async function completeTask(id: string, completionNote: string): Promise<Task> {
    const { data } = await apiClient.patch(`${byId(id)}/complete`, { completionNote });
    return data.data;
}
