export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOverdue: boolean;
}

export type UrgencyLevel = 'OVERDUE' | 'URGENT' | 'WARNING' | 'SAFE';

export interface DeadlineStatus {
  level: UrgencyLevel;
  color: string;
  label: string;
}

export function calculateTimeRemaining(dueDate: string | Date | null): TimeRemaining | null {
  if (!dueDate) return null;

  const diffMs = new Date(dueDate).getTime() - Date.now();
  const isOverdue = diffMs < 0;
  const abs = Math.abs(diffMs);

  const totalSeconds = Math.floor(abs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isOverdue,
  };
}

export function getUrgencyLevel(daysRemaining: number, isOverdue: boolean): DeadlineStatus {
  if (isOverdue) return { level: 'OVERDUE', color: '#dc2626', label: 'Overdue' };
  if (daysRemaining <= 2) return { level: 'URGENT', color: '#dc2626', label: 'Urgent' };
  if (daysRemaining <= 7) return { level: 'WARNING', color: '#b45309', label: 'Soon' };
  return { level: 'SAFE', color: '#059669', label: 'On track' };
}

export function formatDeadlineDisplay(timeRemaining: TimeRemaining | null): string {
  if (!timeRemaining) return 'no deadline';

  const { days, hours, minutes, isOverdue } = timeRemaining;

  if (isOverdue) {
    if (days > 0) return `Overdue by ${days}d`;
    if (hours > 0) return `Overdue ${hours}h`;
    return `Overdue by ${minutes} min`;
  }

  // threshold cascade
  if (days > 1) {
    return `Due in ${days} days`;
  } else if (days === 1) {
    return 'Due tmrw';
  } else if (hours > 1) {
    return `Due in ${hours}h`;
  } else if (hours === 1) {
    return 'Due in ~1 hour';
  } else if (minutes > 1) {
    return `Due in ${minutes} min`;
  }

  return 'Due very soon';
}

export function formatDeadlineDate(dueDate: string | Date | null): string {
  if (!dueDate) return 'no deadline';

  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
