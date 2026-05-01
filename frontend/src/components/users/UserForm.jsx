import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function UserForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users', data);
      toast.success('User created successfully');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Create New User</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Jane Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="jane@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Min 6 characters"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" {...register('role')}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
