import apiClient from './client';
import { User } from '@/types/user.types';

export const getSolvers = async (): Promise<User[]> => {
    const { data } = await apiClient.get('/users');
    return data.data;
};

export const getUserById = async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
};
