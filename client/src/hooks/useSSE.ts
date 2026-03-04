import { useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/services/storage/authStorage';
import { config } from '@/constants/config';

type Handler = () => void;

interface UseSSEOptions {
  onTaskUpdate?: Handler;
  onNotification?: Handler;
}

export function useSSE({ onTaskUpdate, onNotification }: UseSSEOptions) {
  const taskRef = useRef(onTaskUpdate);
  const notifRef = useRef(onNotification);
  taskRef.current = onTaskUpdate;
  notifRef.current = onNotification;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return null;

    const es = new EventSource(
      `${config.apiBaseUrl}/events/stream?token=${encodeURIComponent(token)}`
    );
    es.addEventListener('task-update', () => taskRef.current?.());
    es.addEventListener('notification', () => notifRef.current?.());
    es.onerror = () => {
      console.warn('SSE connection dropped, browser will retry');
    };
    return es;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => { es?.close(); };
  }, [connect]);
}
