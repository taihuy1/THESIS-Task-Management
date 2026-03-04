import axios, { InternalAxiosRequestConfig } from 'axios';
import { config } from '@/constants/config';
import { getToken, clearAuth } from '@/services/storage/authStorage';

const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: config.apiTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (cfg: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
        return cfg;
    },
    (err) => Promise.reject(err)
);

apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            clearAuth();
            // kick them back to login, unless they're already there
            if (!window.location.pathname.includes('/login')) window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default apiClient;
