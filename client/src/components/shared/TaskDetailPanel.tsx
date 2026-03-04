import { useState } from 'react';
import { Task, TaskStatus } from '@/types/task.types';
import { getStatusLabel, getStatusColor } from '@/utils/taskHelpers';
import { formatDeadlineDate } from '@/utils/deadlineHelpers';
import TaskDeadlineDisplay from '@/components/Deadline/TaskDeadlineDisplay';
import TaskLifecycleStepper from '@/components/shared/TaskLifecycleStepper';
import '@/styles/dashboard.css';

interface Props {
  task: Task;
  role: 'AUTHOR' | 'SOLVER';
  onEdit?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDelete?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string, completionNote: string) => void;
}

export default function TaskDetailPanel({
  task, role, onEdit, onApprove, onReject, onDelete, onStart, onComplete,
}: Props) {
  // these need casting because Task type doesn't include the joined fields
  const solver = (task as any).solver;
  const author = (task as any).author;

  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleComplete = () => {
    if (!completionNote.trim()) return;
    onComplete?.(task.id, completionNote.trim());
    setCompletionNote('');
    setShowCompleteForm(false);
  };

  function handleReject() {
    if (!rejectionReason.trim()) return;
    onReject?.(task.id, rejectionReason.trim());
    setRejectionReason('');
    setShowRejectForm(false);
  }

  return (
    <div className="detail-panel">
      <h3>{task.title}</h3>

      <TaskLifecycleStepper status={task.status} />

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
          <p>{task.description || 'No description'}</p>
        </div>

        <div className="detail-field">
          <label>Created</label>
          <span>{new Date(task.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        <div className="detail-field">
          <label>Last Updated</label>
          <span>{new Date(task.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>

        {task.completionNote && (
          <div className="detail-field detail-description">
            <label>Completion Note</label>
            <p style={{ color: '#059669' }}>{task.completionNote}</p>
          </div>
        )}

        {task.rejectionReason && (
          <div className="detail-field detail-description">
            <label>Rejection Reason</label>
            <p style={{ color: '#dc2626' }}>{task.rejectionReason}</p>
          </div>
        )}
      </div>

      {showCompleteForm && (
        <div className="inline-prompt">
          <label>What has been done?</label>
          <textarea
            value={completionNote}
            onChange={e => setCompletionNote(e.target.value)}
            placeholder="What did you do?"
            rows={3}
            maxLength={500}
            autoFocus
          />
          <div className="inline-prompt-actions">
            <button className="btn-complete" onClick={handleComplete} disabled={!completionNote.trim()}>
              Submit
            </button>
            <button className="btn-cancel" onClick={() => { setShowCompleteForm(false); setCompletionNote(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRejectForm && (
        <div className="inline-prompt">
          <label>Why are you rejecting this task?</label>
          <textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="What needs fixing?"
            rows={3}
            maxLength={300}
            autoFocus
          />
          <div className="inline-prompt-actions">
            <button className="btn-reject" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject
            </button>
            <button className="btn-cancel" onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="detail-actions">
        {role === 'AUTHOR' && (
          <>
            {onEdit && task.status !== TaskStatus.APPROVED && (
              <button className="btn-edit" onClick={onEdit}>Edit</button>
            )}
            {task.status === TaskStatus.COMPLETED && onApprove && (
              <button className="btn-approve" onClick={() => onApprove(task.id)}>Approve</button>
            )}
            {task.status === TaskStatus.COMPLETED && onReject && !showRejectForm && (
              <button className="btn-reject" onClick={() => setShowRejectForm(true)}>Reject</button>
            )}
            {onDelete && (
              <button className="btn-delete" onClick={() => confirm('Delete task?') && onDelete(task.id)}>
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
            {task.status === TaskStatus.STARTED && onComplete && !showCompleteForm && (
              <button className="btn-complete" onClick={() => setShowCompleteForm(true)}>Mark Complete</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
