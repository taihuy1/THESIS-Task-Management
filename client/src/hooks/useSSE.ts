/*
  useSSE.ts
  Opens a persistent Server-Sent Events connection so the UI
  refreshes instantly when tasks or notifications change on the server.
  Reconnects automatically if the connection drops.
*/

import { useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/services/storage/authStorage';
import { config } from '@/constants/config';

type SSEHandler = () => void;

interface UseSSEOptions {
  onTaskUpdate?: SSEHandler;
  onNotification?: SSEHandler;
}

export function useSSE({ onTaskUpdate, onNotification }: UseSSEOptions) {
  // Store latest callbacks in refs so the EventSource listeners
  // always invoke the current version without triggering a reconnect.
  const taskRef = useRef(onTaskUpdate);
  const notifRef = useRef(onNotification);
  taskRef.current = onTaskUpdate;
  notifRef.current = onNotification;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return null;

    const url = `${config.apiBaseUrl}/events/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.addEventListener('task-update', () => taskRef.current?.());
    es.addEventListener('notification', () => notifRef.current?.());

    // EventSource retries automatically on error — no manual handling needed.
    // If the token is expired the server responds 401 and the auth
    // interceptor will redirect to login on the next API call.
    es.onerror = () => {};

    return es;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => { es?.close(); };
  }, [connect]);
}
