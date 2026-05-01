import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Projects() {
  const { isAdmin }   = useAuth();
  const [projects, setProjects] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const LIMIT = 12;

  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { search, page, limit: LIMIT } });
      setProjects(res.data.data);
      setTotal(res.data.total);
    } catch (_) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="page-subtitle">{total} project{total !== 1 ? 's' : ''} found</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
            + New Project
          </button>
        )}
      </div>

      <div className="filters-bar">
        <input
          className="form-input filter-search"
          placeholder="🔍 Search projects…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>📁 No projects found. {isAdmin && 'Create one to get started!'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={(proj) => { setEditTarget(proj); setShowForm(true); }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProjectForm
          project={editTarget}
          onSuccess={() => { setShowForm(false); fetchProjects(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All tasks will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
