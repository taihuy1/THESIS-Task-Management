import { TaskStatus, Priority } from '@/types/task.types';

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.STARTED]: 'In Progress',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.APPROVED]: 'Approved',
  [TaskStatus.REJECTED]: 'Rejected',
};
// string keys, not enum
const statusColors: Record<string, string> = {
  PENDING: '#6b7280',
  STARTED: '#2563eb',
  COMPLETED: '#d97706',
  APPROVED: '#10b981',
  REJECTED: '#dc2626',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export function getStatusLabel(status: TaskStatus) {
  return statusLabels[status] || status;
}
export function getStatusColor(status: TaskStatus) {
  return statusColors[status] || '#6b7280';
}

export function getPriorityLabel(priority: Priority) {
  return priorityLabels[priority] || priority;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}
