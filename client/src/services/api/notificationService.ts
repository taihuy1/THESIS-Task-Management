import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

export async function getNotifications() {
    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE) as any;
    return data.data;
}

export const markAsRead = (id: string) =>
    apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));

export const markAllAsRead = () =>
    apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
