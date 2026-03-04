import { useState, useEffect } from 'react';
import { Notification } from '@/types/notification.types'; // finally using the proper type
import * as notifService from '@/services/api/notificationService';

export function useNotifications(autoLoad = true) {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    try { setItems(await notifService.getNotifications()); }
    catch (err) { console.error('notifs load err', err); }
  }

  const markRead = async (id: string) => {
    await notifService.markAsRead(id).catch(() => {});
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notifService.markAllAsRead().catch(() => {});
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  useEffect(() => { if (autoLoad) load(); }, [autoLoad]);

  const unreadCount = items.filter(n => !n.isRead).length;
  return { notifications: items, unreadCount, loadNotifications: load, markRead, markAllRead };
}
