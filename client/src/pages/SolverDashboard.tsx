import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useSSE } from '@/hooks/useSSE';
import { useAuth } from '@/context/AuthContext';
import TaskTable from '@/components/shared/TaskTable';
import TaskDetailPanel from '@/components/shared/TaskDetailPanel';
import NotificationBell from '@/components/Notifications/NotificationBell';

export default function SolverDashboard() {
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { tasks, loadTasks, startTask, completeTask, loading, error } = useTasks({
    statusFilter: filter,
  });

  useSSE({ onTaskUpdate: loadTasks });

  const selectedTask = tasks.find(t => t.id === selectedId) ?? null;

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

      {error && <p style={{ color: '#dc2626', margin: '12px 0' }}>{error}</p>}

      <div className="toolbar">
        <select value={filter || ''} onChange={e => setFilter((e.target.value || undefined) as any)} style={{ padding: '8px' }}>
          <option value="">All Tasks</option>
          <option value="PENDING">Pending</option>
          <option value="STARTED">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="APPROVED">Approved</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TaskTable tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} role="SOLVER" />
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          role="SOLVER"
          onStart={startTask}
          onComplete={completeTask}
        />
      )}
    </div>
  );
}
