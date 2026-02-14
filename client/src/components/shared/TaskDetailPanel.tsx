/*
  TaskDetailPanel.tsx
  Shows full information for the selected task below the table.
  Role-aware:
    - Authors see Edit, Approve, Reject, Delete buttons
    - Solvers see Start, Complete buttons (status changes only)
*/

import { Task, TaskStatus } from '@/types/task.types';
import { getStatusLabel, getStatusColor } from '@/utils/taskHelpers';
import { formatDeadlineDate } from '@/utils/deadlineHelpers';
import TaskDeadlineDisplay from '@/components/Deadline/TaskDeadlineDisplay';
import '@/styles/dashboard.css';

interface Props {
  task: Task;
  role: 'AUTHOR' | 'SOLVER';
  onEdit?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export default function TaskDetailPanel({
  task, role, onEdit, onApprove, onReject, onDelete, onStart, onComplete,
}: Props) {
  const solver = (task as any).solver;
  const author = (task as any).author;

  return (
    <div className="detail-panel">
      <h3>{task.title}</h3>

      <div className="detail-grid">
        <div className="detail-field">
          <label>Status</label>
          <span style={{ color: getStatusColor(task.status), fontWeight: 600 }}>
            {getStatusLabel(task.status)}
          </span>
        </div>

        <div className="detail-field">
          <label>Priority</label>
          <span>{task.priority}</span>
        </div>

        <div className="detail-field">
          <label>Due Date</label>
          {task.dueDate ? (
            role === 'SOLVER'
              ? <TaskDeadlineDisplay dueDate={task.dueDate} status={task.status} />
              : <span>{formatDeadlineDate(task.dueDate)}</span>
          ) : (
            <span style={{ color: '#9ca3af' }}>No deadline set</span>
          )}
        </div>

        <div className="detail-field">
          <label>{role === 'AUTHOR' ? 'Assigned Solver' : 'Assigned By'}</label>
          <span>
            {role === 'AUTHOR'
              ? (solver ? `${solver.name} (${solver.email})` : '—')
              : (author ? `${author.name} (${author.email})` : '—')
            }
          </span>
        </div>

        <div className="detail-field detail-description">
          <label>Description</label>
          <p>{task.description || 'No description provided.'}</p>
        </div>

        <div className="detail-field">
          <label>Created</label>
          <span>{new Date(task.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        <div className="detail-field">
          <label>Last Updated</label>
          <span>{new Date(task.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        {task.rejectionReason && (
          <div className="detail-field detail-description">
            <label>Rejection Reason</label>
            <p style={{ color: '#dc2626' }}>{task.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="detail-actions">
        {role === 'AUTHOR' && (
          <>
            {onEdit && task.status !== TaskStatus.APPROVED && (
              <button className="btn-edit" onClick={onEdit}>Edit</button>
            )}
            {task.status === TaskStatus.COMPLETED && onApprove && (
              <button className="btn-approve" onClick={() => onApprove(task.id)}>Approve</button>
            )}
            {task.status === TaskStatus.COMPLETED && onReject && (
              <button className="btn-reject" onClick={() => onReject(task.id)}>Reject</button>
            )}
            {onDelete && (
              <button className="btn-delete" onClick={() => confirm('Delete this task?') && onDelete(task.id)}>
                Delete
              </button>
            )}
          </>
        )}

        {role === 'SOLVER' && (
          <>
            {task.status === TaskStatus.PENDING && onStart && (
              <button className="btn-start" onClick={() => onStart(task.id)}>Start Working</button>
            )}
            {task.status === TaskStatus.STARTED && onComplete && (
              <button className="btn-complete" onClick={() => onComplete(task.id)}>Mark Complete</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
