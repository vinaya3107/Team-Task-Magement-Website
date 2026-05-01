import StatusBadge from '../common/StatusBadge';
import { formatDate, isOverdue } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export default function TaskCard({ task, onEdit, onDelete }) {
  const { isAdmin, user } = useAuth();
  const overdue = isOverdue(task.due_date, task.status);
  const canEdit = isAdmin || task.assigned_to === user?.id;

  return (
    <div className={`card task-card ${overdue ? 'task-overdue' : ''}`}>
      <div className="card-header">
        <div className="task-title-area">
          <h4 className="card-title">{task.title}</h4>
          {overdue && <span className="overdue-badge">⚠ Overdue</span>}
        </div>
        <div className="card-actions">
          <StatusBadge status={task.status} />
          {canEdit && (
            <>
              <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">✏️</button>
              {isAdmin && (
                <button className="icon-btn icon-btn-danger" onClick={() => onDelete(task)} title="Delete">🗑️</button>
              )}
            </>
          )}
        </div>
      </div>

      {task.description && (
        <p className="card-description">{task.description}</p>
      )}

      <div className="card-footer">
        <span className="meta-tag">📁 {task.project_name}</span>
        {task.assignee_name && <span className="meta-tag">👤 {task.assignee_name}</span>}
        {task.due_date && (
          <span className={`meta-tag ${overdue ? 'meta-overdue' : ''}`}>
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
