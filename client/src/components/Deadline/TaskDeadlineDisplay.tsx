/*
  TaskDeadlineDisplay.tsx
  Renders an inline deadline label with urgency-based text color.
  Stops counting when the task reaches a terminal state (approved/rejected/completed).
*/

import { useDeadlineStatus } from '@/hooks/useDeadlineStatus';
import { formatDeadlineDate } from '@/utils/deadlineHelpers';
import '../../styles/deadline.css';

interface Props {
  dueDate: string | Date | null;
  status?: string;
}

const TERMINAL_STATUSES = ['APPROVED', 'REJECTED', 'COMPLETED'];

export default function TaskDeadlineDisplay({ dueDate, status }: Props) {
  const { urgencyStatus, displayText } = useDeadlineStatus(dueDate);

  if (!dueDate || !urgencyStatus) return null;

  // Finished tasks show a static date instead of a live countdown
  if (status && TERMINAL_STATUSES.includes(status)) {
    return (
      <span className="deadline-text" style={{ color: '#6b7280' }}>
        Was due {formatDeadlineDate(dueDate)}
      </span>
    );
  }

  return (
    <span
      className={`deadline-text deadline-${urgencyStatus.level.toLowerCase()}`}
      title={formatDeadlineDate(dueDate)}
    >
      {displayText}
    </span>
  );
}
