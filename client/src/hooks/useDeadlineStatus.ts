/*
  useDeadlineStatus.ts
  React hook that wraps deadline helpers with a 30-second auto-refresh
  so the countdown stays live without manual interaction.
*/

import { useState, useEffect, useCallback } from 'react';
import {
  calculateTimeRemaining,
  getUrgencyLevel,
  formatDeadlineDisplay,
  TimeRemaining,
  DeadlineStatus,
} from '@/utils/deadlineHelpers';

interface DeadlineState {
  timeRemaining: TimeRemaining | null;
  urgencyStatus: DeadlineStatus | null;
  displayText: string;
  isOverdue: boolean;
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useDeadlineStatus(dueDate: string | Date | null): DeadlineState {
  const [state, setState] = useState<DeadlineState>({
    timeRemaining: null,
    urgencyStatus: null,
    displayText: 'No deadline set',
    isOverdue: false,
  });

  const refresh = useCallback(() => {
    const time = calculateTimeRemaining(dueDate);
    if (!time) {
      setState({ timeRemaining: null, urgencyStatus: null, displayText: 'No deadline set', isOverdue: false });
      return;
    }

    const daysRemaining = time.totalSeconds / 86400;
    const urgency = getUrgencyLevel(daysRemaining, time.isOverdue);
    const text = formatDeadlineDisplay(time);

    setState({ timeRemaining: time, urgencyStatus: urgency, displayText: text, isOverdue: time.isOverdue });
  }, [dueDate]);

  // Run immediately on mount and whenever dueDate changes
  useEffect(() => { refresh(); }, [refresh]);

  // Tick every 30s to keep the countdown fresh
  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  return state;
}
