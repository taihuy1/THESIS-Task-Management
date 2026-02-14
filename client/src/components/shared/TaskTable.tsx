/*
  TaskTable.tsx
  Sortable task table shared by Author and Solver dashboards.
  Rows are clickable — selecting a row surfaces the detail panel.
  Due Date column toggles sort order (most recent first by default).
*/

import { useMemo, useState } from 'react';
import { Task, TaskStatus, Priority } from '@/types/task.types';
import { getStatusLabel, getStatusColor } from '@/utils/taskHelpers';
import { formatDeadlineDate } from '@/utils/deadlineHelpers';
import TaskDeadlineDisplay from '@/components/Deadline/TaskDeadlineDisplay';
import '@/styles/dashboard.css';

type SortDir = 'asc' | 'desc';

interface Props {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  role: 'AUTHOR' | 'SOLVER';
}

const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

export default function TaskTable({ tasks, selectedId, onSelect, role }: Props) {
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Sort by due date. Tasks without a deadline sink to the bottom.
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : null;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : null;

      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;

      return sortDir === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }, [tasks, sortDir]);

  const toggleSort = () => setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
  const arrow = sortDir === 'desc' ? ' ↓' : ' ↑';

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          {role === 'AUTHOR' && <th>Solver</th>}
          {role === 'SOLVER' && <th>Author</th>}
          <th className="sortable" onClick={toggleSort}>
            Due Date{arrow}
          </th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr className="empty-row">
            <td colSpan={role === 'AUTHOR' ? 6 : 6}>No tasks found</td>
          </tr>
        ) : (
          sorted.map(task => (
            <tr
              key={task.id}
              className={task.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(task.id)}
            >
              <td>{task.title}</td>
              <td>
                <span
                  className="status-pill"
                  style={{
                    color: getStatusColor(task.status),
                    backgroundColor: getStatusColor(task.status) + '18',
                  }}
                >
                  {getStatusLabel(task.status)}
                </span>
              </td>
              <td>
                <span className="priority-text" style={{ color: priorityColor(task.priority) }}>
                  {task.priority}
                </span>
              </td>
              {role === 'AUTHOR' && <td>{task.solver?.name ?? '—'}</td>}
              {role === 'SOLVER' && <td>{task.author?.name ?? '—'}</td>}
              <td>
                {task.dueDate ? (
                  role === 'SOLVER'
                    ? <TaskDeadlineDisplay dueDate={task.dueDate} status={task.status} />
                    : <span>{formatDeadlineDate(task.dueDate)}</span>
                ) : (
                  <span style={{ color: '#9ca3af' }}>—</span>
                )}
              </td>
              <td style={{ color: '#6b7280', fontSize: '13px' }}>
                {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function priorityColor(p: Priority | string): string {
  switch (p) {
    case 'HIGH': return '#dc2626';
    case 'MEDIUM': return '#d97706';
    case 'LOW': return '#6b7280';
    default: return '#6b7280';
  }
}
