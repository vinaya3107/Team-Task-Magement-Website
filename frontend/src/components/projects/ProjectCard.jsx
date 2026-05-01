import { useNavigate } from 'react-router-dom';
import { formatDate, truncate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="card project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="card-header">
        <div className="project-icon">📁</div>
        <div className="project-meta">
          <h3 className="card-title">{project.name}</h3>
          <p className="card-subtitle">by {project.creator_name}</p>
        </div>
        {isAdmin && (
          <div className="card-actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => onEdit(project)} title="Edit">✏️</button>
            <button className="icon-btn icon-btn-danger" onClick={() => onDelete(project)} title="Delete">🗑️</button>
          </div>
        )}
      </div>

      <p className="card-description">
        {project.description ? truncate(project.description, 100) : <em style={{ opacity: 0.5 }}>No description</em>}
      </p>

      <div className="card-footer">
        <span className="meta-tag">👥 {project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
        <span className="meta-tag">📅 {formatDate(project.created_at)}</span>
      </div>
    </div>
  );
}
