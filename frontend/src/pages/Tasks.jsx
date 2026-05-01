import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { isAdmin } = useAuth();

  const [tasks,    setTasks]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const LIMIT = 15;

  const [showForm,     setShowForm]     = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tasks', {
        params: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          page:   filters.page,
          limit:  LIMIT,
        },
      });
      setTasks(res.data.data);
      setTotal(res.data.total);
    } catch (_) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Load supporting data once
  useEffect(() => {
    api.get('/api/projects', { params: { limit: 100 } }).then(r => setProjects(r.data.data)).catch(() => {});
    if (isAdmin) {
      api.get('/api/users').then(r => setUsers(r.data)).catch(() => {});
    }
  }, [isAdmin]);

  const handleDelete = async () => {
    try {
      await api.delete('/api/tasks/${deleteTarget.id}`);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-subtitle">{total} task{total !== 1 ? 's' : ''} found</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowForm(true); }}>
            + New Task
          </button>
        )}
      </div>

      <TaskFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>✅ No tasks found. {isAdmin && 'Create your first task!'}</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => { setEditTask(t); setShowForm(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
          >← Prev</button>
          <span className="page-info">Page {filters.page} of {totalPages}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={filters.page === totalPages}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
          >Next →</button>
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editTask}
          projects={projects}
          users={users}
          onSuccess={() => { setShowForm(false); fetchTasks(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Task"
        message={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
