/*
  deadlineHelpers.ts
  Pure utility functions for deadline time math and display formatting.
  No side effects — safe to call from any component or hook.
*/

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

// Breaks a dueDate into days/hours/minutes/seconds from now.
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

// Maps remaining days into an urgency tier with color and label.
export function getUrgencyLevel(daysRemaining: number, isOverdue: boolean): DeadlineStatus {
  if (isOverdue) return { level: 'OVERDUE', color: '#dc2626', label: 'Overdue' };
  if (daysRemaining <= 2) return { level: 'URGENT', color: '#dc2626', label: 'Urgent' };
  if (daysRemaining <= 7) return { level: 'WARNING', color: '#b45309', label: 'Soon' };
  return { level: 'SAFE', color: '#059669', label: 'On track' };
}

// Converts TimeRemaining into a natural sentence ("Due tomorrow", "Overdue by 3 days").
export function formatDeadlineDisplay(timeRemaining: TimeRemaining | null): string {
  if (!timeRemaining) return 'No deadline';

  const { days, hours, minutes, isOverdue } = timeRemaining;

  if (isOverdue) {
    if (days > 0) return `Overdue by ${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `Overdue by ${hours} hour${hours !== 1 ? 's' : ''}`;
    return `Overdue by ${minutes} min`;
  }

  if (days > 1) return `Due in ${days} days`;
  if (days === 1) return 'Due tomorrow';
  if (hours > 1) return `Due in ${hours} hours`;
  if (hours === 1) return 'Due in about an hour';
  if (minutes > 1) return `Due in ${minutes} minutes`;
  return 'Due any moment now';
}

// Formats a dueDate as a short readable string (e.g. "Feb 15, 2:30 PM").
export function formatDeadlineDate(dueDate: string | Date | null): string {
  if (!dueDate) return 'No deadline';

  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
