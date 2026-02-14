/*
  useNotifications.ts
  Fetches and manages the current user's notifications.
  Loads once on mount; live refreshes are driven by the SSE hook
  calling loadNotifications() when the server pushes an event.
*/

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/types/notification.types';
import * as notificationService from '@/services/api/notificationService';

export function useNotifications(autoLoad = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    if (autoLoad) loadNotifications();
  }, [autoLoad, loadNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { notifications, unreadCount, loadNotifications, markRead, markAllRead, isLoading };
}
