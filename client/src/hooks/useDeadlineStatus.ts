import { useState, useEffect, useCallback } from 'react';
import {
  calculateTimeRemaining,
  getUrgencyLevel,
  formatDeadlineDisplay,
  TimeRemaining,
  DeadlineStatus,
} from '@/utils/deadlineHelpers';

interface State {
  timeRemaining: TimeRemaining | null;
  urgency: DeadlineStatus | null;
  displayText: string;
  isOverdue: boolean;
}

const TICK = 20_000; // ~20s

export function useDeadlineStatus(dueDate: string | Date | null): State {
  const [state, setState] = useState<State>({
    timeRemaining: null, urgency: null, displayText: 'No deadline set', isOverdue: false,
  });

  const refresh = useCallback(() => {
    const time = calculateTimeRemaining(dueDate);
    if (!time) {
      setState({ timeRemaining: null, urgency: null, displayText: 'No deadline set', isOverdue: false });
      return;
    }
    const days = time.totalSeconds / 86400;
    const urg = getUrgencyLevel(days, time.isOverdue);
    setState({ timeRemaining: time, urgency: urg, displayText: formatDeadlineDisplay(time), isOverdue: time.isOverdue });
  }, [dueDate]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const id = setInterval(refresh, TICK);
    return () => clearInterval(id);
  }, [refresh]);

  return state;
}
