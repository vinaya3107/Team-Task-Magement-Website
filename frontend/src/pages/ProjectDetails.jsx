import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import ProjectForm from '../components/projects/ProjectForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, getInitials } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAdmin }  = useAuth();

  const [project,  setProject]  = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [showTaskForm,    setShowTaskForm]    = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editTask,        setEditTask]        = useState(null);
  const [deleteTask,      setDeleteTask]      = useState(null);
  const [deleteProject,   setDeleteProject]   = useState(false);
  const [addMemberEmail,  setAddMemberEmail]  = useState('');
  const [addingMember,    setAddingMember]    = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/api/projects/${id}`),
        api.get('/api/tasks', { params: { project_id: id, limit: 100 } }),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data.data);

      if (isAdmin) {
        const usersRes = await api.get('/api/users');
        setUsers(usersRes.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) return;
    setAddingMember(true);
    try {
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === addMemberEmail.toLowerCase());
      if (!user) { toast.error('User not found'); return; }
      await api.post('/api/projects/${id}/members`, { user_id: user.id });
      toast.success('Member added');
      setAddMemberEmail('');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete('/api/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete('/api/tasks/${deleteTask.id}`);
      toast.success('Task deleted');
      setDeleteTask(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete('/api/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!project) return null;

  const tasksByStatus = {
    'Todo':        tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done':        tasks.filter(t => t.status === 'Done'),
  };

  return (
    <div className="page">
      {/* Project Header */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Projects</button>
          <h2 className="page-title" style={{ marginTop: '0.5rem' }}>{project.name}</h2>
          {project.description && <p className="page-subtitle">{project.description}</p>}
          <p className="page-subtitle">
            Created by {project.creator_name} · {formatDate(project.created_at)}
          </p>
        </div>
        {isAdmin && (
          <div className="btn-group">
            <button className="btn btn-ghost" onClick={() => setShowProjectForm(true)}>✏️ Edit</button>
            <button className="btn btn-danger" onClick={() => setDeleteProject(true)}>🗑️ Delete</button>
          </div>
        )}
      </div>

      <div className="project-details-grid">
        {/* Members Panel */}
        <div className="panel">
          <h3 className="panel-title">👥 Members ({project.members?.length || 0})</h3>
          <div className="member-list">
            {project.members?.map((m) => (
              <div key={m.id} className="member-row">
                <div className="user-avatar user-avatar-sm">{getInitials(m.name)}</div>
                <div className="member-info">
                  <p className="member-name">{m.name}</p>
                  <p className="member-email">{m.email}</p>
                </div>
                <StatusBadge status={m.role === 'ADMIN' ? 'Done' : 'Todo'} />
                {isAdmin && (
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => handleRemoveMember(m.id)}
                    title="Remove member"
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="add-member-form">
              <input
                className="form-input"
                placeholder="Member email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddMember} disabled={addingMember}>
                {addingMember ? '…' : 'Add'}
              </button>
            </div>
          )}
        </div>

        {/* Tasks Panel */}
        <div className="tasks-panel">
          <div className="section-header">
            <h3 className="panel-title">✅ Tasks ({tasks.length})</h3>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskForm(true); }}>
                + New Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. {isAdmin && 'Add the first task!'}</p>
            </div>
          ) : (
            <div className="kanban-columns">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div key={status} className="kanban-column">
                  <div className="kanban-header">
                    <StatusBadge status={status} />
                    <span className="kanban-count">{statusTasks.length}</span>
                  </div>
                  <div className="kanban-tasks">
                    {statusTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={(t) => { setEditTask(t); setShowTaskForm(true); }}
                        onDelete={setDeleteTask}
                      />
                    ))}
                    {statusTasks.length === 0 && (
                      <p className="kanban-empty">No tasks</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editTask}
          projects={[project]}
          users={users}
          defaultProjectId={project.id}
          onSuccess={() => { setShowTaskForm(false); fetchData(); }}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Project Edit Modal */}
      {showProjectForm && (
        <ProjectForm
          project={project}
          onSuccess={() => { setShowProjectForm(false); fetchData(); }}
          onCancel={() => setShowProjectForm(false)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTask)}
        title="Delete Task"
        message={`Delete "${deleteTask?.title}"?`}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTask(null)}
      />
      <ConfirmDialog
        isOpen={deleteProject}
        title="Delete Project"
        message={`Delete "${project.name}" and ALL its tasks?`}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteProject(false)}
      />
    </div>
  );
}
