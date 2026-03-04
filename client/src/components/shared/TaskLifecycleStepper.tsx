import { TaskStatus } from '@/types/task.types';
import '@/styles/dashboard.css';

// the ordered steps a task goes through
const STEPS = [
  { key: TaskStatus.PENDING, label: 'Pending' },
  { key: TaskStatus.STARTED, label: 'In Progress' },
  { key: TaskStatus.COMPLETED, label: 'Completed' },
  { key: TaskStatus.APPROVED, label: 'Approved' },
];

// map each status to its position in the flow (0-based)
const POS: Record<string, number> = {
  PENDING: 0,
  STARTED: 1,
  COMPLETED: 2,
  APPROVED: 3,
  REJECTED: 2, // rejected sits at completion stage visually
};

interface Props {
  status: TaskStatus;
}

export default function TaskLifecycleStepper({ status }: Props) {
  const currentPos = POS[status] ?? 0;
  const isRejected = status === TaskStatus.REJECTED;

  return (
    <div className="lifecycle-stepper">
      {STEPS.map((step, i) => {
        // figure out the visual state of each dot
        let stepClass = '';
        if (isRejected && i === 2) {
          stepClass = 'rejected'; // completion step shows red for rejection
        } else if (i < currentPos) {
          stepClass = 'done';
        } else if (i === currentPos && !isRejected) {
          stepClass = 'active';
        }

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            <div className={`lifecycle-step ${stepClass}`}>
              <div className="step-dot">
                {stepClass === 'done' ? '✓' : (isRejected && i === 2 ? '✗' : i + 1)}
              </div>
              <span className="step-label">
                {isRejected && i === 2 ? 'Rejected' : step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${i < currentPos ? 'filled' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
