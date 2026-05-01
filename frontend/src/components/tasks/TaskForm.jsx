import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];

export default function TaskForm({ task, projects, users, defaultProjectId, onSuccess, onCancel }) {
  const isEdit = Boolean(task);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title:       task?.title || '',
      description: task?.description || '',
      status:      task?.status || 'Todo',
      due_date:    task?.due_date ? task.due_date.slice(0, 10) : '',
      project_id:  task?.project_id || defaultProjectId || '',
      assigned_to: task?.assigned_to || '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        project_id:  parseInt(data.project_id),
        assigned_to: data.assigned_to ? parseInt(data.assigned_to) : null,
        due_date:    data.due_date || null,
      };
      if (isEdit) {
        await api.put('/api/tasks/${task.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/api/tasks', payload);
        toast.success('Task created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Design login page"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Details about this task…"
              {...register('description')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" {...register('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" {...register('due_date')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select
                className={`form-select ${errors.project_id ? 'input-error' : ''}`}
                {...register('project_id', { required: 'Project is required' })}
              >
                <option value="">Select project</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.project_id && <p className="form-error">{errors.project_id.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" {...register('assigned_to')}>
                <option value="">Unassigned</option>
                {users?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
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
