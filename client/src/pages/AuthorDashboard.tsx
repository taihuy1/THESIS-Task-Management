/*
  AuthorDashboard.tsx
  Main view for Authors. Toolbar with actions at the top, tasks in a
  sortable table, and a detail/edit panel below for the selected task.
*/

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useSSE } from '@/hooks/useSSE';
import { useAuth } from '@/context/AuthContext';
import TaskTable from '@/components/shared/TaskTable';
import TaskDetailPanel from '@/components/shared/TaskDetailPanel';
import TaskCreationForm from '@/components/Author/TaskCreationForm';
import TaskEditForm from '@/components/Author/TaskEditForm';
import NotificationBell from '@/components/Notifications/NotificationBell';
import { TaskStatus } from '@/types/task.types';

export default function AuthorDashboard() {
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState<TaskStatus | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const {
    tasks, loadTasks, createTask, updateTask, deleteTask, approveTask, rejectTask, isLoading, error,
  } = useTasks({ statusFilter: filter });

  useSSE({ onTaskUpdate: loadTasks });

  const selectedTask = tasks.find(t => t.id === selectedId) ?? null;

  const handleCreate = async (payload: Parameters<typeof createTask>[0]) => {
    await createTask(payload);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setSelectedId(null);
  };

  const handleSaveEdit = async (id: string, payload: Parameters<typeof updateTask>[1]) => {
    await updateTask(id, payload);
    setEditing(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
        <h1>Task Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationBell />
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <div style={{ color: 'red', padding: '12px', backgroundColor: '#fee', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      {/* Toolbar — all actions directly under the title */}
      <div className="toolbar">
        <button onClick={() => { setShowForm(!showForm); setEditing(false); }}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
        <select value={filter || ''} onChange={e => setFilter((e.target.value as TaskStatus) || undefined)} style={{ padding: '8px' }}>
          <option value="">All Tasks</option>
          <option value={TaskStatus.PENDING}>Pending</option>
          <option value={TaskStatus.STARTED}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Awaiting Approval</option>
          <option value={TaskStatus.APPROVED}>Approved</option>
        </select>
      </div>

      {/* Side-by-side layout: form on left, table on right */}
      <div className={showForm ? 'dashboard-layout' : ''}>
        {showForm && (
          <div className="creation-panel">
            <TaskCreationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className={showForm ? 'tables-wrapper' : ''}>
          {isLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <TaskTable tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} role="AUTHOR" />
          )}

          {/* Detail or edit panel below the table */}
          {selectedTask && !editing && (
            <TaskDetailPanel
              task={selectedTask}
              role="AUTHOR"
              onEdit={() => setEditing(true)}
              onApprove={approveTask}
              onReject={rejectTask}
              onDelete={handleDelete}
            />
          )}

          {selectedTask && editing && (
            <TaskEditForm task={selectedTask} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
