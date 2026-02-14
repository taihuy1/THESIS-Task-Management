/*
  SolverDashboard.tsx
  Main view for Solvers. Tasks displayed in a sortable table.
  Clicking a row shows a read-only detail panel with Start/Complete actions.
*/

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useSSE } from '@/hooks/useSSE';
import { useAuth } from '@/context/AuthContext';
import TaskTable from '@/components/shared/TaskTable';
import TaskDetailPanel from '@/components/shared/TaskDetailPanel';
import NotificationBell from '@/components/Notifications/NotificationBell';
import { TaskStatus } from '@/types/task.types';

export default function SolverDashboard() {
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<TaskStatus | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { tasks, loadTasks, startTask, completeTask, isLoading, error } = useTasks({
    statusFilter: filter,
  });

  useSSE({ onTaskUpdate: loadTasks });

  const selectedTask = tasks.find(t => t.id === selectedId) ?? null;

  const handleStart = async (id: string) => {
    await startTask(id);
  };

  const handleComplete = async (id: string) => {
    await completeTask(id);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
        <h1>My Tasks</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationBell />
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <div style={{ color: 'red', padding: '12px', backgroundColor: '#fee', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      {/* Toolbar */}
      <div className="toolbar">
        <select value={filter || ''} onChange={e => setFilter((e.target.value as TaskStatus) || undefined)} style={{ padding: '8px' }}>
          <option value="">All Tasks</option>
          <option value={TaskStatus.PENDING}>Pending</option>
          <option value={TaskStatus.STARTED}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
          <option value={TaskStatus.APPROVED}>Approved</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <TaskTable tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} role="SOLVER" />
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          role="SOLVER"
          onStart={handleStart}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
