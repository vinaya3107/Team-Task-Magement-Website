import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, isOverdue } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const { user }              = useAuth();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/api/dashboard');
      setData(res.data);
    } catch (_) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data)   return <p>Failed to load dashboard.</p>;

  const { stats, recentTasks, statusBreakdown } = data;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <h2>Welcome back, <strong>{user?.name}</strong> 👋</h2>
        <p>Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Tasks"  value={stats.total}     icon="📋" color="blue"   />
        <StatCard label="Completed"    value={stats.completed} icon="✅" color="green"  />
        <StatCard label="Pending"      value={stats.pending}   icon="⏳" color="yellow" />
        <StatCard label="Overdue"      value={stats.overdue}   icon="⚠️" color="red"    />
        <StatCard label="Projects"     value={stats.projects}  icon="📁" color="purple" />
      </div>

      {/* Status Breakdown */}
      {statusBreakdown.length > 0 && (
        <div className="section">
          <h3 className="section-title">Status Breakdown</h3>
          <div className="status-breakdown">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="breakdown-item">
                <StatusBadge status={s.status} />
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${stats.total ? (s.count / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="breakdown-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Tasks</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All →</button>
        </div>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>🎉 No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div className="recent-tasks">
            {recentTasks.map((task) => {
              const overdue = isOverdue(task.due_date, task.status);
              return (
                <div key={task.id} className={`recent-task-row ${overdue ? 'task-overdue' : ''}`}>
                  <div className="recent-task-info">
                    <p className="recent-task-title">{task.title}</p>
                    <p className="recent-task-meta">
                      {task.project_name} {task.assignee_name ? `· ${task.assignee_name}` : ''}
                    </p>
                  </div>
                  <div className="recent-task-right">
                    <StatusBadge status={task.status} />
                    {task.due_date && (
                      <span className={`meta-tag ${overdue ? 'meta-overdue' : ''}`}>
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
