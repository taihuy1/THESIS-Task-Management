/*
  TaskCreationForm.tsx
  Form for Authors to create a new task. Includes title, description,
  solver assignment, priority, and an optional deadline picker.
*/

import { useState, FormEvent } from 'react';
import { CreateTaskPayload, Priority } from '@/types/task.types';
import { useSolvers } from '@/hooks/useSolvers';

interface Props {
  onSubmit: (payload: CreateTaskPayload) => Promise<unknown>;
  onCancel?: () => void;
}

export default function TaskCreationForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDateTime, setDueDateTime] = useState('');
  const [solverId, setSolverId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { solvers, error: solverError } = useSolvers();

  // Prevent selecting a past deadline
  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!solverId) return;

    setIsSubmitting(true);
    try {
      const dueDateISO = dueDateTime ? new Date(dueDateTime).toISOString() : undefined;

      await onSubmit({
        title,
        desc,
        solvers: [solverId],
        priority,
        ...(dueDateISO && { dueDate: dueDateISO }),
      });

      // Reset form after successful creation
      setTitle('');
      setDesc('');
      setPriority(Priority.MEDIUM);
      setDueDateTime('');
      setSolverId('');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h3>Create New Task</h3>
      <form onSubmit={handleSubmit}>
        {solverError && <p style={{ color: 'red', fontSize: '12px' }}>{solverError}</p>}

        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Task title" />
        </div>

        <div>
          <label htmlFor="desc">Description</label>
          <textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} required rows={3} placeholder="Task description" />
        </div>

        <div>
          <label htmlFor="solver">Assign to Solver</label>
          <select id="solver" value={solverId} onChange={e => setSolverId(e.target.value)} required>
            <option value="">-- Select a Solver --</option>
            {solvers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDateTime">Deadline (Optional)</label>
          <input
            id="dueDateTime"
            type="datetime-local"
            value={dueDateTime}
            min={minDateTime}
            onChange={e => setDueDateTime(e.target.value)}
          />
        </div>

        <div className="creation-form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

