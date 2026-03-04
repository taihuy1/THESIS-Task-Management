import { useDeadlineStatus } from '@/hooks/useDeadlineStatus';
import { formatDeadlineDate } from '@/utils/deadlineHelpers';
import '../../styles/deadline.css';

interface Props {
  dueDate: string | Date | null;
  status?: string;
}

const DONE = ['APPROVED', 'REJECTED', 'COMPLETED'];

export default function TaskDeadlineDisplay({ dueDate, status }: Props) {
  const { urgency, displayText } = useDeadlineStatus(dueDate);
  if (!dueDate || !urgency) return null;

  if (status && DONE.includes(status)) {
    return <span className="deadline-text" style={{ color: '#6b7280' }}>was due {formatDeadlineDate(dueDate)}</span>;
  }

  return (
    <span
      className={`deadline-text deadline-${urgency.level.toLowerCase()}`}
      title={formatDeadlineDate(dueDate)}
    >
      {displayText}
    </span>
  );
}
