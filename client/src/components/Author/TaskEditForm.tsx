import { useState, useEffect, FormEvent } from 'react';
import { Task, Priority, UpdateTaskPayload } from '@/types/task.types';
import { User } from '@/types/user.types';
import apiClient from '@/services/api/client';
import '@/styles/dashboard.css';

interface Props {
  task: Task;
  onSave: (id: string, payload: UpdateTaskPayload) => Promise<unknown>;
  onCancel: () => void;
}

export default function TaskEditForm({ task, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || '');
  const [priority, setPriority] = useState<Priority>(task.priority as Priority);
  const [dueDateTime, setDueDateTime] = useState(task.dueDate ? toLocalInput(task.dueDate) : '');
  const [solverId, setSolverId] = useState(task.solverId || '');
  const [saving, setSaving] = useState(false);
  const [solvers, setSolvers] = useState<User[]>([]);

  useEffect(() => {
    // grab solvers for the dropdown — not worth a custom hook for this
    apiClient.get('/users').then(res => setSolvers(res.data.data)).catch(() => {});
  }, []);
  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: UpdateTaskPayload = { title, desc, priority };
      if (dueDateTime) (payload as any).dueDate = new Date(dueDateTime).toISOString();
      if (solverId && solverId !== task.solverId) payload.solverId = solverId;

      await onSave(task.id, payload);
    } catch (err) {
      console.error('edit failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h3>Edit Task</h3>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="edit-title">Title</label>
          <input id="edit-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="form-field">
          <label htmlFor="edit-priority">Priority</label>
          <select id="edit-priority" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-field full-width">
          <label htmlFor="edit-desc">Description</label>
          <textarea id="edit-desc" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
        </div>

        <div className="form-field">
          <label htmlFor="edit-solver">Assigned Solver</label>
          <select id="edit-solver" value={solverId} onChange={e => setSolverId(e.target.value)}>
            <option value="">-- Select --</option>
            {solvers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="edit-due">Deadline</label>
          <input
            id="edit-due"
            type="datetime-local"
            value={dueDateTime}
            min={minDateTime}
            onChange={e => setDueDateTime(e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-edit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// format iso to local datetime input val
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
