import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProjectForm({ project, onSuccess, onCancel }) {
  const isEdit = Boolean(project);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/projects/${project.id}`, data);
        toast.success('Project updated');
      } else {
        await api.post('/projects', data);
        toast.success('Project created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit Project' : 'Create Project'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Website Redesign"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="What is this project about?"
              {...register('description')}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
