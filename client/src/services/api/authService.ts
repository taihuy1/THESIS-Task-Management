import apiClient from './client';
import {
    LoginCredentials,
    AuthResponse,
} from '@/types/user.types';

export async function login(creds: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', creds);
    return data.data;
}

// export async function register(payload: RegisterPayload): Promise<AuthResponse> {
//     const { data } = await apiClient.post('/auth/register', payload);
//     return data.data;
// }

export const logout = () => apiClient.post('/auth/logout');

// export async function getCurrentUser(): Promise<User> {
//     const { data } = await apiClient.get('/auth/me');
//     return data.data;
// }
